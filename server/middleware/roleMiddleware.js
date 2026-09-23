/**
 * Role authorization guard
 * @param  {...string} roles - Permitted roles (e.g. 'Fleet_Manager', 'Dispatcher', 'Driver', 'Accountant')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before accessing this endpoint.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { authorize };
