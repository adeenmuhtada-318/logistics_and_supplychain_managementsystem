require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const helmet  = require('helmet');
const swaggerUi = require('swagger-ui-express');

const connectDB      = require('./config/db');
const swaggerSpec    = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startExpiryJob }   = require('./utils/expiryJob');
const { autoSeedIfEmpty }  = require('./utils/seedData');
const { seedDriverData }   = require('./utils/seedDriverData');

// V2.0 Routes (3-role system: Client, Driver, Admin)
const authRoutes     = require('./routes/authRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const pricingRoutes  = require('./routes/pricingRoutes');
const locationRoutes = require('./routes/locationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Security & Logging Middleware
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger Interactive API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FleetCore V2.0 API Docs',
  })
);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:    'healthy',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
    service:   'FleetCore Logistics & Supply Chain Management V2.0',
    roles:     ['Client', 'Driver', 'Admin'],
  });
});

// ── V2.0 API Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/pricing',   pricingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Seed V2.0 demo accounts if DB is empty
    await autoSeedIfEmpty();
    await seedDriverData();

    // Start 72-hour order expiry background job
    startExpiryJob();

    app.listen(PORT, () => {
      console.log(`========================================================`);
      console.log(`🚛 FleetCore V2.0 API Server on port ${PORT}`);
      console.log(`📑 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Roles: Client | Driver | Admin`);
      console.log(`========================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
