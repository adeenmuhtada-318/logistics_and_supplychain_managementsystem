const DispatchLog = require('../models/DispatchLog');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const RouteMetric = require('../models/RouteMetric');
const { generateDispatchNumber } = require('../utils/codeGenerators');

/**
 * @desc    Create a new trip dispatch
 * @route   POST /api/dispatches
 * @access  Private (Fleet_Manager, Dispatcher)
 */
const createDispatch = async (req, res, next) => {
  try {
    const {
      vehicleId,
      driverId,
      routeId,
      cargoDescription,
      cargoWeightKg,
      priority,
      departureTime,
      scheduledArrival,
      fuelExpense,
      tollExpense,
    } = req.body;

    const dispatchNumber = generateDispatchNumber();

    // Verify Vehicle, Driver, and Route
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const route = await RouteMetric.findById(routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route corridor not found' });
    }

    // Check payload capacity
    if (cargoWeightKg > vehicle.capacityKg) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargoWeightKg} kg) exceeds vehicle payload limit (${vehicle.capacityKg} kg).`,
      });
    }

    // Default scheduled arrival: departureTime + estimated route duration hours
    const depTime = departureTime ? new Date(departureTime) : new Date();
    const arrTime = scheduledArrival
      ? new Date(scheduledArrival)
      : new Date(depTime.getTime() + route.estimatedDurationHours * 3600000);

    const initialCheckpoint = [
      {
        status: 'Assigned',
        location: route.originHub,
        notes: `Dispatch trip manifested with driver ${driver.name} and vehicle ${vehicle.plateNumber}.`,
        timestamp: new Date(),
        recordedBy: req.user?._id,
      },
    ];

    const dispatch = await DispatchLog.create({
      dispatchNumber,
      vehicle: vehicleId,
      driver: driverId,
      route: routeId,
      cargoDescription,
      cargoWeightKg: Number(cargoWeightKg),
      priority: priority || 'Standard',
      departureTime: depTime,
      scheduledArrival: arrTime,
      status: 'Assigned',
      currentLocation: route.originHub,
      checkpoints: initialCheckpoint,
      fuelExpense: Number(fuelExpense) || route.fuelConsumedLiters * 1.2,
      tollExpense: Number(tollExpense) || route.tollExpenses,
      dispatchedBy: req.user?._id,
    });

    // Update vehicle status
    vehicle.status = 'In Transit';
    vehicle.assignedDriver = driverId;
    await vehicle.save();

    // Update driver status
    driver.status = 'On Duty';
    await driver.save();

    const populated = await DispatchLog.findById(dispatch._id)
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber status')
      .populate('route')
      .populate('dispatchedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Dispatch trip scheduled & created successfully',
      dispatch: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all dispatch logs with filtering & search
 * @route   GET /api/dispatches
 * @access  Private
 */
const getAllDispatches = async (req, res, next) => {
  try {
    const { status, priority, search, driverId, vehicleId } = req.query;
    const query = {};

    if (req.user.role === 'Driver') {
      query.driver = req.user.id;
    } else if (driverId && driverId !== 'All') {
      query.driver = driverId;
    }

    if (vehicleId && vehicleId !== 'All') {
      query.vehicle = vehicleId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { dispatchNumber: searchRegex },
        { cargoDescription: searchRegex },
        { currentLocation: searchRegex },
      ];
    }

    const dispatches = await DispatchLog.find(query)
      .populate('vehicle', 'plateNumber make model type capacityKg status')
      .populate('driver', 'name email phone licenseNumber status')
      .populate('route', 'routeCode routeName originHub destinationHub estimatedDistanceKm')
      .populate('dispatchedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      dispatches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single dispatch details with timeline
 * @route   GET /api/dispatches/:id
 * @access  Private
 */
const getDispatchById = async (req, res, next) => {
  try {
    const dispatch = await DispatchLog.findById(req.params.id)
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber status hourlyRate')
      .populate('route')
      .populate('dispatchedBy', 'name email');

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch record not found',
      });
    }

    res.status(200).json({
      success: true,
      dispatch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Dispatch Status & record checkpoint
 * @route   PATCH /api/dispatches/:id/status
 * @access  Private (Fleet_Manager, Dispatcher, Driver)
 */
const updateDispatchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location, notes, fuelExpense, tollExpense } = req.body;

    const dispatch = await DispatchLog.findById(id).populate('vehicle').populate('driver').populate('route');
    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    if (status) dispatch.status = status;
    if (location) dispatch.currentLocation = location;
    if (fuelExpense !== undefined) dispatch.fuelExpense = Number(fuelExpense);
    if (tollExpense !== undefined) dispatch.tollExpense = Number(tollExpense);

    const checkpointLocation = location || dispatch.currentLocation;
    const checkpointNotes = notes || `Status updated to ${status}`;

    dispatch.checkpoints.push({
      status: status || dispatch.status,
      location: checkpointLocation,
      notes: checkpointNotes,
      timestamp: new Date(),
      recordedBy: req.user?._id,
    });

    if (status === 'Delivered') {
      dispatch.actualArrival = new Date();

      // Free vehicle back to 'Available' and update odometer
      if (dispatch.vehicle) {
        const vehicle = await Vehicle.findById(dispatch.vehicle._id);
        if (vehicle) {
          vehicle.status = 'Available';
          if (dispatch.route && dispatch.route.estimatedDistanceKm) {
            vehicle.currentOdometerKm += dispatch.route.estimatedDistanceKm;
          }
          await vehicle.save();
        }
      }
    }

    if (status === 'Cancelled') {
      if (dispatch.vehicle) {
        await Vehicle.findByIdAndUpdate(dispatch.vehicle._id, { status: 'Available' });
      }
    }

    await dispatch.save();

    const populated = await DispatchLog.findById(id)
      .populate('vehicle')
      .populate('driver', 'name email phone status')
      .populate('route')
      .populate('dispatchedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Dispatch status updated to '${dispatch.status}'`,
      dispatch: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report Incident on an active dispatch
 * @route   POST /api/dispatches/:id/incident
 * @access  Private (Driver, Dispatcher, Manager)
 */
const reportIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { incidentNotes, location } = req.body;

    const dispatch = await DispatchLog.findById(id);
    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch record not found',
      });
    }

    dispatch.status = 'Incident Reported';
    dispatch.incidentNotes = incidentNotes;
    if (location) dispatch.currentLocation = location;

    dispatch.checkpoints.push({
      status: 'Incident Reported',
      location: location || dispatch.currentLocation,
      notes: `⚠️ INCIDENT: ${incidentNotes}`,
      timestamp: new Date(),
      recordedBy: req.user?._id,
    });

    await dispatch.save();

    res.status(200).json({
      success: true,
      message: 'Incident reported and recorded on dispatch log.',
      dispatch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete dispatch record
 * @route   DELETE /api/dispatches/:id
 * @access  Private (Fleet_Manager)
 */
const deleteDispatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispatch = await DispatchLog.findByIdAndDelete(id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dispatch record deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDispatch,
  getAllDispatches,
  getDispatchById,
  updateDispatchStatus,
  reportIncident,
  deleteDispatch,
};
