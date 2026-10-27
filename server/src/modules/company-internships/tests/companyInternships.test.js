/**
 * Test Suite: Module 2 — Company & Internship Management
 * Executes end-to-end API and security tests against the live Express app & MongoDB.
 */

import http from 'http';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { User } from '../../../models/User.js';
import { Company } from '../../../models/Company.js';
import { Internship } from '../../../models/Internship.js';
import { connectDB } from '../../../config/db.js';

let server;
let baseUrl;

const makeRequest = async (path, method = 'GET', body = null, token = null) => {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
};

const runTests = async () => {
  console.log('--- Starting Module 2 Backend Tests ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP server on dynamic test port
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running on ${baseUrl}`);
        resolve();
      });
    });

    const timestamp = Date.now();
    const companyAEmail = `test.company.a.${timestamp}@example.com`;
    const companyBEmail = `test.company.b.${timestamp}@example.com`;
    const studentEmail = `test.student.${timestamp}@example.com`;

    // 3. Register Company User A
    const regResA = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'Alpha Corp User',
      email: companyAEmail,
      password: 'Password123!',
      role: 'company',
    });
    assert(regResA.status === 201 && regResA.body.data.token, 'Register Company User A');
    const tokenA = regResA.body.data.token;

    // 4. Register Company User B
    const regResB = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'Beta Tech User',
      email: companyBEmail,
      password: 'Password123!',
      role: 'company',
    });
    assert(regResB.status === 201 && regResB.body.data.token, 'Register Company User B');
    const tokenB = regResB.body.data.token;

    // 5. Register Student User
    const regResStudent = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'Student Candidate',
      email: studentEmail,
      password: 'Password123!',
      role: 'student',
    });
    assert(regResStudent.status === 201 && regResStudent.body.data.token, 'Register Student User');
    const tokenStudent = regResStudent.body.data.token;

    // --- TEST GROUP: Company Profile RBAC & CRUD ---

    // 6. RBAC: Student cannot access GET /companies/me
    const studentMeRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenStudent);
    assert(studentMeRes.status === 403, 'RBAC Guard: Student receives 403 on GET /companies/me');

    // 7. Unauthenticated request receives 401
    const unauthRes = await makeRequest('/api/v1/companies/me', 'GET');
    assert(unauthRes.status === 401, 'Auth Guard: Missing token receives 401');

    // 8. Company A profile not found initially
    const getMeInitRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenA);
    assert(getMeInitRes.status === 404, 'GET /companies/me returns 404 before profile creation');

    // 9. Validation error on missing fields
    const invalidProfileRes = await makeRequest('/api/v1/companies/me', 'PUT', { name: '' }, tokenA);
    assert(invalidProfileRes.status === 400, 'PUT /companies/me returns 400 on missing name');

    // 10. Create Company A profile
    const createProfileRes = await makeRequest(
      '/api/v1/companies/me',
      'PUT',
      {
        name: 'Alpha Systems Pvt Ltd',
        description: 'Leading enterprise cloud solutions provider',
        industry: 'Software Engineering',
        location: {
          address: '100 Galle Road',
          city: 'Colombo',
          country: 'Sri Lanka',
        },
        website: 'https://alphasystems.lk',
        contactEmail: 'careers@alphasystems.lk',
        contactPhone: '+94112345678',
      },
      tokenA
    );
    assert(createProfileRes.status === 201 && createProfileRes.body.data.name === 'Alpha Systems Pvt Ltd', 'PUT /companies/me creates company profile (201)');
    const companyAId = createProfileRes.body.data._id;

    // 11. Fetch existing profile via GET /companies/me
    const getProfileRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenA);
    assert(getProfileRes.status === 200 && getProfileRes.body.data.industry === 'Software Engineering', 'GET /companies/me returns profile (200)');

    // 12. Public view GET /companies/:id
    const getPublicCompRes = await makeRequest(`/api/v1/companies/${companyAId}`, 'GET', null, tokenStudent);
    assert(getPublicCompRes.status === 200 && getPublicCompRes.body.data.name === 'Alpha Systems Pvt Ltd', 'GET /companies/:id accessible to student (200)');

    // --- TEST GROUP: Internship CRUD & Ownership Security ---

    // 13. Company B cannot post internship before creating company profile
    const postNoProfileRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'Backend Intern',
        description: 'Node.js developer',
        area: 'Software Engineering',
        requiredSkills: ['node.js'],
        location: 'Remote',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
      },
      tokenB
    );
    assert(postNoProfileRes.status === 400, 'POST /internships fails if company profile is missing (400)');

    // 14. Validation: Past deadline
    const pastDeadlineRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'Expired Intern',
        description: 'Test description',
        area: 'QA',
        requiredSkills: ['testing'],
        location: 'Colombo',
        deadline: new Date(Date.now() - 86400000).toISOString(),
      },
      tokenA
    );
    assert(pastDeadlineRes.status === 400, 'POST /internships rejects past deadline date (400)');

    // 15. Create valid internship by Company A
    const futureDeadline = new Date(Date.now() + 86400000 * 60).toISOString();
    const createInternshipRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'Full Stack Developer Intern',
        description: 'Building modern MERN web apps',
        area: 'Software Engineering',
        requiredSkills: ['React', ' NODE.JS ', 'MongoDB '],
        qualifications: ['Undergraduate in ICT', 'Good communication skills'],
        locationType: 'Hybrid',
        location: 'Colombo, Sri Lanka',
        durationMonths: 6,
        openPositions: 2,
        stipend: { isPaid: true, amount: 45000, currency: 'LKR' },
        deadline: futureDeadline,
        status: 'published',
      },
      tokenA
    );
    assert(
      createInternshipRes.status === 201 &&
        createInternshipRes.body.data.requiredSkills.includes('react') &&
        createInternshipRes.body.data.requiredSkills.includes('node.js'),
      'POST /internships creates listing and normalizes requiredSkills (201)'
    );
    const internshipId = createInternshipRes.body.data._id;

    // 16. Company A views its internships via GET /internships/my
    const getMyInternshipsRes = await makeRequest('/api/v1/internships/my', 'GET', null, tokenA);
    assert(
      getMyInternshipsRes.status === 200 &&
        getMyInternshipsRes.body.data.internships.length >= 1 &&
        getMyInternshipsRes.body.data.stats.published >= 1,
      'GET /internships/my returns company listings and stats (200)'
    );

    // 17. Public view GET /internships/:id
    const getSingleRes = await makeRequest(`/api/v1/internships/${internshipId}`, 'GET');
    assert(
      getSingleRes.status === 200 &&
        getSingleRes.body.data.company.name === 'Alpha Systems Pvt Ltd',
      'GET /internships/:id returns details with populated company (200)'
    );

    // 18. Set up Company B profile
    await makeRequest(
      '/api/v1/companies/me',
      'PUT',
      {
        name: 'Beta Tech Solutions',
        description: 'AI and cloud consultancy',
        industry: 'Data Science',
        location: { address: '200 Kandy Road', city: 'Kandy', country: 'Sri Lanka' },
        contactEmail: 'hr@betatech.lk',
      },
      tokenB
    );

    // 19. Security: Company B attempts to edit Company A's internship
    const unauthorizedEditRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'PUT',
      { title: 'Hacked Title' },
      tokenB
    );
    assert(unauthorizedEditRes.status === 403, 'Cross-tenant Guard: Company B receives 403 on updating Company A internship');

    // 20. Company A updates its internship
    const validEditRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'PUT',
      { title: 'Senior Full Stack Intern', openPositions: 3 },
      tokenA
    );
    assert(
      validEditRes.status === 200 && validEditRes.body.data.title === 'Senior Full Stack Intern',
      'PUT /internships/:id updates listing by owner (200)'
    );

    // 21. Security: Company B attempts to change status of Company A's internship
    const unauthorizedStatusRes = await makeRequest(
      `/api/v1/internships/${internshipId}/status`,
      'PATCH',
      { status: 'closed' },
      tokenB
    );
    assert(unauthorizedStatusRes.status === 403, 'Cross-tenant Guard: Company B receives 403 on status change');

    // 22. Company A changes status to closed
    const validStatusRes = await makeRequest(
      `/api/v1/internships/${internshipId}/status`,
      'PATCH',
      { status: 'closed' },
      tokenA
    );
    assert(
      validStatusRes.status === 200 && validStatusRes.body.data.status === 'closed',
      'PATCH /internships/:id/status toggles status to closed (200)'
    );

    // 23. Security: Company B attempts to delete Company A's internship
    const unauthorizedDeleteRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'DELETE',
      null,
      tokenB
    );
    assert(unauthorizedDeleteRes.status === 403, 'Cross-tenant Guard: Company B receives 403 on delete');

    // 24. Company A deletes its internship
    const validDeleteRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'DELETE',
      null,
      tokenA
    );
    assert(validDeleteRes.status === 200, 'DELETE /internships/:id deletes listing by owner (200)');

    // 25. Verify internship is gone
    const getDeletedRes = await makeRequest(`/api/v1/internships/${internshipId}`, 'GET');
    assert(getDeletedRes.status === 404, 'GET /internships/:id returns 404 after deletion');

    // Clean up test data
    await User.deleteMany({ email: { $in: [companyAEmail, companyBEmail, studentEmail] } });
    await Company.deleteMany({ _id: companyAId });
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    console.log(`\n--- Test Results: ${passed} Passed, ${failed} Failed ---`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
