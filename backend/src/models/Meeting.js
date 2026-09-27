const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide meeting title'],
      trim: true,
    },
    agenda: {
      type: String,
      required: [true, 'Please provide meeting agenda'],
    },
    location: {
      type: String,
      required: [true, 'Please provide location (e.g. Society Clubhouse, Dadar or Zoom URL)'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide meeting date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide meeting time (e.g. 10:30 AM)'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    minutes: {
      type: String,
      default: '',
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendeesCount: {
      type: Number,
      default: 0,
    },
    documentUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Meeting', meetingSchema);
