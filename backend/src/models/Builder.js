const mongoose = require('mongoose');

const builderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide builder contact person name'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide builder company name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide builder email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    reraNumber: {
      type: String,
      required: [true, 'Please provide MahaRERA / RERA number'],
      trim: true,
    },
    assignedSocieties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
      },
    ],
    experienceYears: {
      type: Number,
      default: 10,
    },
    completedProjects: {
      type: Number,
      default: 5,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Builder', builderSchema);
