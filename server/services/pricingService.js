const PricingConfig = require('../models/PricingConfig');

const DEFAULT_CONFIG = {
    minimumFare: 1000,
    serviceFeePercent: 5.0,
    hazardousSurchargeAmount: 2000,
    priorityMultipliers: {
        Standard: 1.0,
        Express: 1.35,
        Urgent: 1.7
    },
    weightTiers: [
        { minWeightKg: 0, maxWeightKg: 100, ratePerKm: 50 },
        { minWeightKg: 101, maxWeightKg: 500, ratePerKm: 100 },
        { minWeightKg: 501, maxWeightKg: 1000, ratePerKm: 150 },
        { minWeightKg: 1001, maxWeightKg: 5000, ratePerKm: 250 },
        { minWeightKg: 5001, maxWeightKg: 999999, ratePerKm: 400 }
    ]
};

async function getActivePricingConfig() {
    try {
        const config = await PricingConfig.findOne({ isActive: true }).lean();
        if (config) {
            return config;
        }
    } catch (error) {
        console.warn('Could not fetch active pricing config, using defaults:', error.message);
    }
    return DEFAULT_CONFIG;
}

async function calculateFare({ distanceKm, cargoWeightKg, priority = 'Standard', cargoType = '' }) {
    const config = await getActivePricingConfig();
    
    let multipliers = config.priorityMultipliers || DEFAULT_CONFIG.priorityMultipliers;
    if (multipliers instanceof Map) multipliers = Object.fromEntries(multipliers);
    const priorityMultiplier = multipliers[priority] || 1.0;
    
    let ratePerKm = 0;
    const tiers = config.weightTiers || DEFAULT_CONFIG.weightTiers;
    for (const tier of tiers) {
        if (cargoWeightKg >= tier.minWeightKg && cargoWeightKg <= tier.maxWeightKg) {
            ratePerKm = tier.ratePerKm;
            break;
        }
    }
    
    // Fallback if no tier matches (unlikely if last tier is huge)
    if (ratePerKm === 0 && tiers.length > 0) {
        ratePerKm = tiers[tiers.length - 1].ratePerKm;
    }
    
    const baseFare = distanceKm * ratePerKm;
    const weightSurcharge = 0; // factored into ratePerKm selection by weight
    const priorityPremium = baseFare * (priorityMultiplier - 1.0);
    
    const hazardousAmount = config.hazardousSurchargeAmount ?? config.hazardousSurchargePKR ?? DEFAULT_CONFIG.hazardousSurchargeAmount;
    let hazardousSurcharge = 0;
    if (typeof cargoType === 'string' && cargoType.toLowerCase().includes('hazardous')) {
        hazardousSurcharge = hazardousAmount;
    } else if (Array.isArray(cargoType) && cargoType.some(t => t.toLowerCase().includes('hazardous'))) {
        hazardousSurcharge = hazardousAmount;
    }
    
    const subtotal = baseFare + priorityPremium + weightSurcharge + hazardousSurcharge;
    const serviceFeePercent = config.serviceFeePercent ?? DEFAULT_CONFIG.serviceFeePercent;
    const serviceFee = subtotal * (serviceFeePercent / 100);
    
    const minFare = config.minimumFare ?? config.minimumFarePKR ?? DEFAULT_CONFIG.minimumFare;
    const calculatedTotal = subtotal + serviceFee;
    const totalFare = Math.round(Math.max(minFare, calculatedTotal));
    
    return {
        baseFare: Math.round(baseFare),
        weightSurcharge: Math.round(weightSurcharge),
        priorityPremium: Math.round(priorityPremium),
        serviceFee: Math.round(serviceFee),
        hazardousSurcharge: Math.round(hazardousSurcharge),
        totalFare,
        currency: 'PKR',
        distanceKm,
        ratePerKm,
        priorityMultiplier
    };
}

module.exports = {
    getActivePricingConfig,
    calculateFare
};
