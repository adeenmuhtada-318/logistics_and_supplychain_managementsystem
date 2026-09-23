const Vehicle = require('../models/Vehicle');
const DispatchLog = require('../models/DispatchLog');
const RouteMetric = require('../models/RouteMetric');
const DriverAttendance = require('../models/DriverAttendance');
const Payroll = require('../models/Payroll');
const User = require('../models/User');

/**
 * @desc    Get comprehensive Fleet & Logistics KPI Analytics
 * @route   GET /api/analytics/fleet
 * @access  Private
 */
const getFleetAnalytics = async (req, res, next) => {
  try {
    // 1. Vehicles Analytics
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const inTransitVehicles = await Vehicle.countDocuments({ status: 'In Transit' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'Under Maintenance' });
    const outOfServiceVehicles = await Vehicle.countDocuments({ status: 'Out of Service' });

    const fleetUtilizationRate =
      totalVehicles > 0 ? Number(((inTransitVehicles / totalVehicles) * 100).toFixed(1)) : 0;

    // 2. Dispatch Metrics
    const totalDispatches = await DispatchLog.countDocuments();
    const activeDispatches = await DispatchLog.countDocuments({
      status: { $in: ['Assigned', 'Dispatched', 'En Route', 'At Checkpoint'] },
    });
    const deliveredDispatches = await DispatchLog.countDocuments({ status: 'Delivered' });
    const incidentDispatches = await DispatchLog.countDocuments({ status: 'Incident Reported' });

    // 3. Driver & Staff Metrics
    const totalDrivers = await User.countDocuments({ role: 'Driver' });
    const onDutyDrivers = await User.countDocuments({ role: 'Driver', status: 'On Duty' });
    const offDutyDrivers = await User.countDocuments({ role: 'Driver', status: 'Off Duty' });

    // 4. Financial & Operating Expenses
    const fuelTollAgg = await DispatchLog.aggregate([
      {
        $group: {
          _id: null,
          totalFuel: { $sum: '$fuelExpense' },
          totalToll: { $sum: '$tollExpense' },
        },
      },
    ]);

    const totalFuelExpense = fuelTollAgg.length > 0 ? Number(fuelTollAgg[0].totalFuel.toFixed(2)) : 0;
    const totalTollExpense = fuelTollAgg.length > 0 ? Number(fuelTollAgg[0].totalToll.toFixed(2)) : 0;

    const payrollAgg = await Payroll.aggregate([
      { $group: { _id: null, totalPayroll: { $sum: '$grossPay' } } },
    ]);
    const totalPayrollExpense = payrollAgg.length > 0 ? Number(payrollAgg[0].totalPayroll.toFixed(2)) : 0;
    const totalOperatingCost = Number((totalFuelExpense + totalTollExpense + totalPayrollExpense).toFixed(2));

    // 5. Vehicle Status Chart Data
    const vehicleStatusData = [
      { name: 'Available', count: availableVehicles, color: '#10b981' },
      { name: 'In Transit', count: inTransitVehicles, color: '#3b82f6' },
      { name: 'Under Maintenance', count: maintenanceVehicles, color: '#f59e0b' },
      { name: 'Out of Service', count: outOfServiceVehicles, color: '#ef4444' },
    ];

    // 6. Vehicle Type Breakdown
    const vehicleTypesAgg = await Vehicle.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const vehicleTypeData = vehicleTypesAgg.map((item) => ({
      name: item._id || 'Standard Van',
      value: item.count,
    }));

    // 7. Recent 5 Active Dispatches
    const recentDispatches = await DispatchLog.find()
      .populate('vehicle', 'plateNumber make model type')
      .populate('driver', 'name phone')
      .populate('route', 'routeCode originHub destinationHub')
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Monthly Operating Cost Trends (Mock/Historical baseline)
    const monthlyCostTrends = [
      { month: 'Mar', fuel: 2400, tolls: 450, payroll: 8200 },
      { month: 'Apr', fuel: 2890, tolls: 520, payroll: 8800 },
      { month: 'May', fuel: 3200, tolls: 610, payroll: 9400 },
      { month: 'Jun', fuel: 3100, tolls: 580, payroll: 9100 },
      { month: 'Jul', fuel: 3600, tolls: 690, payroll: 10200 },
      { month: 'Aug', fuel: totalFuelExpense || 3900, tolls: totalTollExpense || 740, payroll: totalPayrollExpense || 10800 },
    ];

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalVehicles,
          availableVehicles,
          inTransitVehicles,
          maintenanceVehicles,
          fleetUtilizationRate,
          totalDispatches,
          activeDispatches,
          deliveredDispatches,
          incidentDispatches,
          totalDrivers,
          onDutyDrivers,
          offDutyDrivers,
          totalFuelExpense,
          totalTollExpense,
          totalPayrollExpense,
          totalOperatingCost,
        },
        vehicleStatusData,
        vehicleTypeData,
        recentDispatches,
        monthlyCostTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFleetAnalytics,
};
