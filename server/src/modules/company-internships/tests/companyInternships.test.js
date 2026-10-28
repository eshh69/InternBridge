/**
 * Test Suite: Module 2 — Company & Internship Management
 * Executes comprehensive end-to-end API, RBAC, ownership, validation, and integration tests
 * against the live Express application & MongoDB database.
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
  console.log('--- Starting Module 2 Comprehensive Backend Tests ---');
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

    // --- TEST GROUP: Company Profile RBAC, Creation & Persistence ---

    // 6. RBAC: Student cannot access GET /companies/me
    const studentMeRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenStudent);
    assert(studentMeRes.status === 403, 'RBAC Guard: Student receives 403 on GET /companies/me');

    // 7. Auth Guard: Missing token receives 401
    const unauthRes = await makeRequest('/api/v1/companies/me', 'GET');
    assert(unauthRes.status === 401, 'Auth Guard: Missing token receives 401');

    // 8. Company A profile not found initially
    const getMeInitRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenA);
    assert(getMeInitRes.status === 404, 'GET /companies/me returns 404 before profile creation');

    // 9. Validation error on missing name
    const invalidProfileRes = await makeRequest('/api/v1/companies/me', 'PUT', { name: '' }, tokenA);
    assert(invalidProfileRes.status === 400, 'PUT /companies/me returns 400 on missing name');

    // 10. Validation error on invalid email format
    const invalidEmailRes = await makeRequest(
      '/api/v1/companies/me',
      'PUT',
      {
        name: 'Alpha Systems',
        description: 'Tech company',
        industry: 'Software',
        contactEmail: 'not-an-email',
      },
      tokenA
    );
    assert(invalidEmailRes.status === 400, 'PUT /companies/me returns 400 on invalid email');

    // 11. Create Company A profile
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
    assert(
      createProfileRes.status === 201 &&
        createProfileRes.body.data.name === 'Alpha Systems Pvt Ltd' &&
        createProfileRes.body.data.verificationStatus === 'unverified',
      'PUT /companies/me creates company profile with correct initial status (201)'
    );
    const companyAId = createProfileRes.body.data._id;

    // 12. Fetch existing profile via GET /companies/me
    const getProfileRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenA);
    assert(
      getProfileRes.status === 200 && getProfileRes.body.data.industry === 'Software Engineering',
      'GET /companies/me returns profile (200)'
    );

    // 13. Update existing company profile and verify persistence
    const updateProfileRes = await makeRequest(
      '/api/v1/companies/me',
      'PUT',
      {
        name: 'Alpha Systems Group',
        description: 'Leading cloud native and AI innovation partner',
        industry: 'Information Technology',
        location: { address: '150 Galle Road', city: 'Colombo 03', country: 'Sri Lanka' },
        website: 'https://alphasystems.io',
        contactEmail: 'talent@alphasystems.io',
        contactPhone: '+94119998888',
      },
      tokenA
    );
    assert(
      updateProfileRes.status === 200 &&
        updateProfileRes.body.data.name === 'Alpha Systems Group' &&
        updateProfileRes.body.data.website === 'https://alphasystems.io',
      'PUT /companies/me updates existing profile (200)'
    );

    // Verify persisted update via reload
    const verifyUpdatedProfileRes = await makeRequest('/api/v1/companies/me', 'GET', null, tokenA);
    assert(
      verifyUpdatedProfileRes.status === 200 &&
        verifyUpdatedProfileRes.body.data.name === 'Alpha Systems Group' &&
        verifyUpdatedProfileRes.body.data.contactEmail === 'talent@alphasystems.io',
      'Company profile updates persist after subsequent GET reload (200)'
    );

    // 14. Public view GET /companies/:id accessible to authenticated user
    const getPublicCompRes = await makeRequest(`/api/v1/companies/${companyAId}`, 'GET', null, tokenStudent);
    assert(
      getPublicCompRes.status === 200 && getPublicCompRes.body.data.name === 'Alpha Systems Group',
      'GET /companies/:id accessible to student (200)'
    );

    // --- TEST GROUP: Internship Creation, Skills & Validation ---

    // 15. Company B cannot post internship before creating company profile
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

    // 16. Validation: Reject empty required skills
    const emptySkillsRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'Full Stack Intern',
        description: 'Test description',
        area: 'Software Engineering',
        requiredSkills: [],
        location: 'Colombo',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
      },
      tokenA
    );
    assert(emptySkillsRes.status === 400, 'POST /internships rejects empty requiredSkills (400)');

    // 17. Validation: Past deadline rejected
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

    // 18. Validation: Negative stipend rejected
    const negativeStipendRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'QA Intern',
        description: 'Test description',
        area: 'Quality Assurance',
        requiredSkills: ['cypress'],
        location: 'Colombo',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        stipend: { isPaid: true, amount: -1000 },
      },
      tokenA
    );
    assert(negativeStipendRes.status === 400, 'POST /internships rejects negative stipend (400)');

    // 19. Create valid published internship by Company A
    const futureDeadline = new Date(Date.now() + 86400000 * 60).toISOString();
    const createInternshipRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'Full Stack Developer Intern',
        description: 'Building modern MERN web apps with microservices',
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
        createInternshipRes.body.data.requiredSkills.includes('node.js') &&
        createInternshipRes.body.data.status === 'published',
      'POST /internships creates listing and normalizes requiredSkills to lowercase (201)'
    );
    const internshipId = createInternshipRes.body.data._id;

    // 20. Create a draft internship
    const createDraftRes = await makeRequest(
      '/api/v1/internships',
      'POST',
      {
        title: 'DevOps Engineer Intern',
        description: 'Cloud infrastructure and CI/CD pipelines',
        area: 'DevOps & Cloud Engineering',
        requiredSkills: ['Docker', 'AWS', 'Linux'],
        location: 'Colombo',
        deadline: futureDeadline,
        status: 'draft',
      },
      tokenA
    );
    assert(
      createDraftRes.status === 201 && createDraftRes.body.data.status === 'draft',
      'POST /internships supports creating listings in draft status (201)'
    );
    const draftInternshipId = createDraftRes.body.data._id;

    // 21. Company A views its internships via GET /internships/my
    const getMyInternshipsRes = await makeRequest('/api/v1/internships/my', 'GET', null, tokenA);
    assert(
      getMyInternshipsRes.status === 200 &&
        getMyInternshipsRes.body.data.internships.length >= 2 &&
        getMyInternshipsRes.body.data.stats.published >= 1 &&
        getMyInternshipsRes.body.data.stats.draft >= 1,
      'GET /internships/my returns company listings and segregated KPI stats (200)'
    );

    // 22. Filter by status parameter on GET /internships/my?status=draft
    const getDraftsOnlyRes = await makeRequest('/api/v1/internships/my?status=draft', 'GET', null, tokenA);
    assert(
      getDraftsOnlyRes.status === 200 &&
        getDraftsOnlyRes.body.data.internships.every((i) => i.status === 'draft'),
      'GET /internships/my?status=draft accurately filters by status'
    );

    // 23. Public view GET /internships/:id
    const getSingleRes = await makeRequest(`/api/v1/internships/${internshipId}`, 'GET');
    assert(
      getSingleRes.status === 200 &&
        getSingleRes.body.data.company.name === 'Alpha Systems Group',
      'GET /internships/:id returns details with populated company information (200)'
    );

    // --- TEST GROUP: Cross-tenant Ownership & Security ---

    // 24. Set up Company B profile
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

    // 25. Security: Company B attempts to edit Company A's internship
    const unauthorizedEditRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'PUT',
      { title: 'Hacked Title' },
      tokenB
    );
    assert(
      unauthorizedEditRes.status === 403,
      'Cross-tenant Guard: Company B receives 403 on updating Company A internship'
    );

    // 26. Company A updates its internship details and modifies required skills
    const validEditRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'PUT',
      {
        title: 'Senior Full Stack Intern',
        openPositions: 3,
        requiredSkills: ['React', 'TypeScript', 'Docker', 'GraphQL'],
      },
      tokenA
    );
    assert(
      validEditRes.status === 200 &&
        validEditRes.body.data.title === 'Senior Full Stack Intern' &&
        validEditRes.body.data.openPositions === 3 &&
        validEditRes.body.data.requiredSkills.includes('typescript') &&
        validEditRes.body.data.requiredSkills.includes('graphql'),
      'PUT /internships/:id updates details and required skills array (200)'
    );

    // Verify skills persistence via subsequent GET
    const verifySkillsRes = await makeRequest(`/api/v1/internships/${internshipId}`, 'GET');
    assert(
      verifySkillsRes.status === 200 &&
        verifySkillsRes.body.data.requiredSkills.length === 4 &&
        verifySkillsRes.body.data.requiredSkills.includes('docker'),
      'Updated skills persist correctly in database and reload cleanly (200)'
    );

    // 27. Security: Company B attempts to change status of Company A's internship
    const unauthorizedStatusRes = await makeRequest(
      `/api/v1/internships/${internshipId}/status`,
      'PATCH',
      { status: 'closed' },
      tokenB
    );
    assert(
      unauthorizedStatusRes.status === 403,
      'Cross-tenant Guard: Company B receives 403 on status change'
    );

    // 28. Status lifecycle: Transition draft -> published
    const publishDraftRes = await makeRequest(
      `/api/v1/internships/${draftInternshipId}/status`,
      'PATCH',
      { status: 'published' },
      tokenA
    );
    assert(
      publishDraftRes.status === 200 && publishDraftRes.body.data.status === 'published',
      'PATCH /internships/:id/status transitions draft to published (200)'
    );

    // 29. Status lifecycle: Company A closes its internship
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

    // Verify closed status persists after reload
    const verifyClosedRes = await makeRequest(`/api/v1/internships/${internshipId}`, 'GET');
    assert(
      verifyClosedRes.status === 200 && verifyClosedRes.body.data.status === 'closed',
      'Closed status persists in database upon reload (200)'
    );

    // 30. Reopening: Transition closed -> published
    const reopenRes = await makeRequest(
      `/api/v1/internships/${internshipId}/status`,
      'PATCH',
      { status: 'published' },
      tokenA
    );
    assert(
      reopenRes.status === 200 && reopenRes.body.data.status === 'published',
      'PATCH /internships/:id/status reopens closed internship to published (200)'
    );

    // 31. Close again to verify search exclusion
    await makeRequest(`/api/v1/internships/${internshipId}/status`, 'PATCH', { status: 'closed' }, tokenA);

    // 32. Cross-module verification: Closed internship is excluded from search results
    const searchRes = await makeRequest(
      `/api/v1/search/internships?keyword=Senior+Full+Stack`,
      'GET'
    );
    const searchItems = searchRes.body?.data?.items || [];
    const foundClosed = searchItems.some((item) => String(item._id || item.id) === String(internshipId));
    assert(
      searchRes.status === 200 && !foundClosed,
      'Closed internship is excluded from student-facing search results'
    );

    // 33. Published draft is included in search results
    const searchPublishedRes = await makeRequest(
      `/api/v1/search/internships?keyword=DevOps`,
      'GET'
    );
    const publishedItems = searchPublishedRes.body?.data?.items || [];
    const foundPublished = publishedItems.some(
      (item) => String(item._id || item.id) === String(draftInternshipId)
    );
    assert(
      searchPublishedRes.status === 200 && foundPublished,
      'Published internship is discoverable in student-facing search results'
    );

    // --- TEST GROUP: Deletion & Teardown ---

    // 34. Security: Company B attempts to delete Company A's internship
    const unauthorizedDeleteRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'DELETE',
      null,
      tokenB
    );
    assert(
      unauthorizedDeleteRes.status === 403,
      'Cross-tenant Guard: Company B receives 403 on delete'
    );

    // 35. Company A deletes its internship
    const validDeleteRes = await makeRequest(
      `/api/v1/internships/${internshipId}`,
      'DELETE',
      null,
      tokenA
    );
    assert(validDeleteRes.status === 200, 'DELETE /internships/:id deletes listing by owner (200)');

    // 36. Verify deleted internship is removed from database
    const getDeletedRes = await makeRequest(`/api/v1/internships/${internshipId}`, 'GET');
    assert(getDeletedRes.status === 404, 'GET /internships/:id returns 404 after deletion');

    // 37. Verify other listings are unaffected by single deletion
    const getRemainingRes = await makeRequest(`/api/v1/internships/${draftInternshipId}`, 'GET');
    assert(
      getRemainingRes.status === 200 &&
        getRemainingRes.body.data.title === 'DevOps Engineer Intern',
      'Deleting one internship does not affect other company listings'
    );

    // 38. Delete draft internship
    await makeRequest(`/api/v1/internships/${draftInternshipId}`, 'DELETE', null, tokenA);

    // 39. Unauthenticated write requests are rejected (401)
    const unauthPost = await makeRequest('/api/v1/internships', 'POST', { title: 'Test' });
    const unauthPut = await makeRequest(`/api/v1/internships/${internshipId}`, 'PUT', { title: 'Test' });
    const unauthPatch = await makeRequest(`/api/v1/internships/${internshipId}/status`, 'PATCH', { status: 'closed' });
    const unauthDel = await makeRequest(`/api/v1/internships/${internshipId}`, 'DELETE');
    assert(
      unauthPost.status === 401 &&
        unauthPut.status === 401 &&
        unauthPatch.status === 401 &&
        unauthDel.status === 401,
      'Auth Guard: Unauthenticated write endpoints strictly return 401'
    );

    // 40. Invalid ID format requests return 400
    const invalidIdGet = await makeRequest('/api/v1/internships/invalid-object-id', 'GET');
    const invalidIdPut = await makeRequest('/api/v1/internships/invalid-object-id', 'PUT', {}, tokenA);
    const invalidIdPatch = await makeRequest('/api/v1/internships/invalid-object-id/status', 'PATCH', { status: 'closed' }, tokenA);
    const invalidIdDelete = await makeRequest('/api/v1/internships/invalid-object-id', 'DELETE', null, tokenA);
    assert(
      invalidIdGet.status === 400 &&
        invalidIdPut.status === 400 &&
        invalidIdPatch.status === 400 &&
        invalidIdDelete.status === 400,
      'Format Guard: Invalid ObjectId format requests return 400 Bad Request'
    );

    // Clean up test users & company profiles created during test run
    await User.deleteMany({ email: { $in: [companyAEmail, companyBEmail, studentEmail] } });
    await Company.deleteMany({ _id: { $in: [companyAId] } });
    await Internship.deleteMany({ title: { $in: ['Full Stack Developer Intern', 'DevOps Engineer Intern', 'Senior Full Stack Intern'] } });
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
