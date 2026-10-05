const User  = require('../models/User');
const Order = require('../models/Order');

/**
 * Broadcast an order to ALL available drivers in or near the pickup city.
 * Replaces the old sequential one-by-one offer logic with an opt-in broadcast model:
 * every online Driver with status 'Active' sees the trip and can Accept or Decline.
 *
 * The order stays in 'Pending-Driver-Consent' until the first driver accepts,
 * or until the 72-hour expiry cron cancels it.
 */
async function broadcastToDrivers(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Find all active drivers (in same city first, then province)
  let drivers = await User.find({
    role: 'Driver',
    status: { $in: ['Active', 'Off Duty'] }, // Available / not suspended
    'driverConsent.status': { $ne: 'Accepted' }, // not locked to another order
    currentCity: { $regex: new RegExp(`^${order.pickup.city}$`, 'i') },
  });

  // If no city match, broaden to province
  if (drivers.length === 0) {
    drivers = await User.find({
      role: 'Driver',
      status: { $in: ['Active', 'Off Duty'] },
      'driverConsent.status': { $ne: 'Accepted' },
      currentProvince: { $regex: new RegExp(`^${order.pickup.province}$`, 'i') },
    });
  }

  if (drivers.length === 0) {
    console.log(`[SmartMatch] No available drivers for order ${order.orderNumber}. Order will wait in broadcast queue.`);
    return;
  }

  console.log(`[SmartMatch] Broadcasting order ${order.orderNumber} to ${drivers.length} driver(s).`);

  // Mark each driver as having a pending offer (visibility flag)
  for (const driver of drivers) {
    // Only add if not already in offer history
    const alreadyOffered = order.driverOfferHistory.some(
      (h) => h.driver.toString() === driver._id.toString()
    );
    if (!alreadyOffered) {
      order.driverOfferHistory.push({
        driver:    driver._id,
        offeredAt: new Date(),
        response:  'Pending',
      });
    }

    // Update driver's consent state to show this order
    if (driver.driverConsent?.status !== 'Accepted') {
      driver.driverConsent = {
        status:         'Pending',
        currentOfferId: orderId,
        offeredAt:      new Date(),
      };
      await driver.save();
    }
  }

  await order.save();
}

/**
 * Handle a driver's explicit Accept or Decline response to a broadcasted trip.
 *
 * Accept  → locks the order to that driver, sets status 'Driver-Accepted',
 *           clears all other pending driver offers.
 * Decline → marks that driver's offer as Declined, frees them to see other orders,
 *           order stays in broadcast queue for remaining drivers.
 */
async function handleDriverResponse(orderId, driverId, response) {
  const [order, driver] = await Promise.all([
    Order.findById(orderId),
    User.findById(driverId),
  ]);

  if (!order || !driver) throw new Error('Order or Driver not found.');

  // Find this driver's entry in the offer history
  const historyEntry = order.driverOfferHistory.find(
    (h) => h.driver.toString() === driverId.toString() && h.response === 'Pending'
  );

  if (!historyEntry) {
    throw new Error('No pending offer found for this driver on this order.');
  }

  if (response === 'Accepted') {
    // ── Lock order to this driver ────────────────────────────────────────
    historyEntry.response    = 'Accepted';
    historyEntry.respondedAt = new Date();

    order.status         = 'Driver-Accepted';
    order.assignedDriver = driverId;
    order.driverAssignedAt = new Date();
    order.checkpoints.push({
      status:    'Driver Assigned',
      location:  order.pickup.city,
      notes:     `Driver ${driver.name} accepted the trip.`,
      timestamp: new Date(),
    });

    // Decline all other pending offers for this order
    for (const h of order.driverOfferHistory) {
      if (h.driver.toString() !== driverId.toString() && h.response === 'Pending') {
        h.response    = 'Declined';
        h.respondedAt = new Date();

        // Reset the other driver's consent state
        await User.findByIdAndUpdate(h.driver, {
          $set: { 'driverConsent.status': 'Idle', 'driverConsent.currentOfferId': null },
        });
      }
    }

    // Lock accepting driver's consent state
    driver.driverConsent = {
      status:         'Accepted',
      currentOfferId: orderId,
      respondedAt:    new Date(),
    };

  } else if (response === 'Declined') {
    // ── Driver opts out, stays available for other trips ─────────────────
    historyEntry.response    = 'Declined';
    historyEntry.respondedAt = new Date();

    driver.driverConsent = {
      status:         'Idle',
      currentOfferId: null,
      respondedAt:    new Date(),
    };

    // Check if any other drivers still have a Pending offer; if none, log it
    const remainingPending = order.driverOfferHistory.filter((h) => h.response === 'Pending');
    if (remainingPending.length === 0) {
      console.log(`[SmartMatch] All drivers declined order ${order.orderNumber}. Stays in broadcast queue until expiry.`);
    }
  }

  await Promise.all([order.save(), driver.save()]);

  return { order, driver };
}

module.exports = {
  broadcastToDrivers,
  handleDriverResponse,
};
