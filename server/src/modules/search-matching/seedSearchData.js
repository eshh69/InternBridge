import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { Company } from '../../models/Company.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { Internship } from '../../models/Internship.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internbridge';

export const seedSearchData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected.');

    // 1. Create Company Users & Company Profiles
    const companyUserData = [
      {
        name: 'Virtusa Recruitment Team',
        email: 'recruitment@virtusa.com',
        role: 'company',
        passwordHash: await User.hashPassword('Company123!'),
      },
      {
        name: 'WSO2 HR Department',
        email: 'careers@wso2.com',
        role: 'company',
        passwordHash: await User.hashPassword('Company123!'),
      },
      {
        name: 'Sysco LABS Careers',
        email: 'jobs@syscolabs.com',
        role: 'company',
        passwordHash: await User.hashPassword('Company123!'),
      },
    ];

    const companies = [];
    for (const cUser of companyUserData) {
      let user = await User.findOne({ email: cUser.email });
      if (!user) {
        user = await User.create(cUser);
      }

      let company = await Company.findOne({ user: user._id });
      if (!company) {
        company = await Company.create({
          user: user._id,
          name: cUser.name.split(' ')[0], // Virtusa, WSO2, Sysco
          description: `${cUser.name.split(' ')[0]} is a leading global technology innovations enterprise delivering scalable digital solutions.`,
          industry: 'Information Technology & Services',
          location: { address: 'Orion City', city: 'Colombo', country: 'Sri Lanka' },
          contactEmail: cUser.email,
          verificationStatus: 'verified',
          reputationScore: 4.8,
          reviewCount: 15,
        });
      }
      companies.push(company);
    }

    // 2. Create Student User & Profile (Sample Logged-in Student)
    const studentUserEmail = 'saumya.student@internbridge.lk';
    let studentUser = await User.findOne({ email: studentUserEmail });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'W.M.E. Saumya',
        email: studentUserEmail,
        role: 'student',
        passwordHash: await User.hashPassword('Student123!'),
      });
    }

    let studentProfile = await StudentProfile.findOne({ user: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        user: studentUser._id,
        university: 'South Eastern University of Sri Lanka',
        degree: 'BSc in Information and Communication Technology',
        fieldOfStudy: 'Software Engineering',
        academicYear: '3rd Year',
        gpa: 3.78,
        bio: 'Passionate full-stack web developer experienced with modern JavaScript, React, Node.js, and MongoDB.',
        skills: ['react', 'node.js', 'mongodb', 'javascript', 'tailwind', 'express', 'git'],
        reputationScore: 4.9,
        reviewCount: 4,
        projects: [
          {
            title: 'InternBridge Portal',
            description: 'Full stack recruitment platform with algorithmic matching engine.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
          },
        ],
      });
    }

    // Additional student for candidate search
    const student2Email = 'anura.datascience@internbridge.lk';
    let student2User = await User.findOne({ email: student2Email });
    if (!student2User) {
      student2User = await User.create({
        name: 'Anura Kumara',
        email: student2Email,
        role: 'student',
        passwordHash: await User.hashPassword('Student123!'),
      });
    }

    let student2Profile = await StudentProfile.findOne({ user: student2User._id });
    if (!student2Profile) {
      student2Profile = await StudentProfile.create({
        user: student2User._id,
        university: 'University of Colombo',
        degree: 'BSc in Computer Science',
        fieldOfStudy: 'Data Science & AI',
        academicYear: '4th Year',
        gpa: 3.88,
        bio: 'Data science undergraduate specializing in machine learning, pandas, and predictive analytics.',
        skills: ['python', 'pandas', 'machine learning', 'sql', 'docker'],
        reputationScore: 4.7,
        reviewCount: 6,
      });
    }

    // 3. Create Sample Internships
    const sampleInternships = [
      {
        company: companies[0]._id, // Virtusa
        title: 'Full Stack Engineering Intern (MERN)',
        description: 'Join Virtusa to develop scalable web applications using React, Node.js, Express, and MongoDB. You will collaborate with senior architects to deploy enterprise software.',
        area: 'Software Engineering',
        requiredSkills: ['react', 'node.js', 'mongodb', 'javascript', 'tailwind'],
        qualifications: ['Undergraduate in ICT/CS', 'Knowledge of RESTful APIs and Git', 'Strong team communication'],
        locationType: 'Hybrid',
        location: 'Colombo, Sri Lanka',
        durationMonths: 6,
        openPositions: 3,
        stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'published',
      },
      {
        company: companies[1]._id, // WSO2
        title: 'Frontend React Developer Intern',
        description: 'Design elegant and performant UI components using React, TypeScript, and modern design systems for identity server interfaces.',
        area: 'Web Development',
        requiredSkills: ['react', 'typescript', 'tailwind css', 'git', 'html'],
        qualifications: ['Hands-on experience with modern React hooks', 'Familiarity with Figma designs'],
        locationType: 'Remote',
        location: 'Colombo (Remote)',
        durationMonths: 6,
        openPositions: 2,
        stipend: { isPaid: true, amount: 50000, currency: 'LKR' },
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'published',
      },
      {
        company: companies[2]._id, // Sysco LABS
        title: 'Backend Systems Intern (Node.js & Cloud)',
        description: 'Work with our high-throughput backend services powering restaurant tech. Build and optimize microservices with Node.js, PostgreSQL, Docker, and AWS.',
        area: 'Software Engineering',
        requiredSkills: ['node.js', 'express', 'postgresql', 'docker', 'aws'],
        qualifications: ['Undergraduate in Computer Science / Software Engineering', 'Good understanding of relational databases'],
        locationType: 'On-site',
        location: 'Sysco LABS HQ, Colombo 03',
        durationMonths: 6,
        openPositions: 2,
        stipend: { isPaid: true, amount: 55000, currency: 'LKR' },
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'published',
      },
      {
        company: companies[0]._id, // Virtusa
        title: 'Data Science & Machine Learning Intern',
        description: 'Analyze complex datasets, build machine learning models, and create actionable business intelligence pipelines.',
        area: 'Data Science',
        requiredSkills: ['python', 'pandas', 'machine learning', 'sql'],
        qualifications: ['Sound mathematical & statistics background', 'Experience with scikit-learn / pandas'],
        locationType: 'Remote',
        location: 'Remote, Sri Lanka',
        durationMonths: 3,
        openPositions: 1,
        stipend: { isPaid: true, amount: 40000, currency: 'LKR' },
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'published',
      },
      {
        company: companies[1]._id, // WSO2
        title: 'Cyber Security Research Intern',
        description: 'Conduct vulnerability assessments, monitor API gateways, and assist in automated threat detection mechanisms.',
        area: 'Cyber Security',
        requiredSkills: ['linux', 'network security', 'python'],
        qualifications: ['Understanding of network protocols (TCP/IP, TLS)', 'Ethical hacking interest'],
        locationType: 'On-site',
        location: 'Colombo, Sri Lanka',
        durationMonths: 6,
        openPositions: 1,
        stipend: { isPaid: false, amount: 0, currency: 'LKR' },
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'published',
      },
    ];

    for (const data of sampleInternships) {
      const existing = await Internship.findOne({ title: data.title, company: data.company });
      if (!existing) {
        await Internship.create(data);
      }
    }

    console.log('[Seed] Sample data successfully seeded!');
    console.log('Sample Logins for testing:');
    console.log('  Student: saumya.student@internbridge.lk / Student123!');
    console.log('  Company: recruitment@virtusa.com / Company123!');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected.');
  }
};

// Execute if run directly
if (process.argv[1]?.endsWith('seedSearchData.js')) {
  seedSearchData();
}
