const express = require('express');
const router = express.Router();
const {
  getBuilders,
  createBuilder,
  assignSociety,
} = require('../controllers/builderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, getBuilders);
router.post('/', protect, authorize('super_admin'), createBuilder);
router.put('/:id/assign', protect, authorize('super_admin', 'secretary'), assignSociety);

module.exports = router;
