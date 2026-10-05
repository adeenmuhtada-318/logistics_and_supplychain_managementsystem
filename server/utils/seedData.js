require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User  = require('../models/User');
const Order = require('../models/Order');

/* ─── V2.0 Seed Data — 3-Role System ───────────────────────────────────── */
const seedUsers = [
  /* ── Admin ─────────────────────────────────────────── */
  {
    name:          'Admin — FleetCore System',
    email:         'admin@fleetcore.local',
    password:      'Admin@123456',
    role:          'Admin',
    phone:         '021-11199900',
    licenseNumber: '',
    currentCity:   'Karachi',
    currentProvince: 'Sindh',
    status:        'Active',
    isActive:      true,
  },

  /* ── Drivers ────────────────────────────────────────── */
  {
    name:            'Ahmed Raza (Lahore Rider)',
    email:           'driver@fleetcore.local',
    password:        'Driver@123456',
    role:            'Driver',
    phone:           '0300-1234567',
    licenseNumber:   'PB-LHR-29182',
    currentCity:     'Lahore',
    currentProvince: 'Punjab',
    status:          'Active',
    isActive:        true,
  },
  {
    name:            'Bilal Siddiqui (Karachi Rider)',
    email:           'driver2@fleetcore.local',
    password:        'Driver@123456',
    role:            'Driver',
    phone:           '0321-9876543',
    licenseNumber:   'SND-KHI-48821',
    currentCity:     'Karachi',
    currentProvince: 'Sindh',
    status:          'Active',
    isActive:        true,
  },
  {
    name:            'Hassan Tariq (Islamabad Rider)',
    email:           'driver3@fleetcore.local',
    password:        'Driver@123456',
    role:            'Driver',
    phone:           '0333-5556666',
    licenseNumber:   'ICT-ISB-77341',
    currentCity:     'Islamabad',
    currentProvince: 'Islamabad Capital Territory',
    status:          'Active',
    isActive:        true,
  },

  /* ── Clients ────────────────────────────────────────── */
  {
    name:     'ZainCo Industries (Client)',
    email:    'client@fleetcore.local',
    password: 'Client@123456',
    role:     'Client',
    phone:    '',
    status:   'Active',
    isActive: true,
    corporateProfile: {
      companyName:   'ZainCo Industries (Pvt.) Ltd.',
      ownerName:     'Zain ul Abidin',
      ntn:           '1234567-0',
      contactPhone:  '042-35880011',
      businessType:  'Textile Manufacturing',
      yearsInOperation: '12',
      registeredOffice: {
        province: 'Punjab',
        city:     'Lahore',
        area:     'Johar Town',
        street:   'Plot 45, Main Boulevard',
        country:  'Pakistan',
      },
      isVerified: true,
    },
  },
  {
    name:     'Pak Pharma Ltd (Client)',
    email:    'client2@fleetcore.local',
    password: 'Client@123456',
    role:     'Client',
    phone:    '',
    status:   'Active',
    isActive: true,
    corporateProfile: {
      companyName:   'Pak Pharma Ltd.',
      ownerName:     'Dr. Sara Nasir',
      ntn:           '7654321-0',
      contactPhone:  '021-35008800',
      businessType:  'Pharmaceutical',
      yearsInOperation: '8',
      registeredOffice: {
        province: 'Sindh',
        city:     'Karachi',
        area:     'Clifton',
        street:   'Block 4, Sea View Towers',
        country:  'Pakistan',
      },
      isVerified: true,
    },
  },
];

/* ─── autoSeedIfEmpty — called on server boot ───────────────────────────── */
const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Already seeded

    console.log('[Seeder] Empty database detected — seeding V2.0 FleetCore data…');

    for (const u of seedUsers) {
      await User.create(u);
    }

    console.log('[Seeder] ✅ V2.0 seed complete!');
    console.log('[Seeder] ──────────────────────────────────────────');
    console.log('[Seeder] 🔐 Admin   : admin@fleetcore.local     / Admin@123456');
    console.log('[Seeder] 🚛 Driver  : driver@fleetcore.local    / Driver@123456');
    console.log('[Seeder] 🏢 Client  : client@fleetcore.local    / Client@123456');
    console.log('[Seeder] ──────────────────────────────────────────');
  } catch (error) {
    console.error('[Seeder] Error during auto-seed:', error.message);
  }
};

/* ─── runManualSeed — FORCE RESET (wipes users + orders) ───────────────── */
const runManualSeed = async () => {
  try {
    const connectDB = require('../config/db');
    await connectDB();

    console.log('[Seeder] 🗑  Wiping all users and orders for V2.0 reset…');
    await User.deleteMany({});
    await Order.deleteMany({});

    // Force auto-seed even though count is now 0
    await autoSeedIfEmpty();

    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Fatal error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  runManualSeed();
}

module.exports = { autoSeedIfEmpty };
