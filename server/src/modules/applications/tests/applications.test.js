/**
 * Test Suite: Module 4 — Application & Recruitment Management
 * Member: G.D.V. Bandara (SEU/IS/22/ICT/030)
 *
 * Verifies end-to-end API lifecycle, RBAC enforcement, duplicate application
 * constraint, company ownership checks, and status state transitions.
 */

import http from 'http';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { User } from '../../../models/User.js';
import { Company } from '../../../models/Company.js';
import { Internship } from '../../../models/Internship.js';
import { Application } from '../../../models/Application.js';
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
  console.log('--- Starting Module 4 Application & Recruitment Tests ---');
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

  const createdUserEmails = [];
  const createdCompanyIds = [];
  const createdInternshipIds = [];
  const createdAppIds = [];

  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Start HTTP server
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
    const studentEmail1 = `bandara.test.${timestamp}@tech.seu.ac.lk`;
    const studentEmail2 = `peer.test.${timestamp}@tech.seu.ac.lk`;
    const companyAEmail = `ifs.test.${timestamp}@ifs.com`;
    const companyBEmail = `sysco.test.${timestamp}@syscolabs.com`;

    createdUserEmails.push(studentEmail1, studentEmail2, companyAEmail, companyBEmail);

    // Register Student 1
    const regStudent1 = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'G.D.V. Bandara',
      email: studentEmail1,
      password: 'StrongPassword123!',
      role: 'student',
    });
    assert(regStudent1.status === 201 && regStudent1.body.data.token, 'Register Student 1');
    const tokenStudent1 = regStudent1.body.data.token;
    const student1Id = regStudent1.body.data.user.id || regStudent1.body.data.user._id;

    // Register Student 2
    const regStudent2 = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'Second Student Applicant',
      email: studentEmail2,
      password: 'StrongPassword123!',
      role: 'student',
    });
    assert(regStudent2.status === 201 && regStudent2.body.data.token, 'Register Student 2');
    const tokenStudent2 = regStudent2.body.data.token;

    // Register Company User A
    const regCompanyA = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'IFS Recruiter',
      email: companyAEmail,
      password: 'StrongPassword123!',
      role: 'company',
    });
    assert(regCompanyA.status === 201 && regCompanyA.body.data.token, 'Register Company User A');
    const tokenCompanyA = regCompanyA.body.data.token;
    const companyAUserId = regCompanyA.body.data.user.id || regCompanyA.body.data.user._id;

    // Register Company User B
    const regCompanyB = await makeRequest('/api/v1/auth/register', 'POST', {
      name: 'Sysco Recruiter',
      email: companyBEmail,
      password: 'StrongPassword123!',
      role: 'company',
    });
    assert(regCompanyB.status === 201 && regCompanyB.body.data.token, 'Register Company User B');
    const tokenCompanyB = regCompanyB.body.data.token;
    const companyBUserId = regCompanyB.body.data.user.id || regCompanyB.body.data.user._id;

    // Create Company A profile
    const compProfileA = await Company.create({
      user: companyAUserId,
      name: 'IFS Sri Lanka (Test)',
      description: 'Enterprise ERP software provider',
      industry: 'Software Development',
      location: { address: 'Orion City', city: 'Colombo 09', country: 'Sri Lanka' },
      contactEmail: companyAEmail,
      verificationStatus: 'verified',
    });
    createdCompanyIds.push(compProfileA._id);

    // Create Company B profile
    const compProfileB = await Company.create({
      user: companyBUserId,
      name: 'Sysco LABS (Test)',
      description: 'Enterprise foodservice cloud engineering',
      industry: 'Cloud Infrastructure',
      location: { address: 'Cinnamon Gardens', city: 'Colombo 07', country: 'Sri Lanka' },
      contactEmail: companyBEmail,
      verificationStatus: 'verified',
    });
    createdCompanyIds.push(compProfileB._id);

    // Create Published Internship for Company A
    const publishedInternship = await Internship.create({
      company: compProfileA._id,
      title: 'Full Stack Developer Intern (Module 4 Test)',
      description: 'Join enterprise engineering team building scalable REST APIs.',
      area: 'Software Engineering',
      requiredSkills: ['react', 'node.js', 'mongodb'],
      qualifications: ['Undergraduate in ICT'],
      locationType: 'Hybrid',
      location: 'Colombo',
      durationMonths: 6,
      openPositions: 2,
      deadline: new Date(Date.now() + 30 * 86400000),
      status: 'published',
    });
    createdInternshipIds.push(publishedInternship._id);

    // Create Closed Internship for Company A
    const closedInternship = await Internship.create({
      company: compProfileA._id,
      title: 'Closed Software Intern Position',
      description: 'Old closed position',
      area: 'Software Engineering',
      requiredSkills: ['java'],
      qualifications: ['Undergraduate in ICT'],
      locationType: 'On-site',
      location: 'Colombo',
      durationMonths: 3,
      deadline: new Date(Date.now() - 10 * 86400000),
      status: 'closed',
    });
    createdInternshipIds.push(closedInternship._id);

    // --- TEST 1: Validation failure on missing fields ---
    const invalidAppRes1 = await makeRequest('/api/v1/applications', 'POST', {}, tokenStudent1);
    assert(invalidAppRes1.status === 400, 'POST /applications returns 400 if required fields are missing');

    const invalidAppRes2 = await makeRequest(
      '/api/v1/applications',
      'POST',
      { internshipId: publishedInternship._id },
      tokenStudent1
    );
    assert(invalidAppRes2.status === 400, 'POST /applications returns 400 if resumeUrl is missing');

    // --- TEST 2: Cannot apply to non-existent internship ---
    const nonExistentId = new mongoose.Types.ObjectId();
    const notFoundRes = await makeRequest(
      '/api/v1/applications',
      'POST',
      { internshipId: nonExistentId, resumeUrl: 'https://test.storage/cv.pdf' },
      tokenStudent1
    );
    assert(notFoundRes.status === 404, 'POST /applications returns 404 for non-existent internship');

    // --- TEST 3: Cannot apply to closed listing ---
    const closedApplyRes = await makeRequest(
      '/api/v1/applications',
      'POST',
      { internshipId: closedInternship._id, resumeUrl: 'https://test.storage/cv.pdf' },
      tokenStudent1
    );
    assert(closedApplyRes.status === 400, 'POST /applications returns 400 when applying to non-published listing');

    // --- TEST 4: Student applies successfully to published listing ---
    const validAppRes = await makeRequest(
      '/api/v1/applications',
      'POST',
      {
        internshipId: publishedInternship._id,
        resumeUrl: 'https://internbridge.storage/resumes/bandara_cv.pdf',
        coverLetter: 'Passionate about React and Express backend architectures.',
      },
      tokenStudent1
    );
    assert(validAppRes.status === 201 && validAppRes.body.success, 'Student 1 successfully applies (201 Created)');
    const appId1 = validAppRes.body.data?._id || validAppRes.body.data?.id;
    if (appId1) createdAppIds.push(appId1);

    // --- TEST 5: Constraint Enforcement: Student CANNOT apply twice to the same internship ---
    const duplicateAppRes = await makeRequest(
      '/api/v1/applications',
      'POST',
      {
        internshipId: publishedInternship._id,
        resumeUrl: 'https://internbridge.storage/resumes/bandara_cv_v2.pdf',
        coverLetter: 'Trying to apply a second time.',
      },
      tokenStudent1
    );
    assert(
      duplicateAppRes.status === 400 && duplicateAppRes.body.message.includes('already applied'),
      'Constraint Guard: Student cannot apply twice to the same internship (400 Bad Request)'
    );

    // --- TEST 6: Student views own submitted applications ---
    const myAppsRes = await makeRequest('/api/v1/applications/my', 'GET', null, tokenStudent1);
    assert(
      myAppsRes.status === 200 && Array.isArray(myAppsRes.body.data) && myAppsRes.body.data.length >= 1,
      'Student can view own submitted applications via GET /applications/my'
    );

    // --- TEST 7: RBAC: Company cannot call GET /applications/my ---
    const rbacMyAppsRes = await makeRequest('/api/v1/applications/my', 'GET', null, tokenCompanyA);
    assert(rbacMyAppsRes.status === 403, 'RBAC Guard: Company receives 403 on GET /applications/my');

    // --- TEST 8: Company A views applicants for its internship ---
    const compApplicantsRes = await makeRequest(
      `/api/v1/applications/internship/${publishedInternship._id}`,
      'GET',
      null,
      tokenCompanyA
    );
    assert(
      compApplicantsRes.status === 200 &&
        Array.isArray(compApplicantsRes.body.data) &&
        compApplicantsRes.body.data.length === 1,
      'Company A successfully views applicants for its internship'
    );

    // --- TEST 9: Ownership Guard: Company B CANNOT view Company A applicants ---
    const compBOwnershipRes = await makeRequest(
      `/api/v1/applications/internship/${publishedInternship._id}`,
      'GET',
      null,
      tokenCompanyB
    );
    assert(
      compBOwnershipRes.status === 403,
      'Ownership Guard: Company B receives 403 when trying to view Company A applicants'
    );

    // --- TEST 10: Company A updates applicant recruitment status ---
    const statusUpdateRes1 = await makeRequest(
      `/api/v1/applications/${appId1}/status`,
      'PATCH',
      {
        status: 'under_review',
        notes: 'CV reviewed by hiring manager. Strong skill match.',
      },
      tokenCompanyA
    );
    assert(
      statusUpdateRes1.status === 200 && statusUpdateRes1.body.data.status === 'under_review',
      'Company updates application status to "under_review"'
    );

    const statusUpdateRes2 = await makeRequest(
      `/api/v1/applications/${appId1}/status`,
      'PATCH',
      {
        status: 'shortlisted',
        notes: 'Shortlisted for Round 1 technical interview on Tuesday 2 PM.',
      },
      tokenCompanyA
    );
    assert(
      statusUpdateRes2.status === 200 && statusUpdateRes2.body.data.status === 'shortlisted',
      'Company updates application status to "shortlisted"'
    );

    // --- TEST 11: Validation: Invalid status is rejected ---
    const invalidStatusRes = await makeRequest(
      `/api/v1/applications/${appId1}/status`,
      'PATCH',
      { status: 'invalid_stage' },
      tokenCompanyA
    );
    assert(invalidStatusRes.status === 400, 'Company cannot set invalid status (400 Bad Request)');

    // --- TEST 12: RBAC: Student cannot update recruitment status ---
    const studentStatusHack = await makeRequest(
      `/api/v1/applications/${appId1}/status`,
      'PATCH',
      { status: 'hired' },
      tokenStudent1
    );
    assert(studentStatusHack.status === 403, 'RBAC Guard: Student cannot alter recruitment status (403)');

    // --- TEST 13: Student withdrawal rule: Cannot withdraw once beyond "applied" stage ---
    const withdrawAttempt = await makeRequest(`/api/v1/applications/${appId1}`, 'DELETE', null, tokenStudent1);
    assert(
      withdrawAttempt.status === 400,
      'Withdrawal Guard: Cannot withdraw application once moved to shortlisted/reviewed stage (400)'
    );

    // --- TEST 14: Another student applies and successfully withdraws while still in "applied" stage ---
    const student2AppRes = await makeRequest(
      '/api/v1/applications',
      'POST',
      {
        internshipId: publishedInternship._id,
        resumeUrl: 'https://internbridge.storage/resumes/student2_cv.pdf',
        coverLetter: 'Interested in this internship.',
      },
      tokenStudent2
    );
    assert(student2AppRes.status === 201, 'Student 2 applies to same internship (201 Created)');
    const appId2 = student2AppRes.body.data?._id || student2AppRes.body.data?.id;

    const validWithdrawRes = await makeRequest(`/api/v1/applications/${appId2}`, 'DELETE', null, tokenStudent2);
    assert(validWithdrawRes.status === 200, 'Student 2 can withdraw while still in "applied" stage (200 OK)');

    // --- TEST 15: Single application detail view ---
    const detailRes = await makeRequest(`/api/v1/applications/${appId1}`, 'GET', null, tokenStudent1);
    assert(
      detailRes.status === 200 && detailRes.body.data.status === 'shortlisted',
      'GET /applications/:id retrieves complete application details for applicant'
    );
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    // Teardown test documents
    try {
      if (createdAppIds.length > 0) {
        await Application.deleteMany({ _id: { $in: createdAppIds } });
      }
      if (createdInternshipIds.length > 0) {
        await Internship.deleteMany({ _id: { $in: createdInternshipIds } });
      }
      if (createdCompanyIds.length > 0) {
        await Company.deleteMany({ _id: { $in: createdCompanyIds } });
      }
      if (createdUserEmails.length > 0) {
        await User.deleteMany({ email: { $in: createdUserEmails } });
      }
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }

    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    console.log(`\n--- Test Results: ${passed} Passed, ${failed} Failed ---`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();

