const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  driverConsentResponse,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

router.use(protect);

router.post('/', authorize('Client'), createOrder);
router.get('/', authorize('Client', 'Driver', 'Fleet_Manager', 'Dispatcher', 'Accountant', 'Super_Admin'), getOrders);
router.get('/:id', authorize('Client', 'Driver', 'Fleet_Manager', 'Dispatcher', 'Accountant', 'Super_Admin'), getOrderById);
router.patch('/:id/driver-response', authorize('Driver'), driverConsentResponse);
router.patch('/:id/status', authorize('Driver', 'Dispatcher', 'Fleet_Manager', 'Super_Admin'), updateOrderStatus);
router.patch('/:id/cancel', authorize('Client', 'Fleet_Manager', 'Super_Admin'), cancelOrder);

module.exports = router;
