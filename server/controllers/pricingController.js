const mappingService = require('../services/mappingService');
const pricingService = require('../services/pricingService');
const PricingConfig = require('../models/PricingConfig');

const estimateFare = async (req, res, next) => {
  try {
    const { pickup, dropoff, cargoWeightKg, priority, cargoType } = req.body;
    
    const pickupCoords = await mappingService.getCityCoordinates(pickup.city);
    const dropoffCoords = await mappingService.getCityCoordinates(dropoff.city);
    
    const { distanceKm, durationHours, distanceSource } = await mappingService.getDistanceAndDuration(pickupCoords, dropoffCoords);
    
    const { estimatedFarePKR, fareBreakdown } = await pricingService.calculateFare(
      distanceKm,
      cargoWeightKg,
      priority,
      cargoType
    );
    
    res.status(200).json({
      success: true,
      data: {
        distanceKm,
        durationHours,
        distanceSource,
        estimatedFarePKR,
        fareBreakdown,
        currency: 'PKR'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPricingConfig = async (req, res, next) => {
  try {
    const config = await PricingConfig.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

const updatePricingConfig = async (req, res, next) => {
  try {
    const updateData = { ...req.body, updatedBy: req.user._id };
    let config = await PricingConfig.findOne({ isActive: true });
    
    if (config) {
      config = await PricingConfig.findByIdAndUpdate(config._id, updateData, { new: true, runValidators: true });
    } else {
      config = await PricingConfig.create(updateData);
    }
    
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  estimateFare,
  getPricingConfig,
  updatePricingConfig
};
