const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Logistics & Fleet Management Enterprise API Documentation',
      version: '1.0.0',
      description:
        'Production REST API for On-Demand Logistics, Fleet Telemetry, Route Metrics, Driver Attendance, Dispatch Logs, and Payroll Automation.',
      contact: {
        name: 'Antigravity Logistics Systems',
        email: 'ops@logistics-fleet.local',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Logistics Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token: Bearer <token>',
        },
      },
      schemas: {
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            plateNumber: { type: 'string', example: 'FLT-9042-IL' },
            vin: { type: 'string', example: '1FTFW1ED8MFB12345' },
            make: { type: 'string', example: 'Freightliner' },
            model: { type: 'string', example: 'Cascadia 126' },
            year: { type: 'number', example: 2024 },
            type: { type: 'string', example: 'Semi-Truck' },
            capacityKg: { type: 'number', example: 22000 },
            fuelType: { type: 'string', example: 'Diesel' },
            currentOdometerKm: { type: 'number', example: 45200 },
            status: { type: 'string', enum: ['Available', 'In Transit', 'Under Maintenance', 'Out of Service'], example: 'Available' },
            currentHubLocation: { type: 'string', example: 'Chicago Central Depot' },
          },
        },
        DispatchLog: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            dispatchNumber: { type: 'string', example: 'DSP-8821-4901' },
            vehicle: { type: 'string' },
            driver: { type: 'string' },
            route: { type: 'string' },
            cargoDescription: { type: 'string', example: 'Precision Automotive Components' },
            cargoWeightKg: { type: 'number', example: 14500 },
            priority: { type: 'string', example: 'Express' },
            status: { type: 'string', enum: ['Draft', 'Assigned', 'Dispatched', 'En Route', 'At Checkpoint', 'Delivered', 'Incident Reported', 'Cancelled'], example: 'En Route' },
            currentLocation: { type: 'string', example: 'Gary Tollway Plaza' },
          },
        },
        DriverAttendance: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            driver: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            clockInTime: { type: 'string', format: 'date-time' },
            clockOutTime: { type: 'string', format: 'date-time' },
            totalHoursWorked: { type: 'number', example: 8.5 },
            regularHours: { type: 'number', example: 8.0 },
            overtimeHours: { type: 'number', example: 0.5 },
            status: { type: 'string', example: 'Present' },
          },
        },
        Payroll: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            payrollId: { type: 'string', example: 'PAY-202608-4912' },
            staff: { type: 'string' },
            regularHours: { type: 'number', example: 80 },
            overtimeHours: { type: 'number', example: 8 },
            hourlyRate: { type: 'number', example: 30.0 },
            grossPay: { type: 'number', example: 2880.0 },
            netPay: { type: 'number', example: 2360.0 },
            paymentStatus: { type: 'string', enum: ['Draft', 'Approved', 'Paid'], example: 'Approved' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
