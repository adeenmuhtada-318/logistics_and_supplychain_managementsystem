const express = require('express');
const router = express.Router();
const { getProvincesHandler, getCitiesHandler, getAreasHandler } = require('../controllers/locationController');

// All public — no auth required for cascading dropdown data
router.get('/provinces', getProvincesHandler);
router.get('/cities',    getCitiesHandler);
router.get('/areas',     getAreasHandler);

module.exports = router;
