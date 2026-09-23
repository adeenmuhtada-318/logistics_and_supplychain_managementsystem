const DriverAttendance = require('../models/DriverAttendance');
const User = require('../models/User');

/**
 * @desc    Clock-In for driver shift
 * @route   POST /api/attendance/clock-in
 * @access  Private (Driver or Manager)
 */
const clockIn = async (req, res, next) => {
  try {
    const driverId = req.body.driverId || req.user.id;
    const { shiftType, notes } = req.body;

    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    // Check if already clocked in today without clocking out
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingActive = await DriverAttendance.findOne({
      driver: driverId,
      date: { $gte: todayStart },
      clockOutTime: null,
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'Driver is already clocked in for an active shift.',
        attendance: existingActive,
      });
    }

    const attendance = await DriverAttendance.create({
      driver: driverId,
      date: new Date(),
      clockInTime: new Date(),
      shiftType: shiftType || driver.shiftType || 'Morning',
      notes: notes || '',
      status: 'Present',
    });

    // Update driver status to 'On Duty'
    driver.status = 'On Duty';
    await driver.save();

    const populated = await DriverAttendance.findById(attendance._id).populate(
      'driver',
      'name email phone licenseNumber status'
    );

    res.status(201).json({
      success: true,
      message: 'Clock-in recorded successfully. Driver is now On Duty.',
      attendance: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clock-Out of current shift & compute hours
 * @route   POST /api/attendance/clock-out
 * @access  Private (Driver or Manager)
 */
const clockOut = async (req, res, next) => {
  try {
    const driverId = req.body.driverId || req.user.id;
    const { notes } = req.body;

    const attendance = await DriverAttendance.findOne({
      driver: driverId,
      clockOutTime: null,
    }).sort({ clockInTime: -1 });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No active clock-in session found for this driver.',
      });
    }

    attendance.clockOutTime = new Date();
    if (notes) {
      attendance.notes = attendance.notes ? `${attendance.notes} | ${notes}` : notes;
    }

    await attendance.save();

    // Update driver status to 'Off Duty'
    const driver = await User.findById(driverId);
    if (driver) {
      driver.status = 'Off Duty';
      await driver.save();
    }

    const populated = await DriverAttendance.findById(attendance._id).populate(
      'driver',
      'name email phone licenseNumber status'
    );

    res.status(200).json({
      success: true,
      message: `Clock-out recorded. Total shift: ${populated.totalHoursWorked} hrs (${populated.regularHours} regular, ${populated.overtimeHours} overtime).`,
      attendance: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance logs / timesheets
 * @route   GET /api/attendance
 * @access  Private
 */
const getAttendanceLogs = async (req, res, next) => {
  try {
    const { driverId, status, shiftType, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role === 'Driver') {
      query.driver = req.user.id;
    } else if (driverId && driverId !== 'All') {
      query.driver = driverId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (shiftType && shiftType !== 'All') {
      query.shiftType = shiftType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DriverAttendance.find(query)
      .populate('driver', 'name email phone licenseNumber hourlyRate status')
      .populate('verifiedBy', 'name email')
      .sort({ date: -1, clockInTime: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current driver active status / today's log
 * @route   GET /api/attendance/today
 * @access  Private
 */
const getMyTodayAttendance = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeSession = await DriverAttendance.findOne({
      driver: driverId,
      clockOutTime: null,
    }).populate('driver', 'name email phone status');

    const todayLog = await DriverAttendance.findOne({
      driver: driverId,
      date: { $gte: todayStart },
    })
      .sort({ clockInTime: -1 })
      .populate('driver', 'name email phone status');

    res.status(200).json({
      success: true,
      isClockedIn: !!activeSession,
      activeSession,
      todayLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify / Approve attendance log
 * @route   PATCH /api/attendance/:id/verify
 * @access  Private (Fleet_Manager, Accountant)
 */
const verifyAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, regularHours, overtimeHours, notes } = req.body;

    const log = await DriverAttendance.findById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    if (status) log.status = status;
    if (regularHours !== undefined) log.regularHours = Number(regularHours);
    if (overtimeHours !== undefined) log.overtimeHours = Number(overtimeHours);
    if (regularHours !== undefined || overtimeHours !== undefined) {
      log.totalHoursWorked = Number(log.regularHours) + Number(log.overtimeHours);
    }
    if (notes) log.notes = notes;
    log.verifiedBy = req.user._id;

    await log.save();

    const populated = await DriverAttendance.findById(id)
      .populate('driver', 'name email phone')
      .populate('verifiedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Attendance verified successfully',
      log: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  clockIn,
  clockOut,
  getAttendanceLogs,
  getMyTodayAttendance,
  verifyAttendance,
};
