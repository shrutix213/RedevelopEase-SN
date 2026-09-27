const Notification = require('../models/Notification');
const User = require('../models/User');

const sendNotification = async ({ userId, title, message, type = 'info', link = '' }) => {
  try {
    if (!userId) return null;
    return await Notification.create({
      userId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('[Notifier] Failed to create notification:', error.message);
    return null;
  }
};

const notifySociety = async ({ societyId, title, message, type = 'info', link = '', roles = ['resident', 'committee_member'] }) => {
  try {
    if (!societyId) return;
    const users = await User.find({
      societyId,
      role: { $in: roles },
      accountStatus: 'approved',
    }).select('_id');

    const notifications = users.map((u) => ({
      userId: u._id,
      title,
      message,
      type,
      link,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('[Notifier] Failed to notify society:', error.message);
  }
};

module.exports = { sendNotification, notifySociety };
