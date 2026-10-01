const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String, required: [true, 'License plate number is required'],
      unique: true, uppercase: true, trim: true, index: true,
    },
    vin: {
      type: String, required: [true, 'VIN number is required'],
      unique: true, uppercase: true, trim: true,
    },
    make:  { type: String, required: [true, 'Vehicle make is required'], trim: true },
    model: { type: String, required: [true, 'Vehicle model is required'], trim: true },
    year:  {
      type: Number, required: [true, 'Manufacturing year is required'],
      min: [1990, 'Year must be after 1990'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    type: {
      type: String,
      enum: ['Cargo Van', 'Semi-Truck', 'Flatbed', 'Refrigerated Truck', 'Electric Delivery Van', 'Box Truck', 'Pickup Truck', 'Tanker'],
      default: 'Cargo Van',
    },
    capacityKg:       { type: Number, required: [true, 'Payload capacity in kg is required'], min: [100, 'Payload capacity must be at least 100 kg'] },
    capacityVolumeM3: { type: Number, default: 15 },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'CNG', 'LPG'],
      default: 'Diesel',
    },
    currentOdometerKm: { type: Number, required: true, default: 0, min: [0, 'Odometer cannot be negative'] },

    status: {
      type: String,
      enum: ['Available', 'In Transit', 'Under Maintenance', 'Out of Service'],
      default: 'Available',
      index: true,
    },

    lastServiceDate:        { type: Date, default: Date.now },
    nextServiceOdometerKm:  { type: Number, default: 10000 },
    assignedDriver:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    /** Hub city name — kept for legacy display */
    currentHubLocation: { type: String, default: 'Lahore Central Depot' },

    /** NEW: Pakistan city for proximity-based smart matching */
    currentCity:     { type: String, default: '', index: true },
    currentProvince: { type: String, default: '' },

    /** NEW: GPS coordinates for advanced proximity calculations */
    gpsCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

VehicleSchema.index({ plateNumber: 'text', make: 'text', model: 'text' });
VehicleSchema.index({ currentCity: 1, status: 1, capacityKg: 1 }); // smart-match compound index

module.exports = mongoose.model('Vehicle', VehicleSchema);
