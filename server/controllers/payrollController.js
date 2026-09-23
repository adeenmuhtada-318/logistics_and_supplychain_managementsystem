const Payroll = require('../models/Payroll');
const User = require('../models/User');
const DriverAttendance = require('../models/DriverAttendance');
const { generatePayrollId } = require('../utils/codeGenerators');

/**
 * @desc    Generate Payroll records for a pay period based on attendance timesheets
 * @route   POST /api/payroll/generate
 * @access  Private (Fleet_Manager, Accountant)
 */
const generatePayrollForPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, driverId, defaultAllowances, defaultDeductions } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both pay period startDate and endDate are required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Target drivers
    const driverQuery = { role: 'Driver', isActive: true };
    if (driverId && driverId !== 'All') {
      driverQuery._id = driverId;
    }

    const drivers = await User.find(driverQuery);
    const generatedSlips = [];

    for (const driver of drivers) {
      // Find attendance records within date range
      const attendanceLogs = await DriverAttendance.find({
        driver: driver._id,
        date: { $gte: start, $lte: end },
        status: { $in: ['Present', 'Late', 'Half Day'] },
      });

      let totalRegularHours = 0;
      let totalOvertimeHours = 0;

      attendanceLogs.forEach((log) => {
        totalRegularHours += log.regularHours || 0;
        totalOvertimeHours += log.overtimeHours || 0;
      });

      // If no attendance logs exist, default to 40 standard hours if none found
      if (totalRegularHours === 0 && totalOvertimeHours === 0) {
        totalRegularHours = 40.0;
        totalOvertimeHours = 4.0;
      }

      const rate = driver.hourlyRate || 28.5;
      const regularPay = Number((totalRegularHours * rate).toFixed(2));
      const overtimePay = Number((totalOvertimeHours * (rate * 1.5)).toFixed(2));

      const allowances = {
        fuelAllowance: defaultAllowances?.fuelAllowance || 75.0,
        mealAllowance: defaultAllowances?.mealAllowance || 50.0,
        hazardBonus: defaultAllowances?.hazardBonus || 0.0,
        performanceBonus: defaultAllowances?.performanceBonus || 100.0,
      };

      const sumAllowances = Object.values(allowances).reduce((acc, v) => acc + (Number(v) || 0), 0);
      const grossPay = Number((regularPay + overtimePay + sumAllowances).toFixed(2));

      // Estimated standard deductions
      const taxWithholding = Number((grossPay * 0.15).toFixed(2));
      const healthInsurance = defaultDeductions?.healthInsurance || 45.0;
      const retirement401k = Number((grossPay * 0.04).toFixed(2));

      const deductions = {
        taxWithholding,
        healthInsurance,
        retirement401k,
        otherDeductions: defaultDeductions?.otherDeductions || 0,
      };

      const sumDeductions = Object.values(deductions).reduce((acc, v) => acc + (Number(v) || 0), 0);
      const netPay = Number((grossPay - sumDeductions).toFixed(2));

      const payrollId = generatePayrollId();

      const payroll = await Payroll.create({
        payrollId,
        staff: driver._id,
        payPeriodStart: start,
        payPeriodEnd: end,
        regularHours: totalRegularHours,
        overtimeHours: totalOvertimeHours,
        hourlyRate: rate,
        regularPay,
        overtimePay,
        allowances,
        deductions,
        grossPay,
        netPay,
        paymentStatus: 'Draft',
        paymentMethod: 'Direct Deposit',
        processedBy: req.user?._id,
        notes: `Calculated from ${attendanceLogs.length} attendance timesheets.`,
      });

      generatedSlips.push(payroll);
    }

    res.status(201).json({
      success: true,
      message: `Generated ${generatedSlips.length} payroll records for pay period ${startDate} to ${endDate}.`,
      payrollSlips: generatedSlips,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payroll records
 * @route   GET /api/payroll
 * @access  Private
 */
const getAllPayroll = async (req, res, next) => {
  try {
    const { status, staffId } = req.query;
    const query = {};

    if (req.user.role === 'Driver') {
      query.staff = req.user.id;
    } else if (staffId && staffId !== 'All') {
      query.staff = staffId;
    }

    if (status && status !== 'All') {
      query.paymentStatus = status;
    }

    const payrollList = await Payroll.find(query)
      .populate('staff', 'name email phone licenseNumber hourlyRate status')
      .populate('processedBy', 'name email')
      .sort({ payPeriodEnd: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrollList.length,
      payrollList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payroll payslip by ID
 * @route   GET /api/payroll/:id
 * @access  Private
 */
const getPayrollById = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('staff', 'name email phone licenseNumber hourlyRate address')
      .populate('processedBy', 'name email');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    res.status(200).json({
      success: true,
      payroll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Payroll Status (e.g. Approve or Mark Paid)
 * @route   PATCH /api/payroll/:id/status
 * @access  Private (Fleet_Manager, Accountant)
 */
const updatePayrollStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, notes } = req.body;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    if (paymentStatus) {
      payroll.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        payroll.paidDate = new Date();
      }
    }

    if (paymentMethod) payroll.paymentMethod = paymentMethod;
    if (notes) payroll.notes = notes;

    await payroll.save();

    const populated = await Payroll.findById(id)
      .populate('staff', 'name email phone')
      .populate('processedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Payroll status updated to '${payroll.paymentStatus}'`,
      payroll: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a payroll draft record
 * @route   DELETE /api/payroll/:id
 * @access  Private (Fleet_Manager, Accountant)
 */
const deletePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findByIdAndDelete(id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll record deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePayrollForPeriod,
  getAllPayroll,
  getPayrollById,
  updatePayrollStatus,
  deletePayroll,
};
