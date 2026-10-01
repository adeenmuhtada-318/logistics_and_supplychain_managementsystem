const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Order = require('../models/Order');

async function findMatchCandidates(order) {
    const { pickup, cargoWeightKg } = order;
    
    let vehicles = await Vehicle.find({
        status: 'Available',
        capacityKg: { $gte: cargoWeightKg },
        currentCity: { $regex: new RegExp(`^${pickup.city}$`, 'i') }
    }).populate('assignedDriver');
    
    if (vehicles.length === 0) {
        vehicles = await Vehicle.find({
            status: 'Available',
            capacityKg: { $gte: cargoWeightKg },
            currentProvince: { $regex: new RegExp(`^${pickup.province}$`, 'i') }
        }).populate('assignedDriver');
    }

    const candidates = [];

    for (const vehicle of vehicles) {
        let driver = vehicle.assignedDriver;
        if (!driver) {
            // Find any active driver in same city
            driver = await User.findOne({
                role: 'Driver',
                status: 'Active',
                'driverConsent.status': { $ne: 'Pending' },
                city: { $regex: new RegExp(`^${pickup.city}$`, 'i') }
            });
        }
        
        if (driver && driver.driverConsent?.status !== 'Pending') {
            const isExactCity = vehicle.currentCity.toLowerCase() === pickup.city.toLowerCase();
            const capacityRatio = vehicle.capacityKg / cargoWeightKg;
            
            candidates.push({
                driver,
                vehicle,
                score: (isExactCity ? 100 : 0) + (10 / capacityRatio), // simple scoring
                isExactCity,
                capacityRatio
            });
        }
    }
    
    candidates.sort((a, b) => {
        if (a.isExactCity !== b.isExactCity) return b.isExactCity - a.isExactCity;
        if (a.capacityRatio !== b.capacityRatio) return a.capacityRatio - b.capacityRatio; // smaller ratio better
        
        const aLastActive = a.driver.lastActive ? new Date(a.driver.lastActive).getTime() : 0;
        const bLastActive = b.driver.lastActive ? new Date(b.driver.lastActive).getTime() : 0;
        return aLastActive - bLastActive; 
    });

    return candidates.slice(0, 10);
}

async function offerToNextDriver(orderId) {
    const order = await Order.findById(orderId);
    if (!order) return null;
    
    const candidates = await findMatchCandidates(order);
    
    const offeredDriverIds = (order.driverOfferHistory || []).map(h => h.driverId.toString());
    
    const nextCandidate = candidates.find(c => !offeredDriverIds.includes(c.driver._id.toString()));
    
    if (!nextCandidate) {
        return null;
    }
    
    const driver = nextCandidate.driver;
    
    driver.driverConsent = {
        status: 'Pending',
        currentOfferId: orderId,
        offeredAt: new Date()
    };
    await driver.save();
    
    order.status = 'Pending-Driver-Consent';
    order.driverOfferHistory = order.driverOfferHistory || [];
    order.driverOfferHistory.push({
        driverId: driver._id,
        offeredAt: new Date(),
        status: 'Pending'
    });
    await order.save();
    
    startConsentTimer(orderId, driver._id);
    
    return driver;
}

async function handleDriverResponse(orderId, driverId, response) {
    const order = await Order.findById(orderId);
    const driver = await User.findById(driverId);
    
    if (!order || !driver) throw new Error('Order or Driver not found');
    
    let nextDriverOffered = false;
    
    const historyEntry = order.driverOfferHistory.find(h => h.driverId.toString() === driverId.toString() && h.status === 'Pending');
    if (historyEntry) {
        historyEntry.status = response;
        historyEntry.respondedAt = new Date();
    }
    
    if (response === 'Accepted') {
        driver.driverConsent.status = 'Accepted';
        driver.driverConsent.respondedAt = new Date();
        
        order.status = 'Driver-Accepted';
        order.assignedDriver = driverId;
        order.checkpoints = order.checkpoints || [];
        order.checkpoints.push({
            status: 'Driver-Accepted',
            location: 'System',
            timestamp: new Date()
        });
        
        // Find vehicle and set In Transit
        const vehicle = await Vehicle.findOne({ assignedDriver: driverId });
        if (vehicle) {
            vehicle.status = 'In Transit';
            await vehicle.save();
        }
        
    } else if (response === 'Declined') {
        driver.driverConsent.status = 'Idle';
        driver.driverConsent.currentOfferId = null;
        driver.driverConsent.respondedAt = new Date();
        
        const nextDriver = await offerToNextDriver(orderId);
        if (nextDriver) {
            nextDriverOffered = true;
        } else {
            // no more drivers
            order.status = 'Pending-Fare-Estimate'; 
        }
    }
    
    await driver.save();
    await order.save();
    
    return { order, driver, nextDriverOffered };
}

function startConsentTimer(orderId, driverId, timeoutMs = 300000) {
    return setTimeout(async () => {
        try {
            const driver = await User.findById(driverId);
            const order = await Order.findById(orderId);
            
            if (driver && driver.driverConsent?.currentOfferId?.toString() === orderId.toString() && driver.driverConsent?.status === 'Pending') {
                driver.driverConsent.status = 'Timed-Out';
                driver.driverConsent.currentOfferId = null;
                await driver.save();
                
                if (order) {
                    const historyEntry = order.driverOfferHistory.find(h => h.driverId.toString() === driverId.toString() && h.status === 'Pending');
                    if (historyEntry) {
                        historyEntry.status = 'Timed-Out';
                        historyEntry.respondedAt = new Date();
                        await order.save();
                    }
                    
                    await offerToNextDriver(orderId);
                }
            }
        } catch (error) {
            console.error('Consent timer error:', error);
        }
    }, timeoutMs);
}

module.exports = {
    findMatchCandidates,
    offerToNextDriver,
    handleDriverResponse,
    startConsentTimer
};
