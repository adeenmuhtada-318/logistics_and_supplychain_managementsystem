const mongoose = require('mongoose');

const CheckpointSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Draft',
        'Assigned',
        'Dispatched',
        'En Route',
        'At Checkpoint',
        'Delivered',
        'Incident Reported',
        'Cancelled',
      ],
    },
    location: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: true }
);

const DispatchLogSchema = new mongoose.Schema(
  {
    dispatchNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle assignment is required'],
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver assignment is required'],
      index: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RouteMetric',
      required: [true, 'Route corridor assignment is required'],
    },
    cargoDescription: {
      type: String,
      required: [true, 'Cargo description is required'],
      trim: true,
    },
    cargoWeightKg: {
      type: Number,
      required: [true, 'Cargo weight is required'],
      min: [1, 'Weight must be at least 1 kg'],
    },
    priority: {
      type: String,
      enum: ['Standard', 'Express', 'Urgent', 'Hazardous/Critical'],
      default: 'Standard',
    },
    departureTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    scheduledArrival: {
      type: Date,
      required: true,
    },
    actualArrival: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Assigned',
        'Dispatched',
        'En Route',
        'At Checkpoint',
        'Delivered',
        'Incident Reported',
        'Cancelled',
      ],
      default: 'Assigned',
      index: true,
    },
    currentLocation: {
      type: String,
      default: 'Origin Hub',
    },
    checkpoints: [CheckpointSchema],
    fuelExpense: {
      type: Number,
      default: 0,
    },
    tollExpense: {
      type: Number,
      default: 0,
    },
    incidentNotes: {
      type: String,
      default: '',
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

DispatchLogSchema.index({ dispatchNumber: 'text', cargoDescription: 'text' });

module.exports = mongoose.model('DispatchLog', DispatchLogSchema);
