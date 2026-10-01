const Order = require('../models/Order');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const mappingService = require('../services/mappingService');
const smartMatchService = require('../services/smartMatchService');
const pricingService = require('../services/pricingService');
const { generateOrderNumber } = require('../utils/codeGenerators');

const createOrder = async (req, res, next) => {
  try {
    const { pickup, dropoff, cargoDescription, cargoWeightKg, priority, cargoType } = req.body;

    if (!pickup || !pickup.province || !pickup.city || !pickup.streetAddress) {
      return res.status(400).json({ success: false, message: 'Pickup details are incomplete' });
    }
    if (!dropoff || !dropoff.province || !dropoff.city || !dropoff.streetAddress) {
      return res.status(400).json({ success: false, message: 'Dropoff details are incomplete' });
    }
    if (!cargoDescription || !cargoWeightKg) {
      return res.status(400).json({ success: false, message: 'Cargo details are required' });
    }

    const pickupCoords = await mappingService.getCityCoordinates(pickup.city);
    const dropoffCoords = await mappingService.getCityCoordinates(dropoff.city);

    const { distanceKm, durationHours, distanceSource } = await mappingService.getDistanceAndDuration(pickupCoords, dropoffCoords);
    const { estimatedFarePKR, fareBreakdown } = await pricingService.calculateFare(distanceKm, cargoWeightKg, priority, cargoType);

    let order = await Order.create({
      orderNumber: generateOrderNumber(),
      client: req.user._id,
      pickup,
      dropoff,
      cargoDescription,
      cargoWeightKg,
      priority,
      cargoType,
      calculatedDistanceKm: distanceKm,
      calculatedDurationHours: durationHours,
      distanceSource,
      estimatedFarePKR,
      fareBreakdown,
      status: 'Pending-Fare-Estimate',
      checkpoints: [{ status: 'Pending-Fare-Estimate', location: pickup.city, notes: 'Order Placed', timestamp: new Date() }]
    });

    order.status = 'Pending-Driver-Consent';
    order.checkpoints.push({ status: 'Pending-Driver-Consent', location: pickup.city, notes: 'Awaiting Driver Consent', timestamp: new Date() });
    await order.save();

    const offeredDriver = await smartMatchService.offerToNextDriver(order._id);
    if (offeredDriver) {
      await smartMatchService.startConsentTimer(order._id, offeredDriver._id);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name corporateProfile.companyName')
      .select('-internalCost -profitMarginPKR -profitMarginPct -totalOperationalCostPKR -driverOfferHistory');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    let filter = {};

    if (req.user.role === 'Client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'Driver') {
      filter.assignedDriver = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { cargoDescription: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Order.find(filter)
      .populate('client', 'name corporateProfile.companyName')
      .populate('assignedDriver', 'name phone')
      .populate('assignedVehicle', 'plateNumber type')
      .sort({ createdAt: -1 });

    if (req.user.role === 'Client') {
      query = query.select('-internalCost -profitMarginPKR -profitMarginPct -totalOperationalCostPKR -driverOfferHistory');
    }

    const orders = await query;
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name corporateProfile.companyName')
      .populate('assignedDriver', 'name phone')
      .populate('assignedVehicle', 'plateNumber type');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role === 'Client' && order.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    let orderData = order.toObject();
    if (req.user.role === 'Client') {
      delete orderData.internalCost;
      delete orderData.profitMarginPKR;
      delete orderData.profitMarginPct;
      delete orderData.totalOperationalCostPKR;
      delete orderData.driverOfferHistory;
    }

    res.status(200).json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
};

const driverConsentResponse = async (req, res, next) => {
  try {
    const { response } = req.body;
    const orderId = req.params.id;

    if (req.user.role !== 'Driver') {
      return res.status(403).json({ success: false, message: 'Only drivers can respond to consent offers' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isCurrentDriver = order.driverOfferHistory && 
                            order.driverOfferHistory.length > 0 && 
                            order.driverOfferHistory[order.driverOfferHistory.length - 1].driverId.toString() === req.user._id.toString() &&
                            order.driverOfferHistory[order.driverOfferHistory.length - 1].status === 'Pending';

    if (!isCurrentDriver) {
      return res.status(400).json({ success: false, message: 'You are not the currently offered driver for this order' });
    }

    await smartMatchService.handleDriverResponse(orderId, req.user._id, response);

    const updatedOrder = await Order.findById(orderId).select('-internalCost -profitMarginPKR -profitMarginPct -totalOperationalCostPKR -driverOfferHistory');
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, location, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'Driver' && (!order.assignedDriver || order.assignedDriver.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.status = status;
    order.checkpoints.push({
      status,
      location: location || order.pickup.city,
      notes: notes || `Status updated to ${status}`,
      timestamp: new Date()
    });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.finalFarePKR = order.estimatedFarePKR;
      if (order.internalCost) {
        order.profitMarginPKR = order.finalFarePKR - order.internalCost;
        order.profitMarginPct = (order.profitMarginPKR / order.internalCost) * 100;
      }
    }

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'Client') {
      if (order.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (!order.status.startsWith('Pending-')) {
        return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });
      }
    }

    order.status = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by user';
    order.cancelledBy = req.user._id;
    order.checkpoints.push({
      status: 'Cancelled',
      location: '',
      notes: order.cancellationReason,
      timestamp: new Date()
    });

    if (order.assignedDriver) {
      await User.findByIdAndUpdate(order.assignedDriver, {
        $set: { 'driverConsent.status': 'Idle' }
      });
    }
    if (order.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(order.assignedVehicle, {
        status: 'Available'
      });
    }

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  driverConsentResponse,
  updateOrderStatus,
  cancelOrder
};
