import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user reference is required'],
    },
    verificationType: {
      type: String,
      enum: ['reviewer', 'company'],
      required: [true, 'Verification type is required'],
    },
    proofDocumentUrl: {
      type: String,
      required: [true, 'Proof document URL is required'],
    },
    institutionOrOrg: {
      type: String,
      required: [true, 'Institution or organization name is required'],
      trim: true,
    },
    designationOrRegNo: {
      type: String,
      required: [true, 'Designation, Staff ID, or BRN is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

verificationSchema.index({ requester: 1 });
verificationSchema.index({ status: 1 });

export const Verification = mongoose.model('Verification', verificationSchema);
