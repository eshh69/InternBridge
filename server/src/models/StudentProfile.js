import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree program is required'],
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      required: [true, 'Field of study is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'],
      required: [true, 'Academic year is required'],
    },
    gpa: {
      type: Number,
      min: 0.0,
      max: 4.0,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      type: Number,
      min: 16,
      max: 100,
      default: null,
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [{ type: String, trim: true }],
        projectUrl: { type: String },
        githubUrl: { type: String },
      },
    ],
    certificates: [
      {
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        issueDate: { type: Date },
        credentialUrl: { type: String },
        certificateFileUrl: { type: String },
      },
    ],
    badges: [
      {
        name: { type: String, required: true },
        issuedBy: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    links: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      behance: { type: String, default: '' },
      other: { type: String, default: '' },
      customLinks: [
        {
          label: { type: String, trim: true, default: '' },
          url: { type: String, trim: true, default: '' },
        },
      ],
    },
    cvUrl: {
      type: String,
      default: null,
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

studentProfileSchema.index({ skills: 1 });

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
