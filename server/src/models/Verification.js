import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel',
      default: null,
    },
    targetModel: {
      type: String,
      enum: ['User', 'Company'],
      default: 'User',
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationType: {
      type: String,
      required: [true, 'Verification type is required'],
      trim: true,
    },
    documentUrl: {
      type: String,
      default: '',
    },
    proofDocumentUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    institutionOrOrg: {
      type: String,
      default: '',
      trim: true,
    },
    designationOrRegNo: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'pending', 'approved', 'rejected'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
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

// Pre-save synchronization hook to ensure compatibility between targetId/requester and documentUrl/proofDocumentUrl
verificationSchema.pre('save', function (next) {
  if (this.targetId && !this.requester) {
    this.requester = this.targetId;
  }
  if (this.requester && !this.targetId) {
    this.targetId = this.requester;
  }
  if (this.documentUrl && !this.proofDocumentUrl) {
    this.proofDocumentUrl = this.documentUrl;
  }
  if (this.proofDocumentUrl && !this.documentUrl) {
    this.documentUrl = this.proofDocumentUrl;
  }
  next();
});

verificationSchema.index({ targetId: 1 });
verificationSchema.index({ requester: 1 });
verificationSchema.index({ status: 1 });

export const Verification = mongoose.model('Verification', verificationSchema);
export default Verification;
