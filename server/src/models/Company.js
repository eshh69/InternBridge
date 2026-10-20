import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
    },
    industry: {
      type: String,
      required: [true, 'Industry area is required'],
      trim: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: 'Sri Lanka' },
    },
    website: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 'text', industry: 'text' });

export const Company = mongoose.model('Company', companySchema);
