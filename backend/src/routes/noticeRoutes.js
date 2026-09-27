const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, getNotices);
router.post('/', protect, authorize('secretary', 'super_admin'), createNotice);
router.put('/:id', protect, authorize('secretary', 'super_admin'), updateNotice);
router.delete('/:id', protect, authorize('secretary', 'super_admin'), deleteNotice);

module.exports = router;
