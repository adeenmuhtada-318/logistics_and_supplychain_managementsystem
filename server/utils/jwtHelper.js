const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'logistics_fleet_enterprise_super_secret_jwt_key_2026_antigravity';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn,
  });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'logistics_fleet_enterprise_super_secret_jwt_key_2026_antigravity';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
