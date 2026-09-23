const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'License plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    vin: {
      type: String,
      required: [true, 'VIN number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required (e.g. Freightliner, Ford)'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required (e.g. Cascadia, Transit 250)'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1990, 'Year must be after 1990'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    type: {
      type: String,
      enum: [
        'Cargo Van',
        'Semi-Truck',
        'Flatbed',
        'Refrigerated Truck',
        'Electric Delivery Van',
        'Box Truck',
      ],
      default: 'Cargo Van',
    },
    capacityKg: {
      type: Number,
      required: [true, 'Payload capacity in kg is required'],
      min: [100, 'Payload capacity must be at least 100 kg'],
    },
    capacityVolumeM3: {
      type: Number,
      default: 15,
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'CNG'],
      default: 'Diesel',
    },
    currentOdometerKm: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Odometer cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'In Transit', 'Under Maintenance', 'Out of Service'],
      default: 'Available',
      index: true,
    },
    lastServiceDate: {
      type: Date,
      default: Date.now,
    },
    nextServiceOdometerKm: {
      type: Number,
      default: 10000,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    currentHubLocation: {
      type: String,
      default: 'Central Depot - Chicago Hub',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

VehicleSchema.index({ plateNumber: 'text', make: 'text', model: 'text' });

module.exports = mongoose.model('Vehicle', VehicleSchema);
