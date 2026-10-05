const express = require('express');
const router  = express.Router();
const {
  register,
  registerClient,
  login,
  getMe,
  getDrivers,
  updateDriverStatus,
} = require('../controllers/authController');
const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management for all 3 roles
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new Driver account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *               licenseNumber: { type: string }
 *               currentCity: { type: string }
 *               currentProvince: { type: string }
 *     responses:
 *       201: { description: Driver registered successfully }
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/register-client:
 *   post:
 *     summary: Register a new B2B Client account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               corporateProfile:
 *                 type: object
 *                 properties:
 *                   companyName: { type: string }
 *                   ntn: { type: string }
 *     responses:
 *       201: { description: Client registered successfully }
 */
router.post('/register-client', registerClient);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login (Client / Driver / Admin) and retrieve JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful with JWT token }
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user profile }
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/drivers:
 *   get:
 *     summary: List all driver accounts (Admin only)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of drivers }
 */
router.get('/drivers', protect, authorize('Admin'), getDrivers);

/**
 * @swagger
 * /api/auth/drivers/{id}/status:
 *   patch:
 *     summary: Update driver status (Admin or self)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/drivers/:id/status', protect, authorize('Admin', 'Driver'), updateDriverStatus);

module.exports = router;
