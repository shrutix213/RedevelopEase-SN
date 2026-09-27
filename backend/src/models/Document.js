const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide document title'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Legal', 'Finance', 'Architectural', 'Government', 'Builder'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessRole: [
      {
        type: String,
        enum: ['super_admin', 'secretary', 'committee_member', 'resident', 'builder'],
      },
    ],
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
