const mongoose = require('mongoose');

const AllowanceSchema = new mongoose.Schema(
  {
    fuelAllowance: { type: Number, default: 0 },
    mealAllowance: { type: Number, default: 0 },
    hazardBonus: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
  },
  { _id: false }
);

const DeductionSchema = new mongoose.Schema(
  {
    taxWithholding: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    retirement401k: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
  },
  { _id: false }
);

const PayrollSchema = new mongoose.Schema(
  {
    payrollId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff / Driver reference is required'],
      index: true,
    },
    payPeriodStart: {
      type: Date,
      required: true,
    },
    payPeriodEnd: {
      type: Date,
      required: true,
    },
    regularHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    regularPay: {
      type: Number,
      default: 0,
    },
    overtimePay: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: AllowanceSchema,
      default: () => ({}),
    },
    deductions: {
      type: DeductionSchema,
      default: () => ({}),
    },
    grossPay: {
      type: Number,
      required: true,
      default: 0,
    },
    netPay: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Draft', 'Approved', 'Paid'],
      default: 'Draft',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Direct Deposit', 'Wire Transfer', 'Check'],
      default: 'Direct Deposit',
    },
    paidDate: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

module.exports = mongoose.model('Payroll', PayrollSchema);
