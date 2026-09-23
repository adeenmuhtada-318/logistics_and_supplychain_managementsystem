const mongoose = require('mongoose');

const DriverAttendanceSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver ID reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      default: Date.now,
      index: true,
    },
    clockInTime: {
      type: Date,
      required: [true, 'Clock-in timestamp is required'],
    },
    clockOutTime: {
      type: Date,
      default: null,
    },
    totalHoursWorked: {
      type: Number,
      default: 0,
      min: 0,
    },
    regularHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    shiftType: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Long-Haul'],
      default: 'Morning',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'Absent', 'On Leave'],
      default: 'Present',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate hours automatically if clockOutTime is present
DriverAttendanceSchema.pre('save', function (next) {
  if (this.clockInTime && this.clockOutTime) {
    const diffMs = new Date(this.clockOutTime) - new Date(this.clockInTime);
    const hours = Math.max(0, diffMs / (1000 * 60 * 60));
    this.totalHoursWorked = Number(hours.toFixed(2));
    
    // Regular shift is up to 8.0 hours; anything above is Overtime
    if (this.totalHoursWorked > 8.0) {
      this.regularHours = 8.0;
      this.overtimeHours = Number((this.totalHoursWorked - 8.0).toFixed(2));
    } else {
      this.regularHours = this.totalHoursWorked;
      this.overtimeHours = 0;
    }
  }
  next();
});

module.exports = mongoose.model('DriverAttendance', DriverAttendanceSchema);
