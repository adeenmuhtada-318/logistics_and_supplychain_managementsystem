const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ─────────────────────────────────────────────
   Sub-documents
───────────────────────────────────────────── */

/**
 * Pakistan-aware address sub-document.
 * Used for both corporate registered office and driver locations.
 */
const PakistanAddressSchema = new mongoose.Schema(
  {
    province: { type: String, default: '' },
    city:     { type: String, default: '' },
    area:     { type: String, default: '' },
    street:   { type: String, default: '' },
    postalCode:{ type: String, default: '' },
    country:  { type: String, default: 'Pakistan' },
  },
  { _id: false }
);

/**
 * Corporate profile — filled in by B2B Client users.
 * Fields sourced from business registration requirements (NTN, SNTN, PTCL).
 */
const CorporateProfileSchema = new mongoose.Schema(
  {
    companyName:    { type: String, trim: true, default: '' },
    ownerName:      { type: String, trim: true, default: '' },
    description:    { type: String, trim: true, default: '' },
    contactPerson:  { type: String, trim: true, default: '' },
    contactPhone:   { type: String, trim: true, default: '' },
    ptclLandline:   { type: String, trim: true, default: '' },
    ntn:            { type: String, trim: true, uppercase: true, default: '' }, // National Tax Number
    sntn:           { type: String, trim: true, uppercase: true, default: '' }, // Sales Tax Registration Number
    registeredOffice: { type: PakistanAddressSchema, default: () => ({}) },
    isVerified:     { type: Boolean, default: false }, // Admin verifies corporate profile
    verifiedAt:     { type: Date, default: null },
  },
  { _id: false }
);

/**
 * Driver consent state — tracks their response to a matched order offer.
 */
const DriverConsentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Idle', 'Pending', 'Accepted', 'Declined', 'Timed-Out'],
      default: 'Idle',
    },
    currentOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    offeredAt:   { type: Date, default: null },
    respondedAt: { type: Date, default: null },
  },
  { _id: false }
);

/* ─────────────────────────────────────────────
   Main User Schema
───────────────────────────────────────────── */

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },

    /** Extended role enum — preserves all existing roles, adds Client & Super_Admin */
    role: {
      type: String,
      enum: ['Fleet_Manager', 'Dispatcher', 'Driver', 'Accountant', 'Client', 'Super_Admin'],
      default: 'Driver',
      index: true,
    },

    /* ── Internal staff fields (Driver / Dispatcher / Manager / Accountant) ── */
    phone:         { type: String, trim: true, default: '' },
    licenseNumber: { type: String, trim: true, default: '' },
    hourlyRate:    { type: Number, default: 25.0, min: [0, 'Hourly rate must be positive'] },
    baseSalary:    { type: Number, default: 0,    min: [0, 'Base salary must be positive'] },
    shiftType: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Long-Haul'],
      default: 'Morning',
    },
    status: {
      type: String,
      enum: ['Active', 'On Duty', 'Off Duty', 'On Leave', 'Suspended'],
      default: 'Active',
      index: true,
    },

    /** Legacy address (kept for existing Driver/Staff records) */
    address: {
      street:     { type: String, default: '' },
      city:       { type: String, default: '' },
      state:      { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country:    { type: String, default: 'Pakistan' },
    },

    /** Driver's current operating city — used for smart-matching proximity */
    currentCity:     { type: String, default: '' },
    currentProvince: { type: String, default: '' },

    /* ── B2B Client fields ── */
    corporateProfile: { type: CorporateProfileSchema, default: null },

    /* ── Driver opt-in consent state ── */
    driverConsent: { type: DriverConsentSchema, default: () => ({}) },

    /* ── Shared ── */
    avatar:   { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ─────────────────────────────────────────────
   Hooks & Methods
───────────────────────────────────────────── */

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
