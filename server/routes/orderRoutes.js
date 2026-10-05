const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createOrder,
  confirmPayment,
  getOrders,
  getOrderById,
  driverConsentResponse,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

router.use(protect);

// Client: place order, view own orders
router.post('/',                authorize('Client'),                    createOrder);
router.patch('/:id/confirm-payment', authorize('Client'),              confirmPayment);
router.get('/',                 authorize('Client', 'Driver', 'Admin'), getOrders);
router.get('/:id',              authorize('Client', 'Driver', 'Admin'), getOrderById);

// Driver: accept or decline broadcast trip
router.patch('/:id/driver-response', authorize('Driver'),              driverConsentResponse);

// Driver / Admin: update transit status
router.patch('/:id/status',     authorize('Driver', 'Admin'),          updateOrderStatus);

// Client / Admin: cancel order
router.patch('/:id/cancel',     authorize('Client', 'Admin'),          cancelOrder);

module.exports = router;
