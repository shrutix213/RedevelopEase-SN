const express = require('express');
const router = express.Router();
const {
  getRedevelopmentUpdates,
  createRedevelopmentUpdate,
  reviewRedevelopmentUpdate,
} = require('../controllers/redevelopmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, getRedevelopmentUpdates);
router.post('/', protect, authorize('builder', 'secretary', 'super_admin'), createRedevelopmentUpdate);
router.put('/:id/review', protect, authorize('secretary', 'super_admin'), reviewRedevelopmentUpdate);

module.exports = router;
