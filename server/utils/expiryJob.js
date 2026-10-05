const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * 72-Hour Order Expiry Job
 * Runs every hour. Finds orders stuck in 'Pending-Driver-Consent' for > 72 hours
 * and automatically expires them, resetting any pending driver consent state.
 */
function startExpiryJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('⏱ [ExpiryJob] Running 72-hour order expiry check...');

    try {
      const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72 hours ago

      const expiredOrders = await Order.find({
        status: 'Pending-Driver-Consent',
        requestedAt: { $lt: cutoff },
      });

      if (expiredOrders.length === 0) {
        console.log('⏱ [ExpiryJob] No expired orders found.');
        return;
      }

      console.log(`⏱ [ExpiryJob] Found ${expiredOrders.length} order(s) to expire.`);

      for (const order of expiredOrders) {
        // Reset any pending driver consent
        const pendingOffer = order.driverOfferHistory?.find(
          (h) => h.response === 'Pending'
        );
        if (pendingOffer) {
          pendingOffer.response = 'Timed-Out';
          pendingOffer.respondedAt = new Date();

          // Also reset the driver's consent state
          await User.findByIdAndUpdate(pendingOffer.driver, {
            $set: {
              'driverConsent.status': 'Idle',
              'driverConsent.currentOfferId': null,
            },
          });
        }

        order.status = 'Expired';
        order.cancellationReason = 'Auto-expired: No rider accepted within 72 hours.';
        order.checkpoints = order.checkpoints || [];
        order.checkpoints.push({
          status: 'Cancelled',
          location: '',
          notes: 'Order auto-expired after 72 hours without driver acceptance.',
          timestamp: new Date(),
        });

        await order.save();

        // Notify client (console log — extend with email/socket later)
        console.log(
          `📧 [ExpiryJob] Client notification: Order ${order.orderNumber} (Client: ${order.client}) has been auto-expired.`
        );
      }

      console.log(`⏱ [ExpiryJob] Expired ${expiredOrders.length} order(s) successfully.`);
    } catch (error) {
      console.error('⏱ [ExpiryJob] Error during expiry check:', error.message);
    }
  });

  console.log('⏱ [ExpiryJob] 72-hour order expiry cron scheduled (runs every hour).');
}

module.exports = { startExpiryJob };
