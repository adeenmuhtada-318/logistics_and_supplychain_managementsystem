const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');

/**
 * @desc    Register a new staff/driver account
 * @route   POST /api/auth/register
 * @access  Public / Manager
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      licenseNumber,
      hourlyRate,
      baseSalary,
      shiftType,
      address,
      currentCity,
      currentProvince
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Account with this email already exists.',
      });
    }

    const validRoles = ['Fleet_Manager', 'Dispatcher', 'Driver', 'Accountant'];
    const assignedRole = role && validRoles.includes(role) ? role : 'Driver';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      licenseNumber: licenseNumber || '',
      hourlyRate: Number(hourlyRate) || (assignedRole === 'Driver' ? 28.5 : 35.0),
      baseSalary: Number(baseSalary) || 0,
      shiftType: shiftType || 'Morning',
      address: address || {},
      currentCity: currentCity || '',
      currentProvince: currentProvince || '',
      status: 'Active',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        licenseNumber: user.licenseNumber,
        hourlyRate: user.hourlyRate,
        shiftType: user.shiftType,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        licenseNumber: user.licenseNumber,
        hourlyRate: user.hourlyRate,
        shiftType: user.shiftType,
        status: user.status,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff/drivers filtered by role
 * @route   GET /api/auth/staff
 * @access  Private (Manager, Dispatcher, Accountant)
 */
const getStaffList = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    const users = await User.find(filter).select('-password').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update staff status (e.g. On Duty / Off Duty / On Leave)
 * @route   PATCH /api/auth/staff/:id/status
 * @access  Private (Manager or User Self)
 */
const updateStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, hourlyRate, shiftType } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    if (status) user.status = status;
    if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);
    if (shiftType) user.shiftType = shiftType;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Staff status updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a B2B Corporate Client
 * @route   POST /api/auth/register-client
 * @access  Public
 */
const registerClient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      corporateProfile
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Account with this email already exists.',
      });
    }

    if (!corporateProfile || !corporateProfile.companyName || !corporateProfile.ntn) {
      return res.status(400).json({
        success: false,
        message: 'Corporate profile with companyName and ntn is required.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Client',
      corporateProfile,
      status: 'Active',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        corporateProfile: user.corporateProfile,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getStaffList,
  updateStaffStatus,
  registerClient,
};
