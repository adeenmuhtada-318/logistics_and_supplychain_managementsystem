require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { autoSeedIfEmpty } = require('./utils/seedData');

const app = express();

// Security and Logging Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
    customSiteTitle: 'Logistics & Fleet Management API Docs',
  })
);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'On-Demand Logistics & Fleet Management System API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();

    app.listen(PORT, () => {
      console.log(`========================================================`);
      console.log(`🚛 Logistics & Fleet Management API Server on port ${PORT}`);
      console.log(`📑 Swagger Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`========================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
