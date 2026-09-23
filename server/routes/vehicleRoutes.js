const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  assignDriver,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Fleet Vehicles
 *   description: Vehicle registry, capacity, maintenance schedules, and driver assignments
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all fleet vehicles with filters
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of fleet vehicles
 */
router.get('/', protect, getAllVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle details by ID
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle details
 */
router.get('/:id', protect, getVehicleById);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Register a new vehicle in fleet
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Vehicle registered
 */
router.post('/', protect, authorize('Fleet_Manager'), createVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update vehicle specifications
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle updated
 */
router.put('/:id', protect, authorize('Fleet_Manager', 'Dispatcher'), updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}/status:
 *   patch:
 *     summary: Update vehicle status & maintenance status
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle status updated
 */
router.patch('/:id/status', protect, authorize('Fleet_Manager', 'Dispatcher'), updateVehicleStatus);

/**
 * @swagger
 * /api/vehicles/{id}/assign-driver:
 *   patch:
 *     summary: Assign driver to vehicle
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver assigned
 */
router.patch('/:id/assign-driver', protect, authorize('Fleet_Manager', 'Dispatcher'), assignDriver);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete vehicle record
 *     tags: [Fleet Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle deleted
 */
router.delete('/:id', protect, authorize('Fleet_Manager'), deleteVehicle);

module.exports = router;
