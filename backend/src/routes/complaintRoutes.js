const express = require('express');
const router = express.Router();
const {
  getComplaints,
  createComplaint,
  updateComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, getComplaints);
router.post('/', protect, authorize('resident', 'committee_member', 'secretary'), createComplaint);
router.put('/:id', protect, authorize('secretary', 'committee_member', 'super_admin'), updateComplaint);

module.exports = router;
