const { getProvinces, getCitiesByProvince, getAreasByCity } = require('../data/pakistanLocations');

const getProvincesHandler = (req, res, next) => {
  try {
    const provinces = getProvinces();
    res.status(200).json({
      success: true,
      data: provinces
    });
  } catch (error) {
    next(error);
  }
};

const getCitiesHandler = (req, res, next) => {
  try {
    const { province } = req.query;
    const cities = getCitiesByProvince(province);
    res.status(200).json({
      success: true,
      data: cities
    });
  } catch (error) {
    next(error);
  }
};

const getAreasHandler = (req, res, next) => {
  try {
    const { province, city } = req.query;
    const areas = getAreasByCity(province, city);
    res.status(200).json({
      success: true,
      data: areas
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProvinces: getProvincesHandler,
  getCities: getCitiesHandler,
  getAreas: getAreasHandler
};
