const express = require('express');
const router  = express.Router();
const { getProvinces, getCities, getAreas } = require('../controllers/locationController');

// All public — no auth required for cascading dropdown data
router.get('/provinces', getProvinces);
router.get('/cities',    getCities);
router.get('/areas',     getAreas);

module.exports = router;
