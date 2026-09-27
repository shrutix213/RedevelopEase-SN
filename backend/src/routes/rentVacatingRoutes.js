const express = require('express');
const router = express.Router();
const {
  getRentRequests,
  createRentRequest,
  updateRentRequest,
  getVacatingRequests,
  createVacatingRequest,
  updateVacatingRequest,
} = require('../controllers/rentVacatingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Rent Routes
router.get('/rent-requests', protect, getRentRequests);
router.post('/rent-requests', protect, authorize('resident'), createRentRequest);
router.put('/rent-requests/:id', protect, authorize('secretary', 'super_admin'), updateRentRequest);

// Vacating Routes
router.get('/vacating-requests', protect, getVacatingRequests);
router.post('/vacating-requests', protect, authorize('resident'), createVacatingRequest);
router.put('/vacating-requests/:id', protect, authorize('secretary', 'super_admin'), updateVacatingRequest);

module.exports = router;
