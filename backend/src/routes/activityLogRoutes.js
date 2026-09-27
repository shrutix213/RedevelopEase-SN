const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', protect, authorize('super_admin', 'secretary', 'committee_member'), getActivityLogs);

module.exports = router;
