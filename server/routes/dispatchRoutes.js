const express = require('express');
const router = express.Router();
const {
  createDispatch,
  getAllDispatches,
  getDispatchById,
  updateDispatchStatus,
  reportIncident,
  deleteDispatch,
} = require('../controllers/dispatchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Dispatch Logs
 *   description: Trip manifests, real-time driver/vehicle dispatching, and checkpoints
 */

/**
 * @swagger
 * /api/dispatches:
 *   get:
 *     summary: Get all dispatch logs with filters
 *     tags: [Dispatch Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of dispatches
 */
router.get('/', protect, getAllDispatches);

/**
 * @swagger
 * /api/dispatches/{id}:
 *   get:
 *     summary: Get dispatch details by ID
 *     tags: [Dispatch Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dispatch details
 */
router.get('/:id', protect, getDispatchById);

/**
 * @swagger
 * /api/dispatches:
 *   post:
 *     summary: Create a new dispatch trip
 *     tags: [Dispatch Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Dispatch scheduled
 */
router.post('/', protect, authorize('Fleet_Manager', 'Dispatcher'), createDispatch);

/**
 * @swagger
 * /api/dispatches/{id}/status:
 *   patch:
 *     summary: Advance dispatch trip status and log checkpoint
 *     tags: [Dispatch Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  protect,
  authorize('Fleet_Manager', 'Dispatcher', 'Driver'),
  updateDispatchStatus
);

/**
 * @swagger
 * /api/dispatches/{id}/incident:
 *   post:
 *     summary: Report route incident or delay on active dispatch
 *     tags: [Dispatch Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incident recorded
 */
router.post(
  '/:id/incident',
  protect,
  authorize('Fleet_Manager', 'Dispatcher', 'Driver'),
  reportIncident
);

/**
 * @swagger
 * /api/dispatches/{id}:
 *   delete:
 *     summary: Delete dispatch record
 *     tags: [Dispatch Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dispatch deleted
 */
router.delete('/:id', protect, authorize('Fleet_Manager'), deleteDispatch);

module.exports = router;
