import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required'],
    },
    targetType: {
      type: String,
      enum: ['student', 'company'],
      required: true,
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
    ratings: {
      technicalSkills: { type: Number, min: 1, max: 5 },
      softSkills: { type: Number, min: 1, max: 5 },
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

reviewSchema.index({ targetStudent: 1 });
reviewSchema.index({ targetCompany: 1 });
reviewSchema.index({ reviewer: 1 });

export const Review = mongoose.model('Review', reviewSchema);
