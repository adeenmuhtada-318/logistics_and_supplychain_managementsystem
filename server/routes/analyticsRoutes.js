const express = require('express');
const router = express.Router();
const { getFleetAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Fleet Analytics
 *   description: Executive dashboard KPIs, fleet utilization, operating cost summaries
 */

/**
 * @swagger
 * /api/analytics/fleet:
 *   get:
 *     summary: Retrieve aggregate statistics and KPI metrics for logistics dashboard
 *     tags: [Fleet Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logistics KPI metrics
 */
router.get('/fleet', protect, getFleetAnalytics);

module.exports = router;
