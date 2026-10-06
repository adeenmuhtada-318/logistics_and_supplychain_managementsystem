const mappingService = require('../services/mappingService');
const pricingService = require('../services/pricingService');
const PricingConfig = require('../models/PricingConfig');

const estimateFare = async (req, res, next) => {
  try {
    const { pickup, dropoff, cargoWeightKg, priority, cargoType } = req.body;
    if (!pickup?.city || !dropoff?.city || !cargoWeightKg) {
      return res.status(400).json({ success: false, message: 'pickup.city, dropoff.city and cargoWeightKg are required.' });
    }

    const fallback = { lat: 30.3753, lng: 69.3451 };
    const pickupCoords  = mappingService.getCityCoordinates(pickup.city, pickup.province)   || fallback;
    const dropoffCoords = mappingService.getCityCoordinates(dropoff.city, dropoff.province) || fallback;

    const routing = await mappingService.getDistanceAndDuration(pickupCoords, dropoffCoords);
    const distanceKm = Math.max(5, Math.round(routing.distanceKm * 10) / 10);

    const fare = await pricingService.calculateFare({
      distanceKm,
      cargoWeightKg: Number(cargoWeightKg),
      priority,
      cargoType,
    });

    res.status(200).json({
      success: true,
      data: {
        distanceKm,
        durationHours: Math.max(routing.durationHours, distanceKm / 60),
        distanceSource: routing.source,
        estimatedFarePKR: fare.totalFare,
        fareBreakdown: fare,
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
