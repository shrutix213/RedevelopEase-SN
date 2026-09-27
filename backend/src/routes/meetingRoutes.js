const express = require('express');
const router = express.Router();
const {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} = require('../controllers/meetingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, getMeetings);
router.post('/', protect, authorize('secretary', 'super_admin'), createMeeting);
router.put('/:id', protect, authorize('secretary', 'super_admin'), updateMeeting);
router.delete('/:id', protect, authorize('secretary', 'super_admin'), deleteMeeting);

module.exports = router;
