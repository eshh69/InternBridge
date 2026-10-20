import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Internship description is required'],
    },
    area: {
      type: String,
      required: [true, 'Area/Field is required (e.g. Software Engineering)'],
      trim: true,
    },
    requiredSkills: [
      {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    ],
    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],
    locationType: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      required: true,
      default: 'On-site',
    },
    location: {
      type: String,
      required: [true, 'Location (city/address) is required'],
      trim: true,
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration in months is required'],
      min: 1,
      default: 6,
    },
    openPositions: {
      type: Number,
      default: 1,
      min: 1,
    },
    stipend: {
      isPaid: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'LKR' },
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

internshipSchema.index({ company: 1 });
internshipSchema.index({ status: 1 });
internshipSchema.index({ requiredSkills: 1 });
internshipSchema.index({ title: 'text', description: 'text', area: 'text' });

export const Internship = mongoose.model('Internship', internshipSchema);
