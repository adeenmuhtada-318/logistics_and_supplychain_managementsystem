const mongoose = require('mongoose');

/* ─────────────────────────────────────────────
   Sub-documents
───────────────────────────────────────────── */

/**
 * Location point — stores Pakistan cascading selection + free-text street.
 * Also stores lat/lng when resolved by mapping service.
 */
const LocationPointSchema = new mongoose.Schema(
  {
    province:    { type: String, required: true },
    city:        { type: String, required: true },
    area:        { type: String, default: '' },
    streetAddress: { type: String, required: true, trim: true }, // exact address / building
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    formattedAddress: { type: String, default: '' }, // resolved by mapping service
  },
  { _id: false }
);

/**
 * Checkpoint event for tracking milestones.
 * Client-visible (no internal cost data).
 */
const OrderCheckpointSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Order Placed',
        'Fare Estimated',
        'Driver Assigned',
        'Pickup',
        'In Transit',
        'At Stop',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Incident',
      ],
    },
    location:  { type: String, default: '' },
    notes:     { type: String, default: '' },
    timestamp: { type: Date,   default: Date.now },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: true }
);

/**
 * Tracks which drivers were offered this order and their response.
 * Used for routing logic when a driver declines.
 */
const DriverOfferSchema = new mongoose.Schema(
  {
    driver:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offeredAt: { type: Date, default: Date.now },
    response:  { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Timed-Out'], default: 'Pending' },
    respondedAt: { type: Date, default: null },
  },
  { _id: false }
);

/* ─────────────────────────────────────────────
   Main Order Schema
───────────────────────────────────────────── */

const OrderSchema = new mongoose.Schema(
  {
    /** Auto-generated human-readable reference */
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    /** B2B Client who placed the order */
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
      index: true,
    },

    /* ── Cargo Details ── */
    cargoDescription: { type: String, required: [true, 'Cargo description is required'], trim: true },
    cargoWeightKg:    { type: Number, required: [true, 'Cargo weight in kg is required'], min: [1, 'Minimum weight is 1 kg'] },
    cargoType: {
      type: String,
      enum: ['General', 'Fragile', 'Perishable / Cold Chain', 'Hazardous', 'Heavy Machinery', 'Electronics', 'Pharmaceutical'],
      default: 'General',
    },
    specialInstructions: { type: String, default: '' },

    /* ── Locations (Pakistan-aware) ── */
    pickup:  { type: LocationPointSchema, required: true },
    dropoff: { type: LocationPointSchema, required: true },

    /* ── Auto-Calculated by Mapping Service ── */
    calculatedDistanceKm:    { type: Number, default: null },
    calculatedDurationHours: { type: Number, default: null },
    distanceSource: {
      type: String,
      enum: ['OpenRouteService', 'GoogleMaps', 'Haversine-Fallback'],
      default: 'Haversine-Fallback',
    },

    /* ── Pricing (auto-computed) ── */
    estimatedFarePKR: { type: Number, default: null }, // shown to client
    finalFarePKR:     { type: Number, default: null }, // confirmed on delivery
    currency:         { type: String, default: 'PKR' },
    fareBreakdown: {
      baseFare:        { type: Number, default: 0 },
      weightSurcharge: { type: Number, default: 0 },
      priorityPremium: { type: Number, default: 0 },
      totalFare:       { type: Number, default: 0 },
    },

    /* ── Priority ── */
    priority: {
      type: String,
      enum: ['Standard', 'Express', 'Urgent'],
      default: 'Standard',
    },

    /* ── Assignment ── */
    assignedDriver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    default: null, index: true },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    /** Linked internal dispatch log created by operations team */
    linkedDispatch:  { type: mongoose.Schema.Types.ObjectId, ref: 'DispatchLog', default: null },

    /* ── Driver Consent Workflow ── */
    driverOfferHistory: [DriverOfferSchema], // full offer chain

    /* ── Order Status Lifecycle ── */
    status: {
      type: String,
      enum: [
        'Pending-Fare-Estimate',   // just placed, mapping service running
        'Pending-Driver-Consent',  // fare computed, matching done, awaiting driver accept
        'Driver-Accepted',         // driver accepted, vehicle en route to pickup
        'Picked-Up',               // cargo collected from client site
        'In-Transit',              // vehicle on road to destination
        'At-Stop',                 // intermediate checkpoint
        'Delivered',               // successfully delivered
        'Cancelled',               // cancelled by client or admin
        'Incident',                // incident reported mid-transit
      ],
      default: 'Pending-Fare-Estimate',
      index: true,
    },

    /** Client-visible milestone events */
    checkpoints: [OrderCheckpointSchema],

    /* ── Internal Finance (hidden from Client role) ── */
    internalCost: {
      fuelExpensePKR:        { type: Number, default: 0 },
      tollExpensePKR:        { type: Number, default: 0 },
      driverWagePKR:         { type: Number, default: 0 },
      maintenanceAllowancePKR: { type: Number, default: 0 },
      totalOperationalCostPKR: { type: Number, default: 0 },
    },
    profitMarginPKR: { type: Number, default: null },
    profitMarginPct: { type: Number, default: null },

    /* ── Payment ── */
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Invoice-Sent', 'Paid', 'Refunded'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Cheque', 'Online', 'Cash on Delivery', 'Credit'],
      default: 'Bank Transfer',
    },
    paidAt: { type: Date, default: null },

    /* ── Timestamps ── */
    requestedAt:     { type: Date, default: Date.now },
    driverAssignedAt:{ type: Date, default: null },
    pickedUpAt:      { type: Date, default: null },
    deliveredAt:     { type: Date, default: null },
    scheduledPickup: { type: Date, default: null },
    estimatedDelivery:{ type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancelledBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancellationReason: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

/* ─────────────────────────────────────────────
   Virtuals
───────────────────────────────────────────── */

/** Convenience: number of drivers who declined this order */
OrderSchema.virtual('declinedCount').get(function () {
  return this.driverOfferHistory.filter((o) => o.response === 'Declined').length;
});

/* ─────────────────────────────────────────────
   Indexes
───────────────────────────────────────────── */

OrderSchema.index({ client: 1, status: 1 });
OrderSchema.index({ assignedDriver: 1, status: 1 });
OrderSchema.index({ orderNumber: 'text', cargoDescription: 'text' });

module.exports = mongoose.model('Order', OrderSchema);
