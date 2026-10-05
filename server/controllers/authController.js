const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');

/**
 * @desc    Register a new Driver account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, licenseNumber, currentCity, currentProvince } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Driver',
      phone:           phone || '',
      licenseNumber:   licenseNumber || '',
      currentCity:     currentCity || '',
      currentProvince: currentProvince || '',
      status: 'Active',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Driver account registered successfully.',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        phone:        user.phone,
        licenseNumber:user.licenseNumber,
        currentCity:  user.currentCity,
        status:       user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new B2B Client account
 * @route   POST /api/auth/register-client
 * @access  Public
 */
const registerClient = async (req, res, next) => {
  try {
    const { name, email, password, corporateProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Client',
      corporateProfile: corporateProfile || {},
      status: 'Active',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Client account registered successfully.',
      token,
      user: {
        id:               user._id,
        name:             user.name,
        email:            user.email,
        role:             user.role,
        corporateProfile: user.corporateProfile,
        status:           user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & retrieve token (all roles)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id:               user._id,
        name:             user.name,
        email:            user.email,
        role:             user.role,
        phone:            user.phone,
        status:           user.status,
        corporateProfile: user.corporateProfile,
        currentCity:      user.currentCity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of drivers (Admin only)
 * @route   GET /api/auth/drivers
 * @access  Private (Admin)
 */
const getDrivers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { role: 'Driver' };
    if (status && status !== 'All') filter.status = status;

    const drivers = await User.find(filter).select('-password').sort({ name: 1 });
    res.status(200).json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update driver status (Admin or self)
 * @route   PATCH /api/auth/drivers/:id/status
 * @access  Private (Admin, Driver self)
 */
const updateDriverStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    if (status) user.status = status;
    await user.save();

    res.status(200).json({ success: true, message: 'Driver status updated.', user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerClient,
  login,
  getMe,
  getDrivers,
  updateDriverStatus,
};
