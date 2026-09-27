const mongoose = require('mongoose');

const redevelopmentInfoSchema = new mongoose.Schema(
  {
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      default: null,
    },
    builderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    builderName: {
      type: String,
      default: '',
    },
    agreementDate: {
      type: Date,
      default: null,
    },
    reraNumber: {
      type: String,
      default: '',
    },
    completionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Planning',
        'Tendering',
        'Builder Appointed',
        'DA Signed',
        'Demolition',
        'Excavation & Plinth',
        'RCC Construction',
        'Finishing & Handover',
        'Completed',
      ],
      default: 'Planning',
    },
    currentProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    carpetAreaHikePercentage: {
      type: Number,
      default: 25,
    },
    hardshipCompensation: {
      type: String,
      default: '',
    },
    monthlyTransitRentPerSqFt: {
      type: Number,
      default: 65,
    },
  },
  { _id: false }
);

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide society name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode'],
      trim: true,
    },
    totalFlats: {
      type: Number,
      required: [true, 'Please provide total flats count'],
      min: 1,
    },
    establishedYear: {
      type: Number,
      default: null,
    },
    registrationNumber: {
      type: String,
      default: '',
      trim: true,
    },
    societyType: {
      type: String,
      default: 'Cooperative Housing Society (CHS)',
    },
    secretaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    redevelopmentInfo: {
      type: redevelopmentInfoSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Society', societySchema);
