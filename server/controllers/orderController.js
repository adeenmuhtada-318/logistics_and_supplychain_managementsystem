const Order = require('../models/Order');
const User = require('../models/User');
const mappingService = require('../services/mappingService');
const pricingService = require('../services/pricingService');
const { generateOrderNumber } = require('../utils/codeGenerators');

/**
 * @desc    Place a new delivery order (Client only)
 *          Computes route + fare automatically, then awaits payment confirmation.
 * @route   POST /api/orders
 * @access  Private (Client)
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      pickup,
      dropoff,
      cargoWeightKg,
      cargoDescription,
      priority,
      cargoType,
      contactPersonName,
      contactMobile,
      companyNtn,
      notes,
    } = req.body;

    // ── Mandatory field validation ─────────────────────────────────────────
    if (!pickup || !pickup.province || !pickup.city || !pickup.streetAddress) {
      return res.status(400).json({ success: false, message: 'Pickup location details are incomplete (province, city, streetAddress required).' });
    }
    if (!dropoff || !dropoff.province || !dropoff.city || !dropoff.streetAddress) {
      return res.status(400).json({ success: false, message: 'Drop-off location details are incomplete (province, city, streetAddress required).' });
    }
    if (!cargoWeightKg || isNaN(Number(cargoWeightKg)) || Number(cargoWeightKg) < 1) {
      return res.status(400).json({ success: false, message: 'Cargo weight (kg) is required and must be at least 1 kg.' });
    }
    if (!cargoDescription || cargoDescription.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Cargo description is required.' });
    }
    if (!contactPersonName || contactPersonName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Contact person name is required.' });
    }
    if (!contactMobile || contactMobile.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Contact mobile number is required.' });
    }

    const resolvedPriority = ['Standard', 'Express'].includes(priority) ? priority : 'Standard';

    // ── Auto-calculate distance & route ────────────────────────────────────
    const pickupCoords  = mappingService.getCityCoordinates(pickup.city);
    const dropoffCoords = mappingService.getCityCoordinates(dropoff.city);

    const { distanceKm, durationHours, source: distanceSource } =
      await mappingService.getDistanceAndDuration(
        pickupCoords  || { lat: 30.3753, lng: 69.3451 }, // Pakistan centroid fallback
        dropoffCoords || { lat: 30.3753, lng: 69.3451 }
      );

    // ── Auto-calculate fare ────────────────────────────────────────────────
    const fareResult = await pricingService.calculateFare({
      distanceKm,
      cargoWeightKg: Number(cargoWeightKg),
      priority: resolvedPriority,
      cargoType: cargoType || 'General',
    });

    // Set expiry 72 hours from now
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      client: req.user._id,
      pickup,
      dropoff,
      cargoDescription,
      cargoWeightKg:    Number(cargoWeightKg),
      cargoType:        cargoType || 'General',
      priority:         resolvedPriority,
      contactPersonName,
      contactMobile,
      companyNtn:       companyNtn || '',
      specialInstructions: notes || '',
      calculatedDistanceKm:    distanceKm,
      calculatedDurationHours: durationHours,
      distanceSource,
      estimatedFarePKR:  fareResult.totalFare,
      fareBreakdown: {
        baseFare:        fareResult.baseFare,
        weightSurcharge: fareResult.weightSurcharge || 0,
        priorityPremium: fareResult.priorityPremium,
        totalFare:       fareResult.totalFare,
      },
      status:        'Pending-Payment',
      paymentStatus: 'Unpaid',
      expiresAt,
      checkpoints: [{
        status:    'Order Placed',
        location:  pickup.city,
        notes:     'Order placed — awaiting payment confirmation.',
        timestamp: new Date(),
      }],
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name corporateProfile.companyName')
      .select('-internalCost -profitMarginPKR -profitMarginPct -driverOfferHistory');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Client confirms dummy payment — pushes order into driver broadcast queue
 * @route   PATCH /api/orders/:id/confirm-payment
 * @access  Private (Client)
 */
const confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Only the owning client may confirm
    if (order.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm payment for this order.' });
    }

    if (order.status !== 'Pending-Payment') {
      return res.status(400).json({ success: false, message: `Payment already confirmed or order is in state: ${order.status}` });
    }

    // ── Dummy payment bypass — no gateway validation ──────────────────────
    order.paymentStatus = 'Confirmed-Payment';
    order.paymentMethod = 'Dummy-Bypass';
    order.paidAt        = new Date();
    order.status        = 'Pending-Driver-Consent';

    order.checkpoints.push({
      status:    'Fare Estimated',
      location:  order.pickup.city,
      notes:     'Dummy payment confirmed. Order broadcast to available drivers.',
      timestamp: new Date(),
    });

    await order.save();

    // ── Broadcast to all available drivers in the area ────────────────────
    const { broadcastToDrivers } = require('../services/smartMatchService');
    broadcastToDrivers(order._id).catch((err) =>
      console.warn('[PaymentConfirm] Broadcast warning:', err.message)
    );

    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name corporateProfile.companyName')
      .select('-internalCost -profitMarginPKR -profitMarginPct -driverOfferHistory');

    res.status(200).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Client sees own; Driver sees broadcast queue or assigned; Admin sees all)
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    let filter = {};

    if (req.user.role === 'Client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'Driver') {
      // Driver sees orders in broadcast queue OR assigned to them
      filter.$or = [
        { status: 'Pending-Driver-Consent' },
        { assignedDriver: req.user._id },
      ];
    }
    // Admin sees all

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { cargoDescription: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Order.find(filter)
      .populate('client', 'name corporateProfile.companyName')
      .populate('assignedDriver', 'name phone')
      .sort({ createdAt: -1 });

    if (req.user.role === 'Client') {
      query = query.select('-internalCost -profitMarginPKR -profitMarginPct -driverOfferHistory');
    }

    const orders = await query;
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name corporateProfile.companyName')
      .populate('assignedDriver', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role === 'Client' && order.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    let orderData = order.toObject();
    if (req.user.role === 'Client') {
      delete orderData.internalCost;
      delete orderData.profitMarginPKR;
      delete orderData.profitMarginPct;
      delete orderData.driverOfferHistory;
    }

    res.status(200).json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Driver accepts or declines a broadcasted trip
 * @route   PATCH /api/orders/:id/driver-response
 * @access  Private (Driver)
 */
const driverConsentResponse = async (req, res, next) => {
  try {
    const { response } = req.body; // 'Accepted' or 'Declined'

    if (!['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({ success: false, message: "Response must be 'Accepted' or 'Declined'." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status !== 'Pending-Driver-Consent') {
      return res.status(400).json({ success: false, message: 'This order is no longer accepting driver responses.' });
    }

    const { handleDriverResponse } = require('../services/smartMatchService');
    await handleDriverResponse(order._id, req.user._id, response);

    const updatedOrder = await Order.findById(order._id)
      .select('-internalCost -profitMarginPKR -profitMarginPct');
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order transit status (Driver en route, Delivered, etc.)
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Driver, Admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, location, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (
      req.user.role === 'Driver' &&
      (!order.assignedDriver || order.assignedDriver.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order.' });
    }

    order.status = status;
    order.checkpoints.push({
      status:    'In Transit',
      location:  location || order.pickup.city,
      notes:     notes || `Status updated to ${status}`,
      timestamp: new Date(),
    });

    if (status === 'Delivered') {
      order.deliveredAt  = new Date();
      order.finalFarePKR = order.estimatedFarePKR;
      order.paymentStatus = 'Paid';
    }

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order (Client can cancel Pending orders; Admin can cancel any)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (Client, Admin)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (req.user.role === 'Client') {
      if (order.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (!['Pending-Fare-Estimate', 'Pending-Payment', 'Pending-Driver-Consent'].includes(order.status)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage.' });
      }
    }

    order.status             = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by user';
    order.cancelledBy        = req.user._id;
    order.checkpoints.push({
      status:    'Cancelled',
      location:  '',
      notes:     order.cancellationReason,
      timestamp: new Date(),
    });

    // Release driver if one was pending
    if (order.assignedDriver) {
      await User.findByIdAndUpdate(order.assignedDriver, {
        $set: { 'driverConsent.status': 'Idle', 'driverConsent.currentOfferId': null },
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
  confirmPayment,
  getOrders,
  getOrderById,
  driverConsentResponse,
  updateOrderStatus,
  cancelOrder,
};
