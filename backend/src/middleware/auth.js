const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redevelopease_jwt_secret_2026_super_secure');

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (req.user.accountStatus === 'deactivated') {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact society administration.' });
      }

      if (req.user.accountStatus === 'rejected') {
        return res.status(403).json({ success: false, message: 'Your registration was rejected by the Society Secretary.' });
      }

      if (req.user.accountStatus === 'pending') {
        return res.status(403).json({
          success: false,
          isPending: true,
          message: 'Your registration is pending approval by your Society Secretary.',
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
