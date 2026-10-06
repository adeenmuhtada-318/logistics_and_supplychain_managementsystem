require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Order = require('../models/Order');

const ORDER_PREFIX = 'DRIVER-DEMO-';

const seedDriverData = async ({ reset = false } = {}) => {
  const existingDemoOrders = await Order.countDocuments({ orderNumber: { $regex: `^${ORDER_PREFIX}` } });
  if (existingDemoOrders > 0 && !reset) {
    console.log(`[Seed Driver] ${existingDemoOrders} demo trips already available.`);
    return;
  }

  let driver = await User.findOne({ email: 'driver@fleetcore.local' });
  if (!driver) {
    driver = await User.create({
      name: 'Ahmed Raza (Demo Rider)',
      email: 'driver@fleetcore.local',
      password: 'Driver@123456',
      role: 'Driver',
      phone: '0300-1234567',
      licenseNumber: 'PB-LHR-29182',
      currentCity: 'Lahore',
      currentProvince: 'Punjab',
      status: 'Active',
      isActive: true,
    });
  }

  let client = await User.findOne({ email: 'client@fleetcore.local' });
  if (!client) {
    client = await User.create({
      name: 'ZainCo Industries (Client)',
      email: 'client@fleetcore.local',
      password: 'Client@123456',
      role: 'Client',
      status: 'Active',
      isActive: true,
      corporateProfile: { companyName: 'ZainCo Industries (Pvt.) Ltd.' },
    });
  }

  await Order.deleteMany({ orderNumber: { $regex: `^${ORDER_PREFIX}` } });

  const routes = [
    ['Lahore', 'Islamabad', 'Model Town', 'Blue Area', 380, 57000, 'Express'],
    ['Lahore', 'Faisalabad', 'Gulberg', 'Kohinoor City', 185, 27750, 'Standard'],
    ['Lahore', 'Multan', 'Johar Town', 'Gulgasht', 345, 51750, 'Standard'],
  ];

  const orders = routes.map(([pickupCity, dropoffCity, pickupArea, dropoffArea, distanceKm, fare, priority], index) => ({
    orderNumber: `${ORDER_PREFIX}${String(index + 1).padStart(3, '0')}`,
    client: client._id,
    pickup: {
      province: 'Punjab',
      city: pickupCity,
      area: pickupArea,
      streetAddress: pickupArea,
    },
    dropoff: {
      province: dropoffCity === 'Islamabad' ? 'Islamabad Capital Territory' : 'Punjab',
      city: dropoffCity,
      area: dropoffArea,
      streetAddress: dropoffArea,
    },
    cargoDescription: ['Textile Bales', 'Electronics Crates', 'Pharmaceutical Cartons'][index],
    cargoWeightKg: [500, 280, 420][index],
    cargoType: ['General', 'Electronics', 'Pharmaceutical'][index],
    priority,
    contactPersonName: 'Demo Dispatch Desk',
    contactMobile: '03001234567',
    calculatedDistanceKm: distanceKm,
    calculatedDurationHours: Math.max(1, distanceKm / 60),
    estimatedFarePKR: fare,
    fareBreakdown: {
      baseFare: fare,
      weightSurcharge: 0,
      priorityPremium: 0,
      totalFare: fare,
    },
    status: 'Pending-Driver-Consent',
    paymentStatus: 'Confirmed-Payment',
    paymentMethod: 'Dummy-Bypass',
    paidAt: new Date(),
    driverOfferHistory: [{
      driver: driver._id,
      response: 'Pending',
      offeredAt: new Date(),
    }],
    checkpoints: [{
      status: 'Fare Estimated',
      location: pickupCity,
      notes: 'Demo trip available in the driver broadcast queue.',
      timestamp: new Date(),
    }],
  }));

  const inserted = await Order.insertMany(orders);
  await User.findByIdAndUpdate(driver._id, {
    driverConsent: {
      status: 'Pending',
      currentOfferId: inserted[0]._id,
      offeredAt: new Date(),
    },
  });

  console.log(`Seeded ${inserted.length} driver trips.`);
  console.log(`Driver login: ${driver.email} / Driver@123456`);
  console.log(inserted.map((order) => `${order.orderNumber}: ${order._id}`).join('\n'));
};

if (require.main === module) {
  connectDB()
    .then(() => seedDriverData({ reset: true }))
    .catch((error) => {
      console.error('[Seed Driver] Failed:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = { seedDriverData };
