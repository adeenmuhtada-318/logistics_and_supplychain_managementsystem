const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { estimateFare, getPricingConfig, updatePricingConfig } = require('../controllers/pricingController');

// Public fare estimate — no auth required (client uses this before login too)
router.post('/estimate', estimateFare);

// Admin config management
router.get('/config',  protect, authorize('Super_Admin', 'Fleet_Manager'), getPricingConfig);
router.put('/config',  protect, authorize('Super_Admin'), updatePricingConfig);

module.exports = router;
