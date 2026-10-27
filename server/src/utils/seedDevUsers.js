import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { StudentProfile } from '../models/StudentProfile.js';

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internbridge';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    const accounts = [
      {
        name: 'System Administrator',
        email: 'admin@internbridge.lk',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Dr. Nimal Senarath (Senior Lecturer)',
        email: 'reviewer@internbridge.lk',
        password: 'password123',
        role: 'reviewer',
      },
      {
        name: 'Virtusa Technologies',
        email: 'company@internbridge.lk',
        password: 'password123',
        role: 'company',
      },
      {
        name: 'Kasun Weerasinghe',
        email: 'student@internbridge.lk',
        password: 'password123',
        role: 'student',
      },
    ];

    for (const acc of accounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        const passwordHash = await User.hashPassword(acc.password);
        user = await User.create({
          name: acc.name,
          email: acc.email,
          passwordHash,
          role: acc.role,
          status: 'active',
        });
        console.log(`[Seed] Created ${acc.role}: ${acc.email} / ${acc.password}`);
      } else {
        console.log(`[Seed] User exists: ${acc.email} (${acc.role})`);
      }

      // If company, ensure Company document exists
      if (acc.role === 'company') {
        const existingCompany = await Company.findOne({ user: user._id });
        if (!existingCompany) {
          await Company.create({
            user: user._id,
            name: acc.name,
            description: 'Leading global digital business transformation partner.',
            industry: 'Software Engineering',
            location: {
              address: '752 Dr Danister De Silva Mawatha',
              city: 'Colombo',
              country: 'Sri Lanka',
            },
            contactEmail: acc.email,
            verificationStatus: 'unverified',
          });
          console.log('[Seed] Created associated Company profile');
        }
      }

      // If student, ensure StudentProfile document exists
      if (acc.role === 'student') {
        const existingProfile = await StudentProfile.findOne({ user: user._id });
        if (!existingProfile) {
          await StudentProfile.create({
            user: user._id,
            university: 'South Eastern University of Sri Lanka',
            degree: 'BSc in Information and Communication Technology',
            fieldOfStudy: 'Software Engineering & Web Technologies',
            academicYear: '3rd Year',
            gpa: 3.8,
            bio: 'Passionate student developer exploring web engineering and distributed systems.',
            skills: ['react', 'node.js', 'mongodb', 'javascript', 'tailwind css'],
          });
          console.log('[Seed] Created associated StudentProfile');
        }
      }
    }

    console.log('[Seed] All dev accounts successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seed();
