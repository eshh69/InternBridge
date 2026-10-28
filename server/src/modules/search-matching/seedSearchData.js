import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { Company } from '../../models/Company.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { Internship } from '../../models/Internship.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internbridge';

// All Companies specified in the Internship Catalog
const COMPANIES_DATA = [
  // --- Local Companies (Sri Lanka) ---
  {
    name: 'WSO2',
    email: 'careers@wso2.com',
    industry: 'Enterprise Middleware & Open Source',
    location: { address: '20 Palm Grove', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://wso2.com',
    description: 'WSO2 is a global open-source enterprise software company delivering middleware for agile digital transformation.',
  },
  {
    name: 'Sri Lanka CERT',
    email: 'contact@cert.gov.lk',
    industry: 'Cyber Security & National Infrastructure',
    location: { address: 'Room 4-112, BMICH', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://cert.gov.lk',
    description: 'Sri Lanka Computer Emergency Readiness Team | Coordination Center for national cybersecurity protection.',
  },
  {
    name: 'IFS Sri Lanka',
    email: 'careers.lk@ifs.com',
    industry: 'Enterprise Software & Cloud ERP',
    location: { address: '501 Galle Road', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://www.ifs.com',
    description: 'IFS develops and delivers cloud enterprise software for companies around the world who manufacture and distribute goods.',
  },
  {
    name: 'Sysco LABS Sri Lanka',
    email: 'jobs@syscolabs.com',
    industry: 'Foodservice Technology & Logistics',
    location: { address: 'Sysco LABS HQ, Colombo 03', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://syscolabs.com',
    description: 'The captive innovation arm of Sysco Corporation, re-imagining global foodservice tech at scale.',
  },
  {
    name: '99x',
    email: 'careers@99x.com',
    industry: 'Product Engineering & Cloud Solutions',
    location: { address: '65 Walukarama Road', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://99x.io',
    description: 'A global product engineering company creating digital products for European and Scandinavian scale-ups.',
  },
  {
    name: 'Virtusa',
    email: 'recruitment@virtusa.com',
    industry: 'Information Technology & Consulting',
    location: { address: '752 Dr Danister De Silva Mawatha', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://www.virtusa.com',
    description: 'Virtusa provides high-end IT consulting, technology solutions and digital systems engineering.',
  },
  {
    name: 'Pearson Lanka',
    email: 'pearson.lanka@pearson.com',
    industry: 'EdTech & Digital Education',
    location: { address: 'Magistrate Court Rd, Colombo 09', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://pearson.com',
    description: 'The world’s leading digital learning company, providing cutting-edge educational platforms.',
  },
  {
    name: 'Dialog Axiata',
    email: 'careers@dialog.lk',
    industry: 'Telecommunications & Digital Services',
    location: { address: '475 Union Place', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://www.dialog.lk',
    description: 'Sri Lanka’s premier connectivity provider and digital network infrastructure powerhouse.',
  },
  {
    name: 'Calcey Technologies',
    email: 'info@calcey.com',
    industry: 'Bespoke Software Engineering',
    location: { address: 'Trace Expert City, Maradana', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://calcey.com',
    description: 'A boutique software development company creating web and mobile products for Silicon Valley and Europe.',
  },
  {
    name: 'MillenniumIT ESP',
    email: 'careers@mitesp.com',
    industry: 'Enterprise Solutions & Fintech Systems',
    location: { address: 'Millennium Drive, IT Park', city: 'Malabe', country: 'Sri Lanka' },
    website: 'https://www.mitesp.com',
    description: 'Leading enterprise solutions provider offering core banking, infrastructure, and database engineering.',
  },
  {
    name: 'Cake Engineering',
    email: 'careers@cake.net',
    industry: 'Restaurant Cloud Platforms',
    location: { address: 'Chatham Street', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://cake.net',
    description: 'Engineering high-throughput point-of-sale and operational software for commercial kitchens across the US.',
  },
  {
    name: 'Fortude',
    email: 'talent@fortude.com',
    industry: 'Enterprise Applications & Infor M3',
    location: { address: 'Level 10, West Tower, WTC', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://fortude.co',
    description: 'Global enterprise software company specializing in ERP implementations and secure digital services.',
  },
  {
    name: 'Surge Global',
    email: 'careers@surgeglobal.com',
    industry: 'Digital Media & Software Acceleration',
    location: { address: 'Vauxhall Street', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://surge.global',
    description: 'Technology and growth consulting firm building full-stack platforms for venture-backed global startups.',
  },
  {
    name: 'Zone24x7',
    email: 'careers@zone24x7.com',
    industry: 'IoT, Retail Technology & Embedded Systems',
    location: { address: 'Koswatta Road', city: 'Nawala', country: 'Sri Lanka' },
    website: 'https://zone24x7.com',
    description: 'Advanced engineering consulting firm delivering hardware-software solutions for Fortune 500 retailers.',
  },
  {
    name: 'Cyber Labs',
    email: 'ops@cyberlabs.com',
    industry: 'SOC Operations & Managed Detection',
    location: { address: 'Havelock Town', city: 'Colombo', country: 'Sri Lanka' },
    website: 'https://cyberlabs.lk',
    description: 'Dedicated security operations and threat management lab defending regional corporate data assets.',
  },

  // --- Foreign & International Companies ---
  {
    name: 'CrowdStrike',
    email: 'university@crowdstrike.com',
    industry: 'Cloud-native Cybersecurity',
    location: { address: '206 E 9th St', city: 'Austin', country: 'United States' },
    website: 'https://crowdstrike.com',
    description: 'Pioneering cloud-delivered endpoint protection and threat intelligence via the Falcon platform.',
  },
  {
    name: 'GitLab',
    email: 'campus@gitlab.com',
    industry: 'DevSecOps & Collaboration',
    location: { address: 'Marina Bay Financial Centre', city: 'Singapore', country: 'Singapore' },
    website: 'https://gitlab.com',
    description: 'The complete AI-powered DevSecOps platform delivered as a single all-remote application.',
  },
  {
    name: 'Cloudflare',
    email: 'internships@cloudflare.com',
    industry: 'Cloud Connectivity & Edge Security',
    location: { address: 'County Hall, Belvedere Rd', city: 'London', country: 'United Kingdom' },
    website: 'https://cloudflare.com',
    description: 'Connecting and protecting millions of web properties across a global edge network.',
  },
  {
    name: 'Vercel',
    email: 'careers@vercel.com',
    industry: 'Frontend Cloud & Developer Experience',
    location: { address: '440 N Barranca Ave', city: 'San Francisco', country: 'United States' },
    website: 'https://vercel.com',
    description: 'Creators of Next.js, empowering developers to build and deploy fast, resilient web applications globally.',
  },
  {
    name: 'Mandiant (Google Cloud)',
    email: 'talent@mandiant.com',
    industry: 'Incident Response & Threat Intelligence',
    location: { address: 'Gordon House, Barrow St', city: 'Dublin', country: 'Ireland' },
    website: 'https://mandiant.com',
    description: 'Recognized cybersecurity leader providing frontline threat intelligence and penetration testing.',
  },
  {
    name: 'Automattic',
    email: 'hiring@automattic.com',
    industry: 'Open Web Platforms & Publishing',
    location: { address: '60 29th Street', city: 'San Francisco', country: 'Global' },
    website: 'https://automattic.com',
    description: 'The distributed company behind WordPress.com, WooCommerce, and Tumblr, championing the open web.',
  },
  {
    name: 'Trend Micro',
    email: 'careers@trendmicro.com',
    industry: 'Global Cybersecurity Solutions',
    location: { address: 'Shinjuku MAYNDS Tower', city: 'Tokyo', country: 'Japan' },
    website: 'https://trendmicro.com',
    description: 'Global cybersecurity leader defending enterprises with automated threat research and cloud security.',
  },
  {
    name: 'Spotify',
    email: 'students@spotify.com',
    industry: 'Digital Audio & Media Streaming',
    location: { address: 'Regeringsgatan 19', city: 'Stockholm', country: 'Sweden' },
    website: 'https://spotify.com',
    description: 'World’s most popular audio streaming subscription service connecting millions of creators and fans.',
  },
  {
    name: 'Palo Alto Networks',
    email: 'earlytalent@paloaltonetworks.com',
    industry: 'Next-Generation Firewalls & SASE',
    location: { address: '100 Mount St', city: 'Sydney', country: 'Australia' },
    website: 'https://paloaltonetworks.com',
    description: 'Global cybersecurity leader continually delivering innovation to outpace cyber threats.',
  },
  {
    name: 'Postman',
    email: 'jobs@postman.com',
    industry: 'API Development & Collaboration',
    location: { address: 'Indiranagar 100ft Road', city: 'Bangalore', country: 'India' },
    website: 'https://postman.com',
    description: 'The world’s leading API platform used by over 30 million developers to build modern software.',
  },
  {
    name: 'Datadog',
    email: 'recruiting@datadog.com',
    industry: 'Observability & Cloud Monitoring',
    location: { address: '9 Rue du Quatre-Septembre', city: 'Paris', country: 'France' },
    website: 'https://datadoghq.com',
    description: 'Essential monitoring and security platform for cloud applications and Site Reliability Engineering.',
  },
  {
    name: 'Synopsys',
    email: 'careers@synopsys.com',
    industry: 'Silicon to Software & AppSec',
    location: { address: 'Karl-Hammerschmidt-Straße', city: 'Munich', country: 'Germany' },
    website: 'https://synopsys.com',
    description: 'Global leader in electronic design automation and application security testing technologies.',
  },
  {
    name: 'Canva',
    email: 'careers@canva.com',
    industry: 'Visual Communication & Design Platforms',
    location: { address: '110 Kippax St, Surry Hills', city: 'Sydney', country: 'Australia' },
    website: 'https://canva.com',
    description: 'Online visual communications platform on a mission to empower everyone in the world to design.',
  },
  {
    name: 'MongoDB Inc.',
    email: 'university@mongodb.com',
    industry: 'Modern Developer Data Platform',
    location: { address: '1633 Broadway', city: 'New York', country: 'United States' },
    website: 'https://mongodb.com',
    description: 'The leading developer data platform powering mission-critical applications across the globe.',
  },
  {
    name: 'Darktrace',
    email: 'careers@darktrace.com',
    industry: 'Cyber AI & Autonomous Defense',
    location: { address: 'Maurice Wilkes Building, St John’s', city: 'Cambridge', country: 'United Kingdom' },
    website: 'https://darktrace.com',
    description: 'Global leader in cyber artificial intelligence, delivering self-learning autonomous security response.',
  },
];

// All 34 Internship Opportunities enriched with required real-world skills
const ALL_34_INTERNSHIPS = [
  // --- PART 1: SRI LANKA LOCAL INTERNSHIPS (1 - 15) ---
  {
    companyName: 'WSO2',
    title: 'Cyber Security Research Intern',
    description: 'Conduct vulnerability assessments, monitor API gateways, and assist in automated threat detection mechanisms.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'network security', 'linux', 'python', 'rest api'],
    qualifications: ['Undergraduate in Cybersecurity or IT', 'Hands-on understanding of Linux OS and network protocols'],
    locationType: 'On-site',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 1,
    stipend: { isPaid: false, amount: 0, currency: 'LKR' },
    deadline: new Date('2026-12-20T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Sri Lanka CERT',
    title: 'Associate Security Analyst Intern',
    description: 'Assist the national CERT team in security incident response, network packet inspection with Wireshark, and threat analysis.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'python', 'wireshark', 'linux', 'network security'],
    qualifications: ['Undergraduate in Information Security or Computer Science', 'Familiarity with incident handling and packet analysis'],
    locationType: 'On-site',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 30000, currency: 'LKR' },
    deadline: new Date('2026-11-15T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'IFS Sri Lanka',
    title: 'Software Engineering Intern (Web)',
    description: 'Develop enterprise-grade cloud web applications using modern React, TypeScript, Java services, and REST APIs.',
    area: 'Web Development',
    requiredSkills: ['react', 'typescript', 'node.js', 'java', 'rest api', 'html & css'],
    qualifications: ['Undergraduate in Software Engineering or Computer Science', 'Strong OOP and modern web framework concepts'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 4,
    stipend: { isPaid: true, amount: 55000, currency: 'LKR' },
    deadline: new Date('2026-11-30T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Sysco LABS Sri Lanka',
    title: 'Full-Stack Developer Intern',
    description: 'Contribute to restaurant technology platforms using React for frontend and Node.js with Express.js and MySQL in production.',
    area: 'Full-Stack',
    requiredSkills: ['react', 'node.js', 'express.js', 'javascript', 'docker', 'mysql', 'rest api'],
    qualifications: ['Undergraduate in CS/SE', 'Understanding of containerization and REST APIs'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 3,
    stipend: { isPaid: true, amount: 50000, currency: 'LKR' },
    deadline: new Date('2026-12-05T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: '99x',
    title: 'Frontend Engineering Intern',
    description: 'Craft high-performance, pixel-perfect user experiences for Scandinavian scale-ups with React, Next.js, and Figma design tokens.',
    area: 'Frontend Web',
    requiredSkills: ['react', 'next.js', 'typescript', 'javascript', 'html & css', 'figma'],
    qualifications: ['Passion for clean UI/UX and modern frontend architecture', 'Experience with React component life-cycle'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
    deadline: new Date('2026-11-25T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Virtusa',
    title: 'Backend Developer Intern',
    description: 'Design and implement scalable backend APIs with Node.js, Express.js, MySQL schemas, and microservices packaged in Docker.',
    area: 'Backend Web',
    requiredSkills: ['node.js', 'express.js', 'mysql', 'javascript', 'docker', 'rest api'],
    qualifications: ['Proficiency in JavaScript/Node.js', 'Solid understanding of relational database normalization'],
    locationType: 'On-site',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 5,
    stipend: { isPaid: true, amount: 40000, currency: 'LKR' },
    deadline: new Date('2026-12-10T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Pearson Lanka',
    title: 'Cloud & DevOps Intern',
    description: 'Automate build pipelines, orchestrate Docker containers on Linux, and build cloud automation scripts in Python.',
    area: 'Cloud / DevOps',
    requiredSkills: ['docker', 'linux', 'python', 'rest api', 'git'],
    qualifications: ['Knowledge of CI/CD concepts', 'Basic cloud hosting and Bash scripting skills'],
    locationType: 'Remote',
    location: 'Sri Lanka (Remote)',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
    deadline: new Date('2026-11-28T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Dialog Axiata',
    title: 'Information Security Intern',
    description: 'Monitor telecom network security perimeters, perform log analysis on Linux servers, and script security audits with Python.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'network security', 'linux', 'python', 'rest api'],
    qualifications: ['Undergraduate in Telecommunications, Networking, or Cyber Security'],
    locationType: 'On-site',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 35000, currency: 'LKR' },
    deadline: new Date('2026-12-12T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Calcey Technologies',
    title: 'React Developer Intern',
    description: 'Build fast, responsive interfaces using React, JavaScript, TypeScript, and Tailwind CSS for US and Australian client projects.',
    area: 'Frontend Web',
    requiredSkills: ['react', 'javascript', 'typescript', 'html & css', 'tailwind css', 'figma'],
    qualifications: ['Strong JavaScript fundamentals', 'Attention to visual detail and responsive design'],
    locationType: 'Remote',
    location: 'Sri Lanka (Remote)',
    durationMonths: 3,
    openPositions: 1,
    stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
    deadline: new Date('2026-11-20T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'MillenniumIT ESP',
    title: 'Database & Backend Intern',
    description: 'Work with enterprise core banking and database systems using MySQL, MongoDB, Java, and Express.js backend services.',
    area: 'Database Systems',
    requiredSkills: ['mysql', 'mongodb', 'node.js', 'express.js', 'java', 'rest api'],
    qualifications: ['Undergraduate in Computer Science / IT', 'Sound query optimization knowledge'],
    locationType: 'On-site',
    location: 'Malabe, Sri Lanka',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 40000, currency: 'LKR' },
    deadline: new Date('2026-12-01T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Cake Engineering',
    title: 'QA Automation Intern',
    description: 'Develop automated test suites using Python and Selenium, integrate test containers with Docker in continuous deployment.',
    area: 'QA / Testing',
    requiredSkills: ['python', 'selenium', 'docker', 'rest api', 'linux'],
    qualifications: ['Interest in test automation frameworks', 'Analytical mindset and bug tracking proficiency'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
    deadline: new Date('2026-11-18T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Fortude',
    title: 'Application Security Intern',
    description: 'Execute OWASP Top 10 vulnerability assessments, perform static code analysis, and inspect enterprise Java and Linux environments.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'owasp', 'python', 'linux', 'java'],
    qualifications: ['Knowledge of web application vulnerabilities (XSS, SQLi, CSRF)', 'Basic scripting'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 1,
    stipend: { isPaid: true, amount: 40000, currency: 'LKR' },
    deadline: new Date('2026-12-15T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Surge Global',
    title: 'MERN Stack Developer Intern',
    description: 'Build modern data-driven web applications, dashboards, and auth workflows using MongoDB, Express.js, React, Node.js, and Firebase.',
    area: 'Full-Stack',
    requiredSkills: ['mongodb', 'express.js', 'react', 'node.js', 'javascript', 'firebase'],
    qualifications: ['Familiarity with MERN stack fundamentals', 'Experience with Git collaboration'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 3,
    openPositions: 3,
    stipend: { isPaid: true, amount: 40000, currency: 'LKR' },
    deadline: new Date('2026-11-22T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Zone24x7',
    title: 'Mobile & Web Intern',
    description: 'Develop mobile and web interfaces with React, JavaScript, TypeScript, and Node.js, integrating Firebase and retail IoT solutions.',
    area: 'Web & Mobile',
    requiredSkills: ['react', 'javascript', 'typescript', 'node.js', 'firebase', 'rest api'],
    qualifications: ['Undergraduate in ICT or Computer Systems', 'Interest in mobile/web hybrid tech'],
    locationType: 'On-site',
    location: 'Nawala, Sri Lanka',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 42000, currency: 'LKR' },
    deadline: new Date('2026-12-08T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Cyber Labs',
    title: 'SOC Analyst Intern',
    description: 'Monitor Security Information and Event Management (SIEM) consoles, investigate alerts, and configure Linux defense sensors.',
    area: 'SOC Operations',
    requiredSkills: ['cybersecurity', 'network security', 'linux', 'siem', 'python'],
    qualifications: ['Familiarity with SIEM concepts and log parsing', 'Undergraduate in Cyber Security'],
    locationType: 'On-site',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 1,
    stipend: { isPaid: true, amount: 35000, currency: 'LKR' },
    deadline: new Date('2026-11-10T23:59:59Z'),
    status: 'published',
  },

  // --- PART 2: FOREIGN COUNTRIES (REMOTE & INTERNATIONAL INTERNSHIPS) (16 - 30) ---
  {
    companyName: 'CrowdStrike',
    title: 'Cloud Security Intern',
    description: 'Analyze cloud workload telemetry, build threat hunting detection scripts in Python and C++, and secure container runtimes with Docker on Linux.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'python', 'docker', 'linux', 'c++', 'rest api'],
    qualifications: ['Undergraduate in CS or Cybersecurity', 'Strong knowledge of Linux systems and cloud security concepts'],
    locationType: 'Remote',
    location: 'United States (Remote)',
    durationMonths: 3,
    openPositions: 3,
    stipend: { isPaid: true, amount: 35, currency: '$/hr' },
    deadline: new Date('2026-12-15T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'GitLab',
    title: 'Junior Frontend Engineer Intern',
    description: 'Contribute to the open DevOps platform using React, JavaScript, TypeScript, and Next.js, building accessible UI components from Figma.',
    area: 'Web Development',
    requiredSkills: ['react', 'javascript', 'typescript', 'next.js', 'html & css', 'figma'],
    qualifications: ['Experience contributing to open source or full-stack web applications', 'Proficient in Git workflows'],
    locationType: 'Remote',
    location: 'Global / Singapore (Remote)',
    durationMonths: 3,
    openPositions: 4,
    stipend: { isPaid: true, amount: 25, currency: '$/hr' },
    deadline: new Date('2026-11-30T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Cloudflare',
    title: 'Security Operations Intern',
    description: 'Assist in protecting edge infrastructure, investigating DDoS mitigation logs, analyzing network protocols, and developing Go and C++ tools.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'network security', 'linux', 'go', 'c++'],
    qualifications: ['Strong grasp of TCP/IP, DNS, and HTTP protocols', 'Familiarity with Go or C systems programming'],
    locationType: 'Remote',
    location: 'United Kingdom (Remote)',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 22, currency: '£/hr' },
    deadline: new Date('2026-12-01T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Vercel',
    title: 'Full-Stack Engineering Intern',
    description: 'Build cutting-edge edge-computing and deployment features using Next.js, TypeScript, JavaScript, Node.js, and Supabase for global developer tooling.',
    area: 'Web Development',
    requiredSkills: ['next.js', 'typescript', 'javascript', 'node.js', 'supabase', 'rest api'],
    qualifications: ['Deep knowledge of Next.js App Router and server components', 'Passion for web performance'],
    locationType: 'Remote',
    location: 'United States (Remote)',
    durationMonths: 3,
    openPositions: 2,
    stipend: { isPaid: true, amount: 38, currency: '$/hr' },
    deadline: new Date('2026-12-10T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Mandiant (Google Cloud)',
    title: 'Penetration Testing Intern',
    description: 'Perform advanced penetration tests, build exploitation proof-of-concepts in Python, and assess enterprise network resilience.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'linux', 'python', 'network security', 'rest api'],
    qualifications: ['Experience with offensive security tooling and ethical hacking labs', 'Undergraduate in Cybersecurity/CS'],
    locationType: 'Hybrid',
    location: 'Dublin, Ireland',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 2800, currency: '€' },
    deadline: new Date('2027-01-10T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Automattic',
    title: 'Node.js Backend Intern',
    description: 'Develop distributed backend microservices and data pipelines with Node.js, Express.js, JavaScript, MySQL, and Docker for millions of WordPress VIP users.',
    area: 'Backend Web',
    requiredSkills: ['node.js', 'express.js', 'javascript', 'mysql', 'docker', 'rest api'],
    qualifications: ['Self-motivated and effective communicator in distributed, async work environments'],
    locationType: 'Remote',
    location: 'Global (Remote)',
    durationMonths: 3,
    openPositions: 5,
    stipend: { isPaid: true, amount: 28, currency: '$/hr' },
    deadline: new Date('2026-11-25T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Trend Micro',
    title: 'Threat Intelligence Research Intern',
    description: 'Analyze malware samples, disassemble binaries with C++ and Linux, and create automated threat indicators in Python.',
    area: 'Threat Research',
    requiredSkills: ['cybersecurity', 'c++', 'python', 'linux', 'reverse engineering'],
    qualifications: ['Basic knowledge of assembly (x86/x64) and disassemblers (Ghidra, IDA Pro)'],
    locationType: 'Hybrid',
    location: 'Tokyo, Japan',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 300000, currency: '¥' },
    deadline: new Date('2026-12-18T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Spotify',
    title: 'Frontend Web Intern',
    description: 'Build engaging web player features and creator dashboards using React, JavaScript, TypeScript, Next.js, and Figma at international scale.',
    area: 'Frontend Web',
    requiredSkills: ['react', 'javascript', 'typescript', 'next.js', 'html & css', 'figma'],
    qualifications: ['Passion for music streaming UI and web audio technologies', 'Proficient in modern CSS/Tailwind'],
    locationType: 'Hybrid',
    location: 'Stockholm, Sweden',
    durationMonths: 6,
    openPositions: 3,
    stipend: { isPaid: true, amount: 32000, currency: 'SEK' },
    deadline: new Date('2026-11-29T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Palo Alto Networks',
    title: 'Vulnerability Assessment Intern',
    description: 'Inspect next-generation firewall telemetry, script automated security scanners with Python, and run Dockerized test harnesses.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'python', 'network security', 'docker', 'rest api'],
    qualifications: ['Undergraduate in Computer Science, Cyber Security, or Information Systems'],
    locationType: 'Remote',
    location: 'Australia (Remote)',
    durationMonths: 3,
    openPositions: 2,
    stipend: { isPaid: true, amount: 36, currency: 'A$/hr' },
    deadline: new Date('2026-12-05T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Postman',
    title: 'API & Platform Engineer Intern',
    description: 'Help build the next generation of API collaboration tooling, Express.js middleware, JavaScript SDKs, and containerized runtime engines.',
    area: 'API Infrastructure',
    requiredSkills: ['rest api', 'node.js', 'express.js', 'javascript', 'typescript', 'docker'],
    qualifications: ['Knowledge of REST, GraphQL, or gRPC', 'Strong JavaScript / TypeScript fundamentals'],
    locationType: 'Remote',
    location: 'India / Global (Remote)',
    durationMonths: 6,
    openPositions: 4,
    stipend: { isPaid: true, amount: 50000, currency: '₹' },
    deadline: new Date('2026-12-20T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Datadog',
    title: 'Site Reliability Engineering Intern',
    description: 'Develop automated monitoring, observability scripts in Python, query MySQL metrics, and manage scalable Linux and Docker container infrastructure.',
    area: 'SRE / DevOps',
    requiredSkills: ['docker', 'linux', 'python', 'mysql', 'rest api'],
    qualifications: ['Strong troubleshooting abilities in Linux/Unix', 'Familiarity with cloud metrics'],
    locationType: 'Hybrid',
    location: 'Paris, France',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 2500, currency: '€' },
    deadline: new Date('2027-01-05T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Synopsys',
    title: 'Software Security Intern',
    description: 'Evaluate static and dynamic application security testing (SAST/DAST) tools, analyze Java and C++ codebases, MySQL databases, and script in Python.',
    area: 'AppSec',
    requiredSkills: ['cybersecurity', 'c++', 'java', 'python', 'linux', 'mysql'],
    qualifications: ['Interest in secure coding practices and software development life-cycle security'],
    locationType: 'Hybrid',
    location: 'Munich, Germany',
    durationMonths: 6,
    openPositions: 1,
    stipend: { isPaid: true, amount: 2200, currency: '€' },
    deadline: new Date('2026-12-15T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Canva',
    title: 'React & Design Systems Intern',
    description: 'Contribute to Canva’s core design system, building accessible React components, JavaScript & TypeScript interfaces, and Figma token integrations.',
    area: 'Frontend Web',
    requiredSkills: ['react', 'javascript', 'typescript', 'html & css', 'figma', 'docker'],
    qualifications: ['Experience with UI component libraries and design tokens', 'Attention to web accessibility'],
    locationType: 'Remote',
    location: 'Sydney, Australia (Remote)',
    durationMonths: 3,
    openPositions: 3,
    stipend: { isPaid: true, amount: 34, currency: 'A$/hr' },
    deadline: new Date('2026-11-30T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'MongoDB Inc.',
    title: 'Database Infrastructure Intern',
    description: 'Work with the MongoDB core server and driver teams, building automation tools in Python, core components in C++, and testing Docker distributed clusters.',
    area: 'Databases',
    requiredSkills: ['mongodb', 'c++', 'python', 'docker', 'rest api'],
    qualifications: ['Knowledge of distributed systems and database indexing', 'Proficient in Python or C++'],
    locationType: 'Remote',
    location: 'United States (Remote)',
    durationMonths: 3,
    openPositions: 2,
    stipend: { isPaid: true, amount: 36, currency: '$/hr' },
    deadline: new Date('2026-12-22T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Darktrace',
    title: 'Cyber Defense Operations Intern',
    description: 'Support cyber threat analysts monitoring enterprise networks with AI and Machine Learning cyber defense platforms across Linux and Python.',
    area: 'Cyber Security',
    requiredSkills: ['cybersecurity', 'machine learning', 'network security', 'linux', 'python'],
    qualifications: ['Undergraduate in Computer Science, Cyber Security, or Mathematics', 'Strong analytical skills'],
    locationType: 'On-site',
    location: 'Cambridge, UK',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 2400, currency: '£' },
    deadline: new Date('2027-01-15T23:59:59Z'),
    status: 'published',
  },

  // --- PART 3: ADDITIONAL CORE OFFERINGS (31 - 34) ---
  {
    companyName: 'Virtusa',
    title: 'Full Stack Engineering Intern (MERN)',
    description: 'Join Virtusa to develop scalable web applications using React, Node.js, Express.js, MongoDB, JavaScript, and HTML & CSS with RESTful microservices.',
    area: 'Software Engineering',
    requiredSkills: ['react', 'node.js', 'express.js', 'mongodb', 'javascript', 'html & css', 'rest api'],
    qualifications: ['Undergraduate in ICT/CS', 'Knowledge of RESTful APIs and Git', 'Strong team communication'],
    locationType: 'Hybrid',
    location: 'Colombo, Sri Lanka',
    durationMonths: 6,
    openPositions: 3,
    stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
    deadline: new Date('2026-11-20T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'WSO2',
    title: 'Frontend React Developer Intern',
    description: 'Design elegant and performant UI components using React, JavaScript, TypeScript, HTML & CSS, and Figma for Identity Server interfaces.',
    area: 'Web Development',
    requiredSkills: ['react', 'javascript', 'typescript', 'html & css', 'figma', 'rest api'],
    qualifications: ['Hands-on experience with modern React hooks', 'Familiarity with Figma designs'],
    locationType: 'Remote',
    location: 'Colombo (Remote)',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 50000, currency: 'LKR' },
    deadline: new Date('2026-12-05T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Sysco LABS Sri Lanka',
    title: 'Backend Systems Intern (Node.js & Cloud)',
    description: 'Work with high-throughput backend services powering restaurant tech. Build and optimize microservices with Node.js, Express.js, JavaScript, MySQL, Docker, and REST APIs.',
    area: 'Software Engineering',
    requiredSkills: ['node.js', 'express.js', 'javascript', 'mysql', 'docker', 'rest api'],
    qualifications: ['Undergraduate in Computer Science / Software Engineering', 'Good understanding of relational databases'],
    locationType: 'On-site',
    location: 'Sysco LABS HQ, Colombo 03',
    durationMonths: 6,
    openPositions: 2,
    stipend: { isPaid: true, amount: 55000, currency: 'LKR' },
    deadline: new Date('2026-11-10T23:59:59Z'),
    status: 'published',
  },
  {
    companyName: 'Virtusa',
    title: 'Data Science & Machine Learning Intern',
    description: 'Analyze complex datasets, build machine learning models, and create actionable business intelligence pipelines using Python, Pandas, MySQL, and REST APIs.',
    area: 'Data Science',
    requiredSkills: ['machine learning', 'python', 'pandas', 'mysql', 'rest api'],
    qualifications: ['Sound mathematical & statistics background', 'Experience with scikit-learn / pandas'],
    locationType: 'Remote',
    location: 'Remote, Sri Lanka',
    durationMonths: 3,
    openPositions: 1,
    stipend: { isPaid: true, amount: 40000, currency: 'LKR' },
    deadline: new Date('2026-11-05T23:59:59Z'),
    status: 'published',
  },
];

export const seedSearchData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected.');

    // 1. Seed Companies
    console.log('[Seed] Seeding companies...');
    const companyMap = new Map();

    for (const cData of COMPANIES_DATA) {
      let cUser = await User.findOne({ email: cData.email });
      if (!cUser) {
        cUser = await User.create({
          name: `${cData.name} Recruiting`,
          email: cData.email,
          role: 'company',
          passwordHash: await User.hashPassword('Company123!'),
        });
      }

      let company = await Company.findOne({
        $or: [{ user: cUser._id }, { name: cData.name }],
      });

      if (!company) {
        company = await Company.create({
          user: cUser._id,
          name: cData.name,
          description: cData.description,
          industry: cData.industry,
          location: cData.location,
          website: cData.website,
          contactEmail: cData.email,
          verificationStatus: 'verified',
          reputationScore: 4.8,
          reviewCount: 18,
        });
      } else {
        company.name = cData.name;
        company.description = cData.description;
        company.industry = cData.industry;
        company.location = cData.location;
        company.website = cData.website;
        company.contactEmail = cData.email;
        company.verificationStatus = 'verified';
        await company.save();
      }

      companyMap.set(cData.name, company);
      if (cData.name === 'Sysco LABS Sri Lanka') {
        companyMap.set('Sysco', company);
      }
    }

    // 2. Ensure Student Profiles Exist
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
        bio: 'Passionate full-stack web developer experienced with modern JavaScript, React, Node.js, Express.js, and MongoDB.',
        skills: [
          'react',
          'node.js',
          'mongodb',
          'javascript',
          'express.js',
          'html & css',
          'rest api',
          'mysql',
          'git',
          'python',
          'cybersecurity',
        ],
        reputationScore: 4.9,
        reviewCount: 4,
        projects: [
          {
            title: 'InternBridge Portal',
            description: 'Full stack recruitment platform with algorithmic matching engine.',
            technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
          },
        ],
      });
    }

    // 3. Upsert All 34 Internships
    console.log('[Seed] Seeding all 34 internships with enriched skills...');
    let seededCount = 0;
    for (const item of ALL_34_INTERNSHIPS) {
      const company = companyMap.get(item.companyName);
      if (!company) {
        console.warn(`[Seed Warning] Company ${item.companyName} not found!`);
        continue;
      }

      const internshipDoc = {
        company: company._id,
        title: item.title,
        description: item.description,
        area: item.area,
        requiredSkills: item.requiredSkills.map((s) => s.toLowerCase().trim()),
        qualifications: item.qualifications,
        locationType: item.locationType,
        location: item.location,
        durationMonths: item.durationMonths,
        openPositions: item.openPositions,
        stipend: item.stipend,
        deadline: item.deadline,
        status: item.status,
      };

      const existing = await Internship.findOne({
        title: item.title,
        company: company._id,
      });

      if (!existing) {
        await Internship.create(internshipDoc);
        seededCount++;
      } else {
        await Internship.findByIdAndUpdate(existing._id, internshipDoc);
      }
    }

    const totalInternships = await Internship.countDocuments({ status: 'published' });
    console.log(`[Seed Complete] Successfully updated database. Total published internships now: ${totalInternships} (New: ${seededCount})`);
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
