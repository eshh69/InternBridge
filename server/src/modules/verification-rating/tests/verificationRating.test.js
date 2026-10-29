/**
 * Test Suite: Module 5 — Verification & Ratings System
 * Member: K.S. Weerasinghe (SEU/IS/22/ICT/057)
 *
 * Verifies end-to-end API lifecycle:
 * - Verification request submission (Company & Reviewer)
 * - Admin verification queue and decision moderation (Approve / Reject)
 * - Multi-criteria review & star rating submission
 * - Dynamic reputation score aggregation & synchronization
 * - Public target review retrieval
 */

import http from 'http';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { User } from '../../../models/User.js';
import { Verification } from '../../../models/Verification.js';
import { Review } from '../../../models/Review.js';
import { StudentProfile } from '../../../models/StudentProfile.js';
import { Company } from '../../../models/Company.js';
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
  console.log('===============================================================');
  console.log('  TEST SUITE: Module 5 — Verification & Ratings System');
  console.log('  Developer: K.S. Weerasinghe (SEU/IS/22/ICT/057)');
  console.log('===============================================================\n');

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
    await connectDB();

    // Start ephemeral HTTP server on random port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api/v1`;

    // 1. Authenticate dev users
    console.log('[Setup] Authenticating test personas...');
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      email: 'admin@internbridge.lk',
      password: 'password123',
    });
    const adminToken = adminLogin.body?.data?.token;

    const reviewerLogin = await makeRequest('/auth/login', 'POST', {
      email: 'reviewer@internbridge.lk',
      password: 'password123',
    });
    const reviewerToken = reviewerLogin.body?.data?.token;

    const studentLogin = await makeRequest('/auth/login', 'POST', {
      email: 'student@internbridge.lk',
      password: 'password123',
    });
    const studentToken = studentLogin.body?.data?.token;
    const studentId = studentLogin.body?.data?.user?.id;

    assert(adminToken, 'Admin authentication successful');
    assert(reviewerToken, 'Reviewer authentication successful');
    assert(studentToken && studentId, 'Student persona identified');

    // 2. Submit Verification Request
    console.log('\n[Feature 1: Verification Submission]');
    // Clean up any existing pending verification for test reviewer
    await Verification.deleteMany({ requester: reviewerLogin.body?.data?.user?.id });

    const submitRes = await makeRequest(
      '/verifications/request',
      'POST',
      {
        verificationType: 'Reviewer',
        institutionOrOrg: 'South Eastern University of Sri Lanka',
        designationOrRegNo: 'Senior Lecturer (SEU/ACAD/089)',
        documentUrl: 'https://internbridge.storage/proofs/test_appointment.pdf',
        proofDocumentUrl: 'https://internbridge.storage/proofs/test_appointment.pdf',
      },
      reviewerToken
    );
    assert(submitRes.status === 201 || submitRes.status === 200, 'Reviewer successfully submitted verification request');

    // 3. Admin Verification Queue
    console.log('\n[Feature 2: Admin Queue & Moderation]');
    const queueRes = await makeRequest('/verifications/pending', 'GET', null, adminToken);
    const verificationsList = queueRes.body?.data?.verifications || queueRes.body?.data || queueRes.body?.verifications || [];
    assert(queueRes.status === 200 && Array.isArray(verificationsList), 'Admin fetched verification moderation queue');

    // RBAC check: Student cannot access admin queue
    const forbiddenQueue = await makeRequest('/verifications/pending', 'GET', null, studentToken);
    assert(forbiddenQueue.status === 403, 'RBAC Enforced: Non-admin student blocked from moderation queue (403)');

    // 4. Admin Decision (Approve / Reject)
    const verificationItem = verificationsList[0];
    if (verificationItem?._id) {
      const decisionRes = await makeRequest(
        `/verifications/${verificationItem._id}/decision`,
        'PATCH',
        {
          status: 'approved',
          adminNotes: 'Automated test suite approval: credentials verified.',
        },
        adminToken
      );
      assert(decisionRes.status === 200, 'Admin successfully approved verification request');
    }

    // 5. Submit Multi-Criteria Review
    console.log('\n[Feature 3: Multi-Criteria Star Rating & Review Submission]');
    const reviewPayload = {
      targetType: 'student',
      targetStudentId: studentId,
      ratings: {
        technicalSkills: 5,
        softSkills: 4,
        professionalism: 5,
      },
      overallRating: 4.7,
      comments: 'Exceptional full-stack competence, clean architecture, and thorough unit testing.',
    };

    const reviewRes = await makeRequest('/reviews', 'POST', reviewPayload, reviewerToken);
    assert(reviewRes.status === 201 || reviewRes.status === 200, 'Reviewer submitted multi-criteria review for student');

    // RBAC check: Student cannot submit reviewer evaluations
    const illegalReview = await makeRequest('/reviews', 'POST', reviewPayload, studentToken);
    assert(illegalReview.status === 403, 'RBAC Enforced: Student cannot submit faculty academic evaluations (403)');

    // 6. Reputation Metrics & Aggregations
    console.log('\n[Feature 4: Aggregate Reputation Calculation & Synchronous Audit]');
    const targetReviewsRes = await makeRequest(`/reviews/target/${studentId}`, 'GET');
    assert(targetReviewsRes.status === 200, 'Fetched verified evaluation records for target student');

    const summary = targetReviewsRes.body?.summary || targetReviewsRes.body?.data?.summary;
    const reviewsList = targetReviewsRes.body?.reviews || targetReviewsRes.body?.data?.reviews || [];
    assert(Array.isArray(reviewsList) && reviewsList.length > 0, 'Target student has recorded verified reviews in database');
    assert(summary && typeof summary.reputationScore === 'number', 'Dynamic aggregate reputation score computed');

    // 7. Reviewer Submitted Reviews
    console.log('\n[Feature 5: Reviewer Workspace & Audit Logs]');
    const mySubmittedRes = await makeRequest('/reviews/my-reviews', 'GET', null, reviewerToken);
    assert(mySubmittedRes.status === 200, 'Reviewer successfully retrieved their submitted evaluations');

    // Summary
    console.log('\n===============================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTests();
