const mongoose = require('mongoose');

const redevelopmentUpdateSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide update title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide update description'],
    },
    progressPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    milestone: {
      type: String,
      required: [true, 'Please specify the project milestone'],
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    documents: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected'],
      default: 'pending_approval',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvalDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RedevelopmentUpdate', redevelopmentUpdateSchema);
