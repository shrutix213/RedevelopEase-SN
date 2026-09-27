const mongoose = require('mongoose');

const rentRequestSchema = new mongoose.Schema(
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
    bankDetails: {
      accountHolderName: {
        type: String,
        default: '',
      },
      bankName: {
        type: String,
        default: '',
      },
      accountNumber: {
        type: String,
        default: '',
      },
      ifscCode: {
        type: String,
        default: '',
      },
    },
    monthlyAmount: {
      type: Number,
      required: true,
    },
    rentalAgreementUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Disbursed', 'Rejected'],
      default: 'Submitted',
    },
    disbursedMonths: [
      {
        type: String, // e.g. "January 2026", "February 2026"
      },
    ],
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RentRequest', rentRequestSchema);
