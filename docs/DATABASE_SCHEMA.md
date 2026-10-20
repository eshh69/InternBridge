# InternBridge — Database Schema Specification (`DATABASE_SCHEMA.md`)

This document is the **authoritative single source of truth** for all MongoDB collections and Mongoose models across the InternBridge system. All developers and AI agents must adhere strictly to these model definitions.

---

## 1. Entity Overview & Ownership

| Collection Name | Model File Path | Primary Owner | Description |
| :--- | :--- | :--- | :--- |
| `users` | `server/src/models/User.js` | **Shared / Lead** | Authentication, core identities, and platform roles |
| `student_profiles` | `server/src/models/StudentProfile.js` | **Member 1 (032)** | Detailed student portfolios, skills, education, projects |
| `companies` | `server/src/models/Company.js` | **Member 2 (033)** | Corporate recruiter profiles and verification state |
| `internships` | `server/src/models/Internship.js` | **Member 2 (033)** | Internship opportunities, required skills, and deadlines |
| `applications` | `server/src/models/Application.js` | **Member 4 (030)** | Student applications to specific internship listings |
| `reviews` | `server/src/models/Review.js` | **Member 5 (057)** | Lecturer and supervisor evaluations and ratings |
| `verifications` | `server/src/models/Verification.js` | **Member 5 (057)** | Verification documents and approval workflows |
| `conversations` | `server/src/models/Conversation.js` | **Member 1 (032)** | 1-on-1 chat channels between students and companies |
| `messages` | `server/src/models/Message.js` | **Member 1 (032)** | Individual chat messages with read status |
| `notifications` | `server/src/models/Notification.js` | **Member 1 / Shared** | In-app alerts for status updates and messages |

---

## 2. Detailed Collection Schemas

### 2.1 `users` Collection (`User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'company', 'reviewer', 'admin'],
    default: 'student'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  avatarUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
// Indexes: { email: 1 } (unique)
```

---

### 2.2 `student_profiles` Collection (`StudentProfile.js`)
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  university: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, required: true, trim: true },
  academicYear: { type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'], required: true },
  gpa: { type: Number, min: 0.0, max: 4.0, default: null },
  bio: { type: String, maxlength: 1000, default: '' },
  skills: [{ type: String, trim: true, lowercase: true }], // Used directly by Matching Engine
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String }
  }],
  projects: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String, trim: true }],
    projectUrl: { type: String },
    githubUrl: { type: String }
  }],
  certificates: [{
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date },
    credentialUrl: { type: String },
    certificateFileUrl: { type: String } // Supabase Storage URL
  }],
  badges: [{
    name: { type: String, required: true },
    issuedBy: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now }
  }],
  experience: [{
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String }
  }],
  links: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  cvUrl: { type: String, default: null }, // Supabase Storage URL
  reputationScore: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
// Indexes: { user: 1 }, { skills: 1 }
```

---

### 2.3 `companies` Collection (`Company.js`)
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  industry: { type: String, required: true, trim: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: 'Sri Lanka' }
  },
  website: { type: String, default: '' },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  logoUrl: { type: String, default: null },
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'pending', 'verified', 'rejected'], 
    default: 'unverified' 
  },
  reputationScore: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
// Indexes: { user: 1 }, { name: 'text', industry: 'text' }
```

---

### 2.4 `internships` Collection (`Internship.js`)
```javascript
{
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  area: { type: String, required: true, trim: true }, // e.g. "Software Engineering", "Data Science"
  requiredSkills: [{ type: String, required: true, lowercase: true, trim: true }], // Matching key
  qualifications: [{ type: String }],
  locationType: { type: String, enum: ['On-site', 'Remote', 'Hybrid'], required: true },
  location: { type: String, required: true },
  durationMonths: { type: Number, required: true, min: 1 },
  openPositions: { type: Number, default: 1, min: 1 },
  stipend: {
    isPaid: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'LKR' }
  },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
// Indexes: { company: 1 }, { status: 1 }, { requiredSkills: 1 }, { title: 'text', description: 'text' }
```

---

### 2.5 `applications` Collection (`Application.js`)
```javascript
{
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  resumeUrl: { type: String, required: true }, // URL to uploaded CV snapshot in Supabase
  coverLetter: { type: String, default: '' },
  matchScore: { type: Number, min: 0, max: 100, default: 0 }, // Score at submission time
  status: { 
    type: String, 
    enum: ['applied', 'under_review', 'shortlisted', 'rejected', 'hired'], 
    default: 'applied' 
  },
  notes: { type: String, default: '' }, // Private company notes
  appliedAt: { type: Date, default: Date.now },
  statusUpdatedAt: { type: Date, default: Date.now }
}
// Compound Index: { student: 1, internship: 1 } (unique: ensures one application per internship per student)
```

---

### 2.6 `reviews` Collection (`Review.js`)
```javascript
{
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Lecturer / Supervisor
  targetType: { type: String, enum: ['student', 'company'], required: true },
  targetStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  targetCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  ratings: {
    technicalSkills: { type: Number, min: 1, max: 5 },     // For students
    softSkills: { type: Number, min: 1, max: 5 },          // For students
    professionalism: { type: Number, min: 1, max: 5 },     // For students & companies
    workEnvironment: { type: Number, min: 1, max: 5 },     // For companies
    mentorship: { type: Number, min: 1, max: 5 }           // For companies
  },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, required: true, maxlength: 2000 },
  isVerifiedReview: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
// Indexes: { targetStudent: 1 }, { targetCompany: 1 }, { reviewer: 1 }
```

---

### 2.7 `verifications` Collection (`Verification.js`)
```javascript
{
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verificationType: { type: String, enum: ['reviewer', 'company'], required: true },
  proofDocumentUrl: { type: String, required: true }, // Supabase Storage URL
  institutionOrOrg: { type: String, required: true },
  designationOrRegNo: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}
// Indexes: { requester: 1 }, { status: 1 }
```

---

### 2.8 `conversations` Collection (`Conversation.js`)
```javascript
{
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}
// Compound Index: { student: 1, company: 1 } (unique: 1 conversation channel per pair)
```

---

### 2.9 `messages` Collection (`Message.js`)
```javascript
{
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 3000 },
  readStatus: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
// Indexes: { conversation: 1, createdAt: 1 }, { receiver: 1, readStatus: 1 }
```

---

### 2.10 `notifications` Collection (`Notification.js`)
```javascript
{
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { 
    type: String, 
    enum: ['application_status', 'new_message', 'new_review', 'verification_update', 'general'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null }, // ID to link to application/review/chat
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
// Indexes: { recipient: 1, isRead: 1, createdAt: -1 }
```
