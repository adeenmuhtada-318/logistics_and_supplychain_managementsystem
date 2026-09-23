const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getAttendanceLogs,
  getMyTodayAttendance,
  verifyAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Driver Attendance
 *   description: Driver punch clock, daily shift timesheets, and overtime tracking
 */

/**
 * @swagger
 * /api/attendance/clock-in:
 *   post:
 *     summary: Clock-in for daily driver shift
 *     tags: [Driver Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Shift started and status set to On Duty
 */
router.post('/clock-in', protect, clockIn);

/**
 * @swagger
 * /api/attendance/clock-out:
 *   post:
 *     summary: Clock-out of current shift & compute total hours
 *     tags: [Driver Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shift ended and hours calculated
 */
router.post('/clock-out', protect, clockOut);

/**
 * @swagger
 * /api/attendance/today:
 *   get:
 *     summary: Check today's active shift status for current driver
 *     tags: [Driver Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active attendance status
 */
router.get('/today', protect, getMyTodayAttendance);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance timesheets with filters
 *     tags: [Driver Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of timesheet logs
 */
router.get('/', protect, getAttendanceLogs);

/**
 * @swagger
 * /api/attendance/{id}/verify:
 *   patch:
 *     summary: Verify & approve timesheet hours
 *     tags: [Driver Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance verified
 */
router.patch('/:id/verify', protect, authorize('Fleet_Manager', 'Accountant'), verifyAttendance);

module.exports = router;
