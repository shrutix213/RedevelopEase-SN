const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ societyId = null, userId, action, details = '', ipAddress = '127.0.0.1' }) => {
  try {
    if (!userId) return;
    await ActivityLog.create({
      societyId,
      userId,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[Logger] Failed to log activity:', error.message);
  }
};

module.exports = { logActivity };
