import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      refPath: 'targetTypeModel',
    },
    targetType: {
      type: String,
      enum: ['Student', 'Company', 'student', 'company'],
      required: [true, 'Target type is required'],
    },
    targetTypeModel: {
      type: String,
      enum: ['User', 'Company'],
      default: 'User',
    },
    targetStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    ratingCriteria: {
      technicalSkills: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      softSkills: { type: Number, min: 1, max: 5 },
      workEnvironment: { type: Number, min: 1, max: 5 },
      mentorship: { type: Number, min: 1, max: 5 },
    },
    ratings: {
      technicalSkills: { type: Number, min: 1, max: 5 },
      softSkills: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      workEnvironment: { type: Number, min: 1, max: 5 },
      mentorship: { type: Number, min: 1, max: 5 },
    },
    overallRating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [2000, 'Comments cannot exceed 2000 characters'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isVerifiedReview: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook to ensure backwards compatibility across reviewer/reviewerId and ratings/ratingCriteria
reviewSchema.pre('save', function (next) {
  if (this.reviewerId && !this.reviewer) {
    this.reviewer = this.reviewerId;
  }
  if (this.reviewer && !this.reviewerId) {
    this.reviewerId = this.reviewer;
  }

  // Sync targetTypeModel
  const normalizedType = this.targetType ? this.targetType.toLowerCase() : 'student';
  this.targetTypeModel = normalizedType === 'company' ? 'Company' : 'User';

  if (normalizedType === 'student') {
    this.targetStudent = this.targetStudent || this.targetId;
  } else {
    this.targetCompany = this.targetCompany || this.targetId;
  }

  // Sync ratings and ratingCriteria
  if (this.ratingCriteria && !this.ratings) {
    this.ratings = { ...this.ratingCriteria };
  } else if (this.ratings && !this.ratingCriteria) {
    this.ratingCriteria = { ...this.ratings };
  }

  // Sync isVerified flags
  if (this.isVerified !== undefined) {
    this.isVerifiedReview = this.isVerified;
  } else if (this.isVerifiedReview !== undefined) {
    this.isVerified = this.isVerifiedReview;
  }

  next();
});

reviewSchema.index({ targetId: 1 });
reviewSchema.index({ targetStudent: 1 });
reviewSchema.index({ targetCompany: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ reviewer: 1 });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
