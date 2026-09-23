const mongoose = require('mongoose');

const WaypointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, required: true },
    estimatedStopMinutes: { type: Number, default: 30 },
  },
  { _id: false }
);

const RouteMetricSchema = new mongoose.Schema(
  {
    routeCode: {
      type: String,
      required: [true, 'Route Code is required (e.g. RT-CHI-DET-01)'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    routeName: {
      type: String,
      required: [true, 'Route corridor name is required'],
      trim: true,
    },
    originHub: {
      type: String,
      required: [true, 'Origin Hub name / address is required'],
    },
    destinationHub: {
      type: String,
      required: [true, 'Destination Hub name / address is required'],
    },
    waypoints: [WaypointSchema],
    estimatedDistanceKm: {
      type: Number,
      required: [true, 'Estimated distance in km is required'],
      min: [1, 'Distance must be at least 1 km'],
    },
    estimatedDurationHours: {
      type: Number,
      required: [true, 'Estimated duration in hours is required'],
      min: [0.1, 'Duration must be positive'],
    },
    actualDistanceKm: {
      type: Number,
      default: 0,
    },
    actualDurationHours: {
      type: Number,
      default: 0,
    },
    fuelConsumedLiters: {
      type: Number,
      default: 0,
    },
    averageSpeedKmh: {
      type: Number,
      default: 65,
    },
    tollExpenses: {
      type: Number,
      default: 0,
    },
    carbonFootprintKg: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Optimized', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RouteMetric', RouteMetricSchema);
