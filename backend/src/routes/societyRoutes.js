const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  deleteSociety,
} = require('../controllers/societyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Optional protect middleware for GET /api/societies to allow public dropdown for registration
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redevelopease_jwt_secret_2026_super_secure');
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore token failure for public route
    }
  }
  next();
};

router.get('/', optionalProtect, getSocieties);
router.post('/', protect, authorize('super_admin'), createSociety);
router.get('/:id', protect, getSocietyById);
router.put('/:id', protect, authorize('super_admin', 'secretary'), updateSociety);
router.delete('/:id', protect, authorize('super_admin'), deleteSociety);

module.exports = router;
