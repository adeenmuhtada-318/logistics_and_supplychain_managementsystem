const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getStaffList,
  updateStaffStatus,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication & Staff
 *   description: Staff authentication, profile details, and role directory
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new logistics staff member or driver
 *     tags: [Authentication & Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Fleet_Manager, Dispatcher, Driver, Accountant]
 *               phone:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               hourlyRate:
 *                 type: number
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login staff member and retrieve JWT token
 *     tags: [Authentication & Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication & Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/staff:
 *   get:
 *     summary: List all staff members & drivers
 *     tags: [Authentication & Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [All, Fleet_Manager, Dispatcher, Driver, Accountant]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All, Active, "On Duty", "Off Duty", "On Leave", Suspended]
 *     responses:
 *       200:
 *         description: List of staff
 */
router.get('/staff', protect, getStaffList);

/**
 * @swagger
 * /api/auth/staff/{id}/status:
 *   patch:
 *     summary: Update staff status or wage rate
 *     tags: [Authentication & Staff]
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
 *         description: Status updated
 */
router.patch('/staff/:id/status', protect, updateStaffStatus);

module.exports = router;
