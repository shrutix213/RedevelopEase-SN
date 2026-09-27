const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/platformSettingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', getSettings);
router.put('/', protect, authorize('super_admin'), updateSettings);

module.exports = router;
