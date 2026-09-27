const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity audit logs
// @route   GET /api/activity-logs
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'super_admin') {
      // Super admin can see all or filter by societyId
      if (req.query.societyId) {
        query.societyId = req.query.societyId;
      }
    } else {
      // Secretary and others see their society logs
      query.societyId = req.user.societyId;
    }

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email role')
      .populate('societyId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { getActivityLogs };
