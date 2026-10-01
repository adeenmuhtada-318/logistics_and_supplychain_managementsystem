const mongoose = require('mongoose');

/**
 * Dynamic fare configuration — editable by Super_Admin via UI.
 * One singleton document is kept; if missing, code falls back to constants.
 */
const PricingConfigSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: 'Default Pakistan Freight Rate Card',
      trim: true,
    },

    /** Rate per km (PKR) based on cargo weight bands */
    weightTiers: {
      type: [
        {
          minWeightKg: { type: Number, required: true },
          maxWeightKg: { type: Number, required: true }, // use Infinity-equivalent: 999999
          ratePerKm:   { type: Number, required: true }, // PKR per km
          _id: false,
        },
      ],
      default: [
        { minWeightKg: 0,    maxWeightKg: 1000,   ratePerKm: 350  }, // ≤ 1 tonne
        { minWeightKg: 1001, maxWeightKg: 5000,   ratePerKm: 600  }, // 1–5 tonnes
        { minWeightKg: 5001, maxWeightKg: 20000,  ratePerKm: 950  }, // 5–20 tonnes
        { minWeightKg: 20001,maxWeightKg: 999999, ratePerKm: 1400 }, // > 20 tonnes
      ],
    },

    /** Priority multipliers on top of base fare */
    priorityMultipliers: {
      type: Map,
      of: Number,
      default: () => ({
        Standard: 1.0,
        Express:  1.35,
        Urgent:   1.7,
      }),
    },

    /** Minimum fare regardless of distance/weight (PKR) */
    minimumFarePKR: { type: Number, default: 1500 },

    /** Per-tonne flat surcharge for Hazardous cargo (PKR) */
    hazardousSurchargePKR: { type: Number, default: 3000 },

    /** Platform service fee % added on top of dynamic fare */
    serviceFeePercent: { type: Number, default: 5.0 },

    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingConfig', PricingConfigSchema);
