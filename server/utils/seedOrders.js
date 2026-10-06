require('dotenv').config();

if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Order = require('../models/Order');
const User = require('../models/User');

const ORDER_NUMBER_PREFIX = 'DEMO-ORDER-';

const seedOrders = async () => {
  await connectDB();

  let client = await User.findOne({ role: 'Client' });
  if (!client) {
    client = await User.create({
      name: 'Demo B2B Client',
      email: `demo-client-${Date.now()}@fleetcore.test`,
      password: 'FleetCore@2024',
      role: 'Client',
      corporateProfile: {
        companyName: 'Demo Freight Corporation',
        ownerName: 'Demo B2B Client',
        ntn: '1234567-0',
      },
    });
  }

  await Order.deleteMany({ orderNumber: { $regex: `^${ORDER_NUMBER_PREFIX}` } });

  const orders = Array.from({ length: 3 }, (_, index) => ({
    orderNumber: `${ORDER_NUMBER_PREFIX}${String(index + 1).padStart(3, '0')}`,
    client: client._id,
    pickup: {
      province: 'Punjab',
      city: 'Lahore',
      area: 'Model Town',
      streetAddress: 'Model Town',
      address: 'Model Town',
    },
    dropoff: {
      province: 'Islamabad Capital Territory',
      city: 'Islamabad',
      area: 'Blue Area',
      streetAddress: 'Blue Area',
      address: 'Blue Area',
    },
    cargoDescription: 'Demo commercial shipment',
    cargoWeightKg: 500,
    cargoWeight: 500,
    cargoType: 'General',
    priority: 'Standard',
    contactPersonName: 'Demo Operations',
    contactMobile: '03001234567',
    calculatedDistanceKm: 380,
    estimatedDistance: 380,
    estimatedFarePKR: 55000,
    totalFare: 55000,
    fareBreakdown: {
      baseFare: 55000,
      weightSurcharge: 0,
      priorityPremium: 0,
      totalFare: 55000,
    },
    status: 'Pending-Driver-Consent',
    paymentStatus: 'Confirmed-Payment',
    paymentMethod: 'Dummy-Bypass',
    paidAt: new Date(),
    checkpoints: [{
      status: 'Fare Estimated',
      location: 'Lahore',
      notes: 'Demo order seeded for presentation.',
      timestamp: new Date(),
    }],
  }));

  const inserted = await Order.collection.insertMany(orders);
  console.log(`Seeded ${inserted.insertedCount} demo orders for ${client.email}.`);
  console.log(Object.values(inserted.insertedIds).map((id) => id.toString()).join('\n'));
};

seedOrders()
  .catch((error) => {
    console.error('[Seed Orders] Failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
