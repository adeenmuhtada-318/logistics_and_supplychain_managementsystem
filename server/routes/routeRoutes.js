const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Route Metrics
 *   description: Freight corridors, distance metrics, fuel estimations, and toll fees
 */

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Route Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of route corridors
 */
router.get('/', protect, getAllRoutes);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get single route by ID
 *     tags: [Route Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Route corridor details
 */
router.get('/:id', protect, getRouteById);

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create new route corridor with calculated metrics
 *     tags: [Route Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Route created
 */
router.post('/', protect, authorize('Fleet_Manager', 'Dispatcher'), createRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   put:
 *     summary: Update route corridor
 *     tags: [Route Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Route updated
 */
router.put('/:id', protect, authorize('Fleet_Manager', 'Dispatcher'), updateRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     summary: Delete route corridor
 *     tags: [Route Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Route deleted
 */
router.delete('/:id', protect, authorize('Fleet_Manager'), deleteRoute);

module.exports = router;
