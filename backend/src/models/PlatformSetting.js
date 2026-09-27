const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: 'RedevelopEase',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowPublicRegistration: {
      type: Boolean,
      default: true,
    },
    systemEmail: {
      type: String,
      default: 'support@redevelopease.in',
    },
    supportContact: {
      type: String,
      default: '+91 22 4567 8900',
    },
    announcementBanner: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
