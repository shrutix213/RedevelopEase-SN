const PlatformSetting = require('../models/PlatformSetting');
const { logActivity } = require('../utils/logger');

// @desc    Get platform settings
// @route   GET /api/settings
// @access  Public / Private
const getSettings = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = await PlatformSetting.create({
        appName: 'RedevelopEase',
        maintenanceMode: false,
        allowPublicRegistration: true,
        systemEmail: 'admin@redevelopease.in',
        supportContact: '+91 22 4567 8900',
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update platform settings (Super Admin only)
// @route   PUT /api/settings
// @access  Private (Super Admin)
const updateSettings = async (req, res) => {
  try {
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = new PlatformSetting();
    }

    const { appName, maintenanceMode, allowPublicRegistration, systemEmail, supportContact, announcementBanner } = req.body;

    if (appName !== undefined) settings.appName = appName;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowPublicRegistration !== undefined) settings.allowPublicRegistration = allowPublicRegistration;
    if (systemEmail !== undefined) settings.systemEmail = systemEmail;
    if (supportContact !== undefined) settings.supportContact = supportContact;
    if (announcementBanner !== undefined) settings.announcementBanner = announcementBanner;

    await settings.save();

    await logActivity({
      userId: req.user._id,
      action: 'Platform Settings Updated',
      details: 'Super admin modified global system parameters',
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Settings saved successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { getSettings, updateSettings };
