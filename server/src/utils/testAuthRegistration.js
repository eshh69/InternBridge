import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';

dotenv.config();

async function runTest() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internbridge';
    await mongoose.connect(mongoUri);
    console.log('[Test] MongoDB Connected successfully to', mongoUri);

    const testStudentEmail = 'test_student_' + Date.now() + '@internbridge.lk';
    const testCompanyEmail = 'test_company_' + Date.now() + '@internbridge.lk';

    // 1. Verify Student Creation with Age, Phone, and Academic Profile
    const passwordHash = await User.hashPassword('Password123!');
    const studentUser = await User.create({
      name: 'Nipuna Chamara',
      email: testStudentEmail,
      passwordHash,
      role: 'student',
      age: 23,
      phone: '+94 77 987 6543',
      authProvider: 'local',
    });

    const studentProf = await StudentProfile.create({
      user: studentUser._id,
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc in Information and Communication Technology',
      fieldOfStudy: 'Software Engineering',
      academicYear: '3rd Year',
      phone: studentUser.phone,
      skills: ['react', 'node.js', 'mongodb', 'tailwind css'],
    });

    console.log('✓ Student User Verified: ID =', studentUser._id.toString());
    console.log('  Age =', studentUser.age, '| Phone =', studentUser.phone);
    console.log('✓ Student Profile Verified: Degree =', studentProf.degree, '| University =', studentProf.university);

    // 2. Verify Company Creation
    const companyUser = await User.create({
      name: 'Virtusa Tech Sri Lanka',
      email: testCompanyEmail,
      passwordHash,
      role: 'company',
      phone: '+94 11 234 5678',
      authProvider: 'local',
    });

    const companyDoc = await Company.create({
      user: companyUser._id,
      name: 'Virtusa Tech Sri Lanka',
      description: 'Leading global digital business transformation partner.',
      industry: 'Software Engineering & Cloud Solutions',
      location: {
        address: '752 Dr Danister De Silva Mawatha',
        city: 'Colombo',
        country: 'Sri Lanka',
      },
      website: 'https://virtusa.com',
      contactEmail: testCompanyEmail,
      contactPhone: companyUser.phone,
      verificationStatus: 'unverified',
    });

    console.log('✓ Company Verified: Name =', companyDoc.name, '| Industry =', companyDoc.industry);

    // Clean up temporary test entries
    await StudentProfile.deleteOne({ _id: studentProf._id });
    await Company.deleteOne({ _id: companyDoc._id });
    await User.deleteOne({ _id: studentUser._id });
    await User.deleteOne({ _id: companyUser._id });
    console.log('✓ Database Test Cleanup complete');

    console.log('\n=============================================');
    console.log('🎉 ALL DATABASE INTEGRATION TESTS PASSED 100%!');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTest();
