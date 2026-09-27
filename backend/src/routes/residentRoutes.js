const express = require('express');
const router = express.Router();
const {
  getResidents,
  approveResident,
  rejectResident,
  updateResident,
  deleteResident,
} = require('../controllers/residentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, authorize('secretary', 'committee_member', 'super_admin'), getResidents);
router.put('/:id/approve', protect, authorize('secretary', 'super_admin'), approveResident);
router.put('/:id/reject', protect, authorize('secretary', 'super_admin'), rejectResident);
router.put('/:id', protect, authorize('secretary', 'super_admin'), updateResident);
router.delete('/:id', protect, authorize('secretary', 'super_admin'), deleteResident);

module.exports = router;
