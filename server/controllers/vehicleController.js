const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

/**
 * @desc    Get all fleet vehicles with filtering & search
 * @route   GET /api/vehicles
 * @access  Private
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const { status, type, search, fuelType } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (fuelType && fuelType !== 'All') {
      query.fuelType = fuelType;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { plateNumber: searchRegex },
        { vin: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { currentHubLocation: searchRegex },
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate('assignedDriver', 'name email phone status licenseNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Private
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      'assignedDriver',
      'name email phone licenseNumber status'
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create / Register a new fleet vehicle
 * @route   POST /api/vehicles
 * @access  Private (Fleet_Manager)
 */
const createVehicle = async (req, res, next) => {
  try {
    const {
      plateNumber,
      vin,
      make,
      model,
      year,
      type,
      capacityKg,
      capacityVolumeM3,
      fuelType,
      currentOdometerKm,
      currentHubLocation,
      assignedDriver,
      notes,
    } = req.body;

    const existingPlate = await Vehicle.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with plate number ${plateNumber} is already registered.`,
      });
    }

    const vehicle = await Vehicle.create({
      plateNumber: plateNumber.toUpperCase(),
      vin: vin.toUpperCase(),
      make,
      model,
      year: Number(year),
      type: type || 'Cargo Van',
      capacityKg: Number(capacityKg),
      capacityVolumeM3: Number(capacityVolumeM3) || 15,
      fuelType: fuelType || 'Diesel',
      currentOdometerKm: Number(currentOdometerKm) || 0,
      currentHubLocation: currentHubLocation || 'Central Depot - Chicago Hub',
      assignedDriver: assignedDriver || null,
      notes: notes || '',
      status: 'Available',
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate(
      'assignedDriver',
      'name email phone'
    );

    res.status(201).json({
      success: true,
      message: 'Fleet vehicle registered successfully',
      vehicle: populatedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle specifications & odometer
 * @route   PUT /api/vehicles/:id
 * @access  Private (Fleet_Manager, Dispatcher)
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedDriver', 'name email phone status');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle details updated successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle operational status & maintenance log
 * @route   PATCH /api/vehicles/:id/status
 * @access  Private (Fleet_Manager, Dispatcher)
 */
const updateVehicleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, currentHubLocation, currentOdometerKm, notes } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    if (status) vehicle.status = status;
    if (currentHubLocation) vehicle.currentHubLocation = currentHubLocation;
    if (currentOdometerKm !== undefined) vehicle.currentOdometerKm = Number(currentOdometerKm);
    if (notes) vehicle.notes = notes;

    if (status === 'Available' && req.body.servicePerformed) {
      vehicle.lastServiceDate = new Date();
      vehicle.nextServiceOdometerKm = vehicle.currentOdometerKm + 10000;
    }

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: `Vehicle status changed to ${vehicle.status}`,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign or unassign a driver to a vehicle
 * @route   PATCH /api/vehicles/:id/assign-driver
 * @access  Private (Fleet_Manager, Dispatcher)
 */
const assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    vehicle.assignedDriver = driverId || null;
    await vehicle.save();

    const populated = await Vehicle.findById(id).populate(
      'assignedDriver',
      'name email phone licenseNumber status'
    );

    res.status(200).json({
      success: true,
      message: driverId ? 'Driver assigned to vehicle' : 'Driver unassigned from vehicle',
      vehicle: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a vehicle record from fleet
 * @route   DELETE /api/vehicles/:id
 * @access  Private (Fleet_Manager)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle record deleted successfully from fleet',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  assignDriver,
  deleteVehicle,
};
