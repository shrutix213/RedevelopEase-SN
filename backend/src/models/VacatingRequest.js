const mongoose = require('mongoose');

const vacatingRequestSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flatNumber: {
      type: String,
      required: true,
    },
    wing: {
      type: String,
      required: true,
    },
    plannedDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Inspection Scheduled', 'Keys Handed Over', 'Completed', 'Rejected'],
      default: 'Submitted',
    },
    inspectionDate: {
      type: Date,
      default: null,
    },
    electricityMeterReading: {
      type: String,
      default: '',
    },
    gasMeterReading: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VacatingRequest', vacatingRequestSchema);
