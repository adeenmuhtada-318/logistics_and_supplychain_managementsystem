const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const RouteMetric = require('../models/RouteMetric');
const DriverAttendance = require('../models/DriverAttendance');
const DispatchLog = require('../models/DispatchLog');
const Payroll = require('../models/Payroll');

const seedUsers = [
  {
    name: 'Marcus Sterling (Fleet Director)',
    email: 'manager@logistics.local',
    password: 'Manager@123456',
    role: 'Fleet_Manager',
    phone: '+1 (555) 301-8890',
    licenseNumber: 'CDL-IL-9812401',
    hourlyRate: 55.0,
    shiftType: 'Morning',
    status: 'Active',
    address: {
      street: '1000 Logistics Gateway',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60607',
      country: 'USA',
    },
  },
  {
    name: 'Elena Rostova (Lead Dispatcher)',
    email: 'dispatcher@logistics.local',
    password: 'Dispatcher@123456',
    role: 'Dispatcher',
    phone: '+1 (555) 442-9912',
    licenseNumber: 'CDL-IL-4419202',
    hourlyRate: 38.0,
    shiftType: 'Morning',
    status: 'Active',
    address: {
      street: '450 Fleet Boulevard',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60616',
      country: 'USA',
    },
  },
  {
    name: 'John Miller (Senior Long-Haul Driver)',
    email: 'driver.john@logistics.local',
    password: 'Driver@123456',
    role: 'Driver',
    phone: '+1 (555) 782-1144',
    licenseNumber: 'CDL-A-8849120',
    hourlyRate: 34.0,
    shiftType: 'Long-Haul',
    status: 'On Duty',
    address: {
      street: '88 Interstate Way',
      city: 'Gary',
      state: 'IN',
      postalCode: '46402',
      country: 'USA',
    },
  },
  {
    name: 'Sarah Connor (Regional Express Driver)',
    email: 'driver.sarah@logistics.local',
    password: 'Driver@123456',
    role: 'Driver',
    phone: '+1 (555) 901-2233',
    licenseNumber: 'CDL-A-9012345',
    hourlyRate: 32.0,
    shiftType: 'Morning',
    status: 'On Duty',
    address: {
      street: '124 Lakeview Drive',
      city: 'Milwaukee',
      state: 'WI',
      postalCode: '53202',
      country: 'USA',
    },
  },
  {
    name: 'Carlos Ruiz (Metro Route Courier)',
    email: 'driver.carlos@logistics.local',
    password: 'Driver@123456',
    role: 'Driver',
    phone: '+1 (555) 671-8899',
    licenseNumber: 'CDL-B-7749123',
    hourlyRate: 28.5,
    shiftType: 'Evening',
    status: 'Off Duty',
    address: {
      street: '310 Archer Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60608',
      country: 'USA',
    },
  },
  {
    name: 'Amanda Brooks (Payroll & Controller)',
    email: 'accountant@logistics.local',
    password: 'Accountant@123456',
    role: 'Accountant',
    phone: '+1 (555) 883-9901',
    licenseNumber: '',
    hourlyRate: 48.0,
    shiftType: 'Morning',
    status: 'Active',
    address: {
      street: '200 Financial Plaza',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60606',
      country: 'USA',
    },
  },
];

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('[Seeder] Database is empty. Seeding comprehensive Logistics & Fleet Management system data...');

    // 1. Seed Users
    const createdUsers = [];
    for (const u of seedUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const manager = createdUsers.find((u) => u.role === 'Fleet_Manager');
    const dispatcher = createdUsers.find((u) => u.role === 'Dispatcher');
    const driverJohn = createdUsers.find((u) => u.email === 'driver.john@logistics.local');
    const driverSarah = createdUsers.find((u) => u.email === 'driver.sarah@logistics.local');
    const driverCarlos = createdUsers.find((u) => u.email === 'driver.carlos@logistics.local');
    const accountant = createdUsers.find((u) => u.role === 'Accountant');

    // 2. Seed Route Corridors
    const routesData = [
      {
        routeCode: 'RT-CHI-DET-01',
        routeName: 'Midwest Freight Corridor (Chicago - Detroit)',
        originHub: 'Chicago Central Depot, IL',
        destinationHub: 'Detroit Metro Gateway, MI',
        waypoints: [
          { name: 'Gary Toll Plaza', order: 1, estimatedStopMinutes: 15 },
          { name: 'Kalamazoo Logistics Yard', order: 2, estimatedStopMinutes: 45 },
          { name: 'Ann Arbor Checkpoint', order: 3, estimatedStopMinutes: 20 },
        ],
        estimatedDistanceKm: 455,
        estimatedDurationHours: 5.5,
        actualDistanceKm: 458,
        actualDurationHours: 5.6,
        fuelConsumedLiters: 136.5,
        tollExpenses: 65.0,
        carbonFootprintKg: 365.8,
        status: 'Active',
      },
      {
        routeCode: 'RT-CHI-IND-02',
        routeName: 'Great Lakes Express (Chicago - Indianapolis)',
        originHub: 'Chicago Central Depot, IL',
        destinationHub: 'Indianapolis Distribution Hub, IN',
        waypoints: [
          { name: 'Merrillville Rest Depot', order: 1, estimatedStopMinutes: 20 },
          { name: 'Lafayette Junction', order: 2, estimatedStopMinutes: 30 },
        ],
        estimatedDistanceKm: 295,
        estimatedDurationHours: 3.8,
        actualDistanceKm: 295,
        actualDurationHours: 3.7,
        fuelConsumedLiters: 88.5,
        tollExpenses: 35.0,
        carbonFootprintKg: 237.1,
        status: 'Active',
      },
      {
        routeCode: 'RT-CHI-MIL-03',
        routeName: 'North Shore Shuttle (Chicago - Milwaukee)',
        originHub: 'Chicago Central Depot, IL',
        destinationHub: 'Milwaukee Port Terminal, WI',
        waypoints: [
          { name: 'Waukegan Staging Yard', order: 1, estimatedStopMinutes: 15 },
          { name: 'Kenosha Inspection Post', order: 2, estimatedStopMinutes: 20 },
        ],
        estimatedDistanceKm: 145,
        estimatedDurationHours: 2.1,
        actualDistanceKm: 147,
        actualDurationHours: 2.2,
        fuelConsumedLiters: 43.5,
        tollExpenses: 22.0,
        carbonFootprintKg: 116.5,
        status: 'Optimized',
      },
      {
        routeCode: 'RT-DET-CLE-04',
        routeName: 'Rust Belt Automotive Link (Detroit - Cleveland)',
        originHub: 'Detroit Metro Gateway, MI',
        destinationHub: 'Cleveland Cargo Center, OH',
        waypoints: [
          { name: 'Toledo Hub Yard', order: 1, estimatedStopMinutes: 35 },
          { name: 'Sandusky Rest Station', order: 2, estimatedStopMinutes: 15 },
        ],
        estimatedDistanceKm: 275,
        estimatedDurationHours: 3.5,
        actualDistanceKm: 275,
        actualDurationHours: 3.4,
        fuelConsumedLiters: 82.5,
        tollExpenses: 28.0,
        carbonFootprintKg: 221.1,
        status: 'Active',
      },
      {
        routeCode: 'RT-CHI-COL-05',
        routeName: 'Mid-Ohio Freight Route (Chicago - Columbus)',
        originHub: 'Chicago Central Depot, IL',
        destinationHub: 'Columbus Rickenbacker Terminal, OH',
        waypoints: [
          { name: 'Fort Wayne Depot', order: 1, estimatedStopMinutes: 30 },
          { name: 'Lima Intermodal Hub', order: 2, estimatedStopMinutes: 25 },
        ],
        estimatedDistanceKm: 510,
        estimatedDurationHours: 6.2,
        actualDistanceKm: 512,
        actualDurationHours: 6.4,
        fuelConsumedLiters: 153.0,
        tollExpenses: 45.0,
        carbonFootprintKg: 410.0,
        status: 'Active',
      },
    ];

    const createdRoutes = await RouteMetric.insertMany(routesData);

    // 3. Seed Vehicles
    const vehiclesData = [
      {
        plateNumber: 'FLT-9042-IL',
        vin: '1FTFW1ED8MFB12345',
        make: 'Freightliner',
        model: 'Cascadia 126 Heavy Hauler',
        year: 2024,
        type: 'Semi-Truck',
        capacityKg: 22000,
        capacityVolumeM3: 75,
        fuelType: 'Diesel',
        currentOdometerKm: 45200,
        status: 'In Transit',
        lastServiceDate: new Date(Date.now() - 86400000 * 20),
        nextServiceOdometerKm: 55000,
        assignedDriver: driverJohn._id,
        currentHubLocation: 'Gary Toll Plaza, IN',
        notes: 'Equipped with collision avoidance radar and dual fuel tanks.',
      },
      {
        plateNumber: 'FLT-3310-IN',
        vin: '1FTBR1C84KKA67890',
        make: 'Ford',
        model: 'Transit 250 High Roof',
        year: 2023,
        type: 'Cargo Van',
        capacityKg: 1950,
        capacityVolumeM3: 14,
        fuelType: 'Gasoline',
        currentOdometerKm: 28400,
        status: 'In Transit',
        lastServiceDate: new Date(Date.now() - 86400000 * 12),
        nextServiceOdometerKm: 35000,
        assignedDriver: driverSarah._id,
        currentHubLocation: 'Waukegan Staging Yard, IL',
        notes: 'Equipped with interior shelving and cargo securing rails.',
      },
      {
        plateNumber: 'FLT-7721-MI',
        vin: '2HSDCAPN5JH112233',
        make: 'Kenworth',
        model: 'T680 Thermo Reefer',
        year: 2023,
        type: 'Refrigerated Truck',
        capacityKg: 18000,
        capacityVolumeM3: 65,
        fuelType: 'Diesel',
        currentOdometerKm: 62100,
        status: 'Available',
        lastServiceDate: new Date(Date.now() - 86400000 * 5),
        nextServiceOdometerKm: 70000,
        assignedDriver: null,
        currentHubLocation: 'Chicago Central Depot, IL',
        notes: 'Thermo King multi-temp refrigeration unit inspected and certified.',
      },
      {
        plateNumber: 'FLT-5589-OH',
        vin: '7FCTGA8E9PN998877',
        make: 'Rivian',
        model: 'Commercial Delivery 700 (EV)',
        year: 2024,
        type: 'Electric Delivery Van',
        capacityKg: 1450,
        capacityVolumeM3: 19,
        fuelType: 'Electric',
        currentOdometerKm: 14300,
        status: 'Available',
        lastServiceDate: new Date(Date.now() - 86400000 * 45),
        nextServiceOdometerKm: 25000,
        assignedDriver: null,
        currentHubLocation: 'Chicago Central Depot, IL',
        notes: 'Battery health 99%, level 3 rapid charger compatible.',
      },
      {
        plateNumber: 'FLT-1140-WI',
        vin: '1NPAL40X8NN554433',
        make: 'Peterbilt',
        model: '579 Flatbed Transporter',
        year: 2022,
        type: 'Flatbed',
        capacityKg: 24000,
        capacityVolumeM3: 50,
        fuelType: 'Diesel',
        currentOdometerKm: 89300,
        status: 'Under Maintenance',
        lastServiceDate: new Date(Date.now() - 86400000 * 2),
        nextServiceOdometerKm: 90000,
        assignedDriver: null,
        currentHubLocation: 'Detroit Fleet Workshop, MI',
        notes: 'Scheduled brake pad replacement and axle alignment.',
      },
      {
        plateNumber: 'FLT-6204-IL',
        vin: 'JALE5W160M7001122',
        make: 'Isuzu',
        model: 'NPR-HD Box Truck',
        year: 2023,
        type: 'Box Truck',
        capacityKg: 6500,
        capacityVolumeM3: 28,
        fuelType: 'Diesel',
        currentOdometerKm: 34100,
        status: 'Available',
        lastServiceDate: new Date(Date.now() - 86400000 * 18),
        nextServiceOdometerKm: 45000,
        assignedDriver: null,
        currentHubLocation: 'Chicago Central Depot, IL',
        notes: 'Rear hydraulic power lift gate (2,500 lb capacity).',
      },
    ];

    const createdVehicles = await Vehicle.insertMany(vehiclesData);

    // 4. Seed Driver Attendance
    const attendanceRecords = [
      {
        driver: driverJohn._id,
        date: new Date(),
        clockInTime: new Date(Date.now() - 3600000 * 4.5),
        clockOutTime: null,
        totalHoursWorked: 4.5,
        regularHours: 4.5,
        overtimeHours: 0,
        shiftType: 'Long-Haul',
        status: 'Present',
        notes: 'Clocked in at Chicago Depot dispatch desk.',
      },
      {
        driver: driverSarah._id,
        date: new Date(),
        clockInTime: new Date(Date.now() - 3600000 * 3.2),
        clockOutTime: null,
        totalHoursWorked: 3.2,
        regularHours: 3.2,
        overtimeHours: 0,
        shiftType: 'Morning',
        status: 'Present',
        notes: 'North shore delivery route active.',
      },
      {
        driver: driverCarlos._id,
        date: new Date(Date.now() - 86400000),
        clockInTime: new Date(Date.now() - 86400000 - 3600000 * 9),
        clockOutTime: new Date(Date.now() - 86400000),
        totalHoursWorked: 9.0,
        regularHours: 8.0,
        overtimeHours: 1.0,
        shiftType: 'Evening',
        status: 'Present',
        verifiedBy: manager._id,
        notes: 'Completed metro scheduled drops.',
      },
      {
        driver: driverJohn._id,
        date: new Date(Date.now() - 86400000),
        clockInTime: new Date(Date.now() - 86400000 - 3600000 * 10),
        clockOutTime: new Date(Date.now() - 86400000),
        totalHoursWorked: 10.0,
        regularHours: 8.0,
        overtimeHours: 2.0,
        shiftType: 'Long-Haul',
        status: 'Present',
        verifiedBy: manager._id,
        notes: 'Interstate haul completed.',
      },
      {
        driver: driverSarah._id,
        date: new Date(Date.now() - 86400000),
        clockInTime: new Date(Date.now() - 86400000 - 3600000 * 8.5),
        clockOutTime: new Date(Date.now() - 86400000),
        totalHoursWorked: 8.5,
        regularHours: 8.0,
        overtimeHours: 0.5,
        shiftType: 'Morning',
        status: 'Present',
        verifiedBy: manager._id,
      },
    ];

    await DriverAttendance.insertMany(attendanceRecords);

    // 5. Seed Dispatch Logs
    const dispatchesData = [
      {
        dispatchNumber: 'DSP-8821-4901',
        vehicle: createdVehicles[0]._id, // Semi-Truck
        driver: driverJohn._id,
        route: createdRoutes[0]._id, // Chicago - Detroit
        cargoDescription: 'Precision Automotive Gearboxes & Sensors',
        cargoWeightKg: 14200,
        priority: 'Express',
        departureTime: new Date(Date.now() - 3600000 * 3),
        scheduledArrival: new Date(Date.now() + 3600000 * 2.5),
        status: 'En Route',
        currentLocation: 'Gary Toll Plaza, IN (Mile 24)',
        fuelExpense: 175.0,
        tollExpense: 65.0,
        dispatchedBy: dispatcher._id,
        checkpoints: [
          {
            status: 'En Route',
            location: 'Gary Toll Plaza, IN',
            notes: 'Cleared toll plaza. Speed 68 mph, weather clear.',
            timestamp: new Date(Date.now() - 3600000 * 1),
            recordedBy: driverJohn._id,
          },
          {
            status: 'Dispatched',
            location: 'Chicago Central Depot, IL',
            notes: 'Manifest verified and truck departed gate #4.',
            timestamp: new Date(Date.now() - 3600000 * 3),
            recordedBy: dispatcher._id,
          },
          {
            status: 'Assigned',
            location: 'Chicago Central Depot, IL',
            notes: 'Trip planned and assigned to Senior Driver John Miller.',
            timestamp: new Date(Date.now() - 3600000 * 5),
            recordedBy: dispatcher._id,
          },
        ],
      },
      {
        dispatchNumber: 'DSP-5520-1094',
        vehicle: createdVehicles[1]._id, // Ford Transit Van
        driver: driverSarah._id,
        route: createdRoutes[2]._id, // Chicago - Milwaukee
        cargoDescription: 'Medical Diagnostic Test Kits & PPE Supplies',
        cargoWeightKg: 850,
        priority: 'Urgent',
        departureTime: new Date(Date.now() - 3600000 * 2),
        scheduledArrival: new Date(Date.now() + 3600000 * 0.5),
        status: 'En Route',
        currentLocation: 'Waukegan Staging Yard, IL',
        fuelExpense: 52.0,
        tollExpense: 22.0,
        dispatchedBy: dispatcher._id,
        checkpoints: [
          {
            status: 'At Checkpoint',
            location: 'Waukegan Staging Yard, IL',
            notes: 'Package drop completed at sub-depot. Continuing to Milwaukee.',
            timestamp: new Date(Date.now() - 3600000 * 0.5),
            recordedBy: driverSarah._id,
          },
          {
            status: 'Dispatched',
            location: 'Chicago Central Depot, IL',
            notes: 'Van loaded with priority medical cargo.',
            timestamp: new Date(Date.now() - 3600000 * 2),
            recordedBy: dispatcher._id,
          },
        ],
      },
      {
        dispatchNumber: 'DSP-1029-3847',
        vehicle: createdVehicles[2]._id, // Reefer
        driver: driverCarlos._id,
        route: createdRoutes[1]._id, // Chicago - Indianapolis
        cargoDescription: 'Organic Dairy & Cold-Chain Produce',
        cargoWeightKg: 11000,
        priority: 'Standard',
        departureTime: new Date(Date.now() - 86400000),
        scheduledArrival: new Date(Date.now() - 86400000 + 3600000 * 4),
        actualArrival: new Date(Date.now() - 86400000 + 3600000 * 3.8),
        status: 'Delivered',
        currentLocation: 'Indianapolis Distribution Hub, IN',
        fuelExpense: 110.0,
        tollExpense: 35.0,
        dispatchedBy: dispatcher._id,
        checkpoints: [
          {
            status: 'Delivered',
            location: 'Indianapolis Distribution Hub, IN',
            notes: 'Cargo successfully offloaded into cold storage bay #2. POD signed.',
            timestamp: new Date(Date.now() - 86400000 + 3600000 * 3.8),
            recordedBy: driverCarlos._id,
          },
          {
            status: 'En Route',
            location: 'Lafayette Junction, IN',
            notes: 'Temperature check: -2°C confirmed normal.',
            timestamp: new Date(Date.now() - 86400000 + 3600000 * 2),
            recordedBy: driverCarlos._id,
          },
        ],
      },
    ];

    await DispatchLog.insertMany(dispatchesData);

    // 6. Seed Payroll
    const payrollData = [
      {
        payrollId: 'PAY-202608-8812',
        staff: driverJohn._id,
        payPeriodStart: new Date(Date.now() - 86400000 * 14),
        payPeriodEnd: new Date(Date.now() - 86400000 * 1),
        regularHours: 80.0,
        overtimeHours: 12.0,
        hourlyRate: 34.0,
        regularPay: 2720.0,
        overtimePay: 612.0, // 12 * 34 * 1.5
        allowances: {
          fuelAllowance: 150.0,
          mealAllowance: 120.0,
          hazardBonus: 100.0,
          performanceBonus: 200.0,
        },
        deductions: {
          taxWithholding: 585.3,
          healthInsurance: 90.0,
          retirement401k: 156.08,
          otherDeductions: 0,
        },
        grossPay: 3902.0,
        netPay: 3070.62,
        paymentStatus: 'Approved',
        paymentMethod: 'Direct Deposit',
        processedBy: accountant._id,
        notes: 'Bi-weekly payroll approved including 12 hours overtime.',
      },
      {
        payrollId: 'PAY-202608-8813',
        staff: driverSarah._id,
        payPeriodStart: new Date(Date.now() - 86400000 * 14),
        payPeriodEnd: new Date(Date.now() - 86400000 * 1),
        regularHours: 80.0,
        overtimeHours: 6.0,
        hourlyRate: 32.0,
        regularPay: 2560.0,
        overtimePay: 288.0,
        allowances: {
          fuelAllowance: 100.0,
          mealAllowance: 80.0,
          hazardBonus: 0,
          performanceBonus: 150.0,
        },
        deductions: {
          taxWithholding: 476.7,
          healthInsurance: 90.0,
          retirement401k: 127.12,
          otherDeductions: 0,
        },
        grossPay: 3178.0,
        netPay: 2484.18,
        paymentStatus: 'Paid',
        paymentMethod: 'Direct Deposit',
        paidDate: new Date(Date.now() - 86400000 * 1),
        processedBy: accountant._id,
        notes: 'Direct deposit successfully transmitted.',
      },
      {
        payrollId: 'PAY-202608-8814',
        staff: driverCarlos._id,
        payPeriodStart: new Date(Date.now() - 86400000 * 14),
        payPeriodEnd: new Date(Date.now() - 86400000 * 1),
        regularHours: 78.0,
        overtimeHours: 4.0,
        hourlyRate: 28.5,
        regularPay: 2223.0,
        overtimePay: 171.0,
        allowances: {
          fuelAllowance: 80.0,
          mealAllowance: 60.0,
          hazardBonus: 0,
          performanceBonus: 100.0,
        },
        deductions: {
          taxWithholding: 395.1,
          healthInsurance: 90.0,
          retirement401k: 105.36,
          otherDeductions: 0,
        },
        grossPay: 2634.0,
        netPay: 2043.54,
        paymentStatus: 'Draft',
        paymentMethod: 'Direct Deposit',
        processedBy: accountant._id,
        notes: 'Awaiting final manager sign-off.',
      },
    ];

    await Payroll.insertMany(payrollData);

    console.log(`[Seeder] ✅ Successfully initialized Logistics & Fleet Management System database!`);
    console.log(`[Seeder] 👑 Fleet Manager: manager@logistics.local (Password: Manager@123456)`);
    console.log(`[Seeder] 🛰️ Dispatcher: dispatcher@logistics.local (Password: Dispatcher@123456)`);
    console.log(`[Seeder] 🚚 Driver (John): driver.john@logistics.local (Password: Driver@123456)`);
    console.log(`[Seeder] 💼 Accountant: accountant@logistics.local (Password: Accountant@123456)`);
  } catch (error) {
    console.error('[Seeder] Error auto-seeding data:', error.message);
  }
};

const runManualSeed = async () => {
  try {
    const connectDB = require('../config/db');
    require('dotenv').config();
    await connectDB();

    console.log('[Seeder] Resetting database tables for fresh initialization...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await RouteMetric.deleteMany({});
    await DriverAttendance.deleteMany({});
    await DispatchLog.deleteMany({});
    await Payroll.deleteMany({});

    await autoSeedIfEmpty();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  runManualSeed();
}

module.exports = { autoSeedIfEmpty, runManualSeed };
