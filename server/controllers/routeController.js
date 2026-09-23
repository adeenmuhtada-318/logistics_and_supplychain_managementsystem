const RouteMetric = require('../models/RouteMetric');
const { generateRouteCode } = require('../utils/codeGenerators');

/**
 * @desc    Get all routes with search & status filters
 * @route   GET /api/routes
 * @access  Private
 */
const getAllRoutes = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { routeCode: searchRegex },
        { routeName: searchRegex },
        { originHub: searchRegex },
        { destinationHub: searchRegex },
      ];
    }

    const routes = await RouteMetric.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      routes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single route by ID
 * @route   GET /api/routes/:id
 * @access  Private
 */
const getRouteById = async (req, res, next) => {
  try {
    const route = await RouteMetric.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route corridor not found',
      });
    }

    res.status(200).json({
      success: true,
      route,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new route corridor
 * @route   POST /api/routes
 * @access  Private (Fleet_Manager, Dispatcher)
 */
const createRoute = async (req, res, next) => {
  try {
    const {
      routeName,
      originHub,
      destinationHub,
      waypoints,
      estimatedDistanceKm,
      estimatedDurationHours,
      tollExpenses,
    } = req.body;

    const routeCode = req.body.routeCode || generateRouteCode(originHub, destinationHub);

    // Compute carbon footprint & standard diesel fuel consumption estimate
    // Standard commercial freight estimate: ~30L diesel per 100km, ~2.68kg CO2 per liter
    const distance = Number(estimatedDistanceKm);
    const estimatedFuel = Number(((distance / 100) * 30).toFixed(1));
    const carbonFootprint = Number((estimatedFuel * 2.68).toFixed(1));

    const route = await RouteMetric.create({
      routeCode,
      routeName,
      originHub,
      destinationHub,
      waypoints: waypoints || [],
      estimatedDistanceKm: distance,
      estimatedDurationHours: Number(estimatedDurationHours),
      fuelConsumedLiters: estimatedFuel,
      carbonFootprintKg: carbonFootprint,
      tollExpenses: Number(tollExpenses) || 0,
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Route corridor created successfully',
      route,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update route corridor metrics & waypoints
 * @route   PUT /api/routes/:id
 * @access  Private (Fleet_Manager, Dispatcher)
 */
const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await RouteMetric.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route metrics updated successfully',
      route,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete route corridor
 * @route   DELETE /api/routes/:id
 * @access  Private (Fleet_Manager)
 */
const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await RouteMetric.findByIdAndDelete(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route corridor deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};
