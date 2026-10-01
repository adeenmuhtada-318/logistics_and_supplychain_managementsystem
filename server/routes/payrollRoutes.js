const express = require('express');
const router = express.Router();
const {
  generatePayrollForPeriod,
  getAllPayroll,
  getPayrollById,
  updatePayrollStatus,
  deletePayroll,
} = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payroll & Compensation
 *   description: Driver wage computation, timesheet batch processing, and payslip generation
 */

/**
 * @swagger
 * /api/payroll/generate:
 *   post:
 *     summary: Batch compute payroll for drivers based on attendance logs
 *     tags: [Payroll & Compensation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Payroll generated
 */
router.post(
  '/generate',
  protect,
  authorize('Fleet_Manager', 'Accountant'),
  generatePayrollForPeriod
);

/**
 * @swagger
 * /api/payroll:
 *   get:
 *     summary: Get all payroll records
 *     tags: [Payroll & Compensation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payroll records
 */
router.get('/', protect, authorize('Fleet_Manager', 'Accountant'), getAllPayroll);

/**
 * @swagger
 * /api/payroll/{id}:
 *   get:
 *     summary: Get single payroll payslip by ID
 *     tags: [Payroll & Compensation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payslip details
 */
router.get('/:id', protect, authorize('Fleet_Manager', 'Accountant'), getPayrollById);

/**
 * @swagger
 * /api/payroll/{id}/status:
 *   patch:
 *     summary: Update payroll status (Approve / Mark Paid)
 *     tags: [Payroll & Compensation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll status updated
 */
router.patch(
  '/:id/status',
  protect,
  authorize('Fleet_Manager', 'Accountant'),
  updatePayrollStatus
);

/**
 * @swagger
 * /api/payroll/{id}:
 *   delete:
 *     summary: Delete payroll draft record
 *     tags: [Payroll & Compensation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll deleted
 */
router.delete(
  '/:id',
  protect,
  authorize('Fleet_Manager', 'Accountant'),
  deletePayroll
);

module.exports = router;
