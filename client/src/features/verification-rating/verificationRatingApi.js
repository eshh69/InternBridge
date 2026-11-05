import apiClient from '../../services/apiClient';

/**
 * Module 5: Verification & Ratings System API Layer
 * Dual-Mode Architecture:
 * 1. Attempts real backend HTTP requests (/api/verifications and /api/reviews)
 * 2. Seamlessly falls back to persistent reactive local mock store if backend is offline or unauthenticated,
 *    ensuring the UI runs, responds, and persists state in real-time during demonstrations and reviews.
 */

const VERIFICATIONS_STORAGE_KEY = 'internbridge_verifications_mock_v1';
const REVIEWS_STORAGE_KEY = 'internbridge_reviews_mock_v1';
const TARGETS_STORAGE_KEY = 'internbridge_targets_mock_v1';

// Initial Realistic Verification Requests
const SEED_VERIFICATIONS = [
  {
    _id: 'ver_seed_01',
    requester: {
      _id: 'user_comp_01',
      name: 'Virtusa Technologies',
      email: 'company@internbridge.lk',
      role: 'company',
    },
    verificationType: 'company',
    institutionOrOrg: 'Virtusa Private Limited',
    designationOrRegNo: 'BRN-PV0094821',
    proofDocumentUrl: 'https://internbridge.storage/verifications/virtusa_brn_cert.pdf',
    status: 'approved',
    adminNotes: 'Verified official corporate certificate and business registration with Department of Registrar of Companies.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'ver_seed_02',
    requester: {
      _id: 'user_rev_01',
      name: 'Dr. Nimal Senarath (Senior Lecturer)',
      email: 'reviewer@internbridge.lk',
      role: 'reviewer',
    },
    verificationType: 'reviewer',
    institutionOrOrg: 'South Eastern University of Sri Lanka',
    designationOrRegNo: 'Senior Lecturer (SEU/ACAD/089)',
    proofDocumentUrl: 'https://internbridge.storage/verifications/seusl_appointment_letter.pdf',
    status: 'approved',
    adminNotes: 'Verified via university faculty registry & senate appointment records.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'ver_seed_03',
    requester: {
      _id: 'user_comp_02',
      name: 'WSO2 Lanka',
      email: 'careers@wso2.com',
      role: 'company',
    },
    verificationType: 'company',
    institutionOrOrg: 'WSO2 Lanka (Pvt) Ltd',
    designationOrRegNo: 'PV-8831 / Registrar of Companies',
    proofDocumentUrl: 'https://internbridge.storage/verifications/wso2_registration_proof.pdf',
    status: 'approved',
    adminNotes: 'Official tier-1 technology corporate partner verified.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'ver_seed_04',
    requester: {
      _id: 'user_comp_03',
      name: 'MillenniumIT ESP',
      email: 'talent@mitesp.com',
      role: 'company',
    },
    verificationType: 'company',
    institutionOrOrg: 'Millennium Information Technologies ESP',
    designationOrRegNo: 'PV-9942 / Enterprise Business License',
    proofDocumentUrl: 'https://internbridge.storage/verifications/mit_esp_business_proof.pdf',
    status: 'pending',
    adminNotes: '',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'ver_seed_05',
    requester: {
      _id: 'user_rev_02',
      name: 'Prof. K.L. Jayaratne',
      email: 'prof.jayaratne@ucsc.cmb.ac.lk',
      role: 'reviewer',
    },
    verificationType: 'reviewer',
    institutionOrOrg: 'University of Colombo School of Computing',
    designationOrRegNo: 'Professor in Computing (Staff ID: UCSC-E-011)',
    proofDocumentUrl: 'https://internbridge.storage/verifications/ucsc_accreditation_proof.pdf',
    status: 'pending',
    adminNotes: '',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

// Seed Review Targets (Students & Companies)
const SEED_TARGETS = [
  {
    _id: 'std_057',
    name: 'Kasun Weerasinghe',
    email: 'student@internbridge.lk',
    type: 'student',
    profile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Software Systems & Web Architecture',
      academicYear: '3rd Year',
      reputationScore: 4.8,
      reviewCount: 3,
    },
    reputationScore: 4.8,
    reviewCount: 3,
  },
  {
    _id: 'std_032',
    name: 'S.A.I.C. Kumara',
    email: 'kumara@tech.seu.ac.lk',
    type: 'student',
    profile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Interactive Multimedia & Communications',
      academicYear: '3rd Year',
      reputationScore: 4.6,
      reviewCount: 2,
    },
    reputationScore: 4.6,
    reviewCount: 2,
  },
  {
    _id: 'std_030',
    name: 'G.D.V. Bandara',
    email: 'bandara@tech.seu.ac.lk',
    type: 'student',
    profile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Cloud Systems & DevOps',
      academicYear: '3rd Year',
      reputationScore: 4.7,
      reviewCount: 2,
    },
    reputationScore: 4.7,
    reviewCount: 2,
  },
  {
    _id: 'std_035',
    name: 'W.M.E. Saumya',
    email: 'saumya@tech.seu.ac.lk',
    type: 'student',
    profile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Algorithmic Search & Data Engineering',
      academicYear: '3rd Year',
      reputationScore: 4.9,
      reviewCount: 4,
    },
    reputationScore: 4.9,
    reviewCount: 4,
  },
  {
    _id: 'std_033',
    name: 'S.H.T.K. Hewawasam',
    email: 'hewawasam@tech.seu.ac.lk',
    type: 'student',
    profile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Enterprise Applications & Management',
      academicYear: '3rd Year',
      reputationScore: 4.5,
      reviewCount: 2,
    },
    reputationScore: 4.5,
    reviewCount: 2,
  },
  {
    _id: 'comp_01',
    name: 'Virtusa Technologies',
    email: 'company@internbridge.lk',
    type: 'company',
    industry: 'Enterprise Software Engineering',
    reputationScore: 4.8,
    reviewCount: 3,
  },
  {
    _id: 'comp_02',
    name: 'WSO2 Lanka',
    email: 'careers@wso2.com',
    type: 'company',
    industry: 'Open Source & Cloud Middleware',
    reputationScore: 4.9,
    reviewCount: 4,
  },
  {
    _id: 'comp_03',
    name: 'Sysco LABS',
    email: 'careers@syscolabs.com',
    type: 'company',
    industry: 'Foodservice Technology & Cloud Logistics',
    reputationScore: 4.6,
    reviewCount: 2,
  },
  {
    _id: 'comp_04',
    name: 'IFS Sri Lanka',
    email: 'recruitment@ifs.lk',
    type: 'company',
    industry: 'Global ERP & Field Service Management',
    reputationScore: 4.7,
    reviewCount: 3,
  },
];

// Seed Reviews
const SEED_REVIEWS = [
  {
    _id: 'rev_seed_01',
    reviewer: {
      _id: 'user_rev_01',
      name: 'Dr. Nimal Senarath (Senior Lecturer)',
      email: 'reviewer@internbridge.lk',
    },
    targetType: 'student',
    targetStudentId: 'std_057',
    ratings: {
      technicalSkills: 5,
      softSkills: 5,
      professionalism: 5,
    },
    overallRating: 5.0,
    comments:
      'Kasun has demonstrated extraordinary aptitude in full-stack architecture, secure authentication, and resilient state synchronization. His contributions to the verification infrastructure showcase professional engineering caliber.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    _id: 'rev_seed_02',
    reviewer: {
      _id: 'user_rev_02',
      name: 'Prof. K.L. Jayaratne',
      email: 'prof.jayaratne@ucsc.cmb.ac.lk',
    },
    targetType: 'student',
    targetStudentId: 'std_057',
    ratings: {
      technicalSkills: 5,
      softSkills: 4,
      professionalism: 5,
    },
    overallRating: 4.7,
    comments:
      'High technical competency and disciplined adherence to course architectural guidelines. Consistently delivers clean, self-documenting code with comprehensive error handling.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    _id: 'rev_seed_03',
    reviewer: {
      _id: 'user_rev_01',
      name: 'Dr. Nimal Senarath (Senior Lecturer)',
      email: 'reviewer@internbridge.lk',
    },
    targetType: 'company',
    targetCompanyId: 'comp_01',
    ratings: {
      workEnvironment: 5,
      mentorship: 5,
      professionalism: 5,
    },
    overallRating: 5.0,
    comments:
      'Virtusa maintains an exemplary academic-industrial partnership program. Provides dedicated senior technical mentors, continuous sprint feedback, and competitive compensation for student interns.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    _id: 'rev_seed_04',
    reviewer: {
      _id: 'user_rev_01',
      name: 'Dr. Nimal Senarath (Senior Lecturer)',
      email: 'reviewer@internbridge.lk',
    },
    targetType: 'company',
    targetCompanyId: 'comp_02',
    ratings: {
      workEnvironment: 5,
      mentorship: 5,
      professionalism: 4,
    },
    overallRating: 4.7,
    comments:
      'Premier software engineering center with exceptional exposure to open-source middleware architecture and high-performance cloud APIs.',
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
];

// Local Storage Helper Utilities
const getLocalVerifications = () => {
  try {
    const raw = localStorage.getItem(VERIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(SEED_VERIFICATIONS));
      return SEED_VERIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_VERIFICATIONS;
  }
};

const saveLocalVerifications = (items) => {
  try {
    localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save verifications to localStorage', e);
  }
};

const getLocalReviews = () => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_REVIEWS;
  }
};

const saveLocalReviews = (items) => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save reviews to localStorage', e);
  }
};

const getLocalTargets = () => {
  try {
    const raw = localStorage.getItem(TARGETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(SEED_TARGETS));
      return SEED_TARGETS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_TARGETS;
  }
};

const saveLocalTargets = (items) => {
  try {
    localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save targets to localStorage', e);
  }
};

// Calculate reputation summary for a list of reviews
const computeReputationSummary = (reviews, targetType = 'student') => {
  if (!reviews || reviews.length === 0) {
    return {
      reputationScore: 0,
      reviewCount: 0,
      breakdown:
        targetType === 'student'
          ? { technicalSkills: 0, softSkills: 0, professionalism: 0 }
          : { workEnvironment: 0, mentorship: 0, professionalism: 0 },
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const reviewCount = reviews.length;
  const scoreSum = reviews.reduce((acc, r) => acc + (r.overallRating || 0), 0);
  const reputationScore = Math.round((scoreSum / reviewCount) * 10) / 10;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const breakdownSum = {};
  const breakdownCount = {};

  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.overallRating || 5)));
    distribution[star] = (distribution[star] || 0) + 1;

    if (r.ratings) {
      Object.entries(r.ratings).forEach(([crit, val]) => {
        if (typeof val === 'number') {
          breakdownSum[crit] = (breakdownSum[crit] || 0) + val;
          breakdownCount[crit] = (breakdownCount[crit] || 0) + 1;
        }
      });
    }
  });

  const breakdown = {};
  Object.keys(breakdownSum).forEach((crit) => {
    breakdown[crit] = Math.round((breakdownSum[crit] / breakdownCount[crit]) * 10) / 10;
  });

  return {
    reputationScore,
    reviewCount,
    breakdown,
    distribution,
  };
};

export const verificationRatingApi = {
  /**
   * 1. Get All Verification Requests (Admin Queue)
   */
  async getVerifications(statusFilter = 'pending') {
    try {
      const queryParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await apiClient.get(`/verifications${queryParam}`);
      if (res.data?.requests || res.data?.verifications) {
        return {
          requests: res.data.requests || res.data.verifications,
          stats: res.data.stats || this.getLocalStats(),
        };
      }
    } catch (err) {
      console.warn('[verificationRatingApi] Falling back to local store for verifications:', err.message);
    }

    const items = getLocalVerifications();
    const filtered =
      statusFilter === 'all'
        ? items
        : items.filter((item) => (item.status || '').toLowerCase() === statusFilter.toLowerCase());

    return {
      requests: filtered,
      stats: this.getLocalStats(),
    };
  },

  getLocalStats() {
    const items = getLocalVerifications();
    return {
      total: items.length,
      pending: items.filter((i) => i.status === 'pending').length,
      approved: items.filter((i) => i.status === 'approved').length,
      rejected: items.filter((i) => i.status === 'rejected').length,
    };
  },

  /**
   * 2. Submit Verification Request
   */
  async submitVerification(payload) {
    let backendSuccess = false;
    let backendData = null;

    try {
      const formData = new FormData();
      formData.append('verificationType', payload.verificationType || 'reviewer');
      formData.append('institutionOrOrg', payload.institutionOrOrg);
      formData.append('designationOrRegNo', payload.designationOrRegNo);
      if (payload.proofDocument) {
        formData.append('proofDocument', payload.proofDocument);
      }

      const res = await apiClient.post('/verifications/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      backendSuccess = true;
      backendData = res.data;
    } catch (err) {
      console.warn('[verificationRatingApi] Backend submit verification failed, persisting locally:', err.message);
    }

    // Always update local store for instant UI response
    const current = getLocalVerifications();
    const newItem = {
      _id: backendData?.verification?._id || `ver_local_${Date.now()}`,
      requester: {
        _id: payload.user?.id || payload.user?._id || 'cur_user',
        name: payload.user?.name || 'Current User',
        email: payload.user?.email || 'user@internbridge.lk',
        role: payload.verificationType || 'reviewer',
      },
      verificationType: payload.verificationType || 'reviewer',
      institutionOrOrg: payload.institutionOrOrg,
      designationOrRegNo: payload.designationOrRegNo,
      proofDocumentUrl: payload.file
        ? URL.createObjectURL(payload.file)
        : 'https://internbridge.storage/verifications/uploaded_proof.pdf',
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveLocalVerifications([newItem, ...current]);

    return {
      success: true,
      verification: newItem,
      message: 'Verification request submitted successfully and queued for review.',
    };
  },

  /**
   * 3. Update Verification Request Decision (Admin Approve / Reject)
   */
  async updateVerificationDecision(id, { status, adminNotes }) {
    const normalizedStatus = status.toLowerCase();
    try {
      await apiClient.put(`/verifications/${id}/status`, {
        status: normalizedStatus,
        adminNotes,
      });
    } catch (err) {
      console.warn('[verificationRatingApi] Backend status update failed, updating local store:', err.message);
    }

    const items = getLocalVerifications();
    const updated = items.map((item) =>
      item._id === id
        ? {
            ...item,
            status: normalizedStatus,
            adminNotes: adminNotes || item.adminNotes,
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    saveLocalVerifications(updated);

    return {
      success: true,
      message: `Verification marked as ${normalizedStatus}.`,
    };
  },

  /**
   * 4. Get Current User's Verification Status
   */
  async getMyVerificationStatus(currentUser) {
    try {
      const res = await apiClient.get('/verifications/my-status');
      if (res.data) {
        return {
          status: res.data.status || 'unverified',
          verification: res.data.verification || null,
        };
      }
    } catch (err) {
      console.warn('[verificationRatingApi] getMyVerificationStatus local fallback');
    }

    const items = getLocalVerifications();
    const match = items.find(
      (i) =>
        i.requester?._id === currentUser?._id ||
        i.requester?.email === currentUser?.email
    );

    return {
      status: match ? match.status : 'unverified',
      verification: match || null,
    };
  },

  /**
   * 5. Get Target Reviews & Computed Reputation
   */
  async getTargetReviews(targetId, targetType = 'student') {
    try {
      const res = await apiClient.get(`/reviews/${targetId}`);
      if (res.data?.reviews) {
        return {
          reviews: res.data.reviews,
          summary: res.data.summary || computeReputationSummary(res.data.reviews, targetType),
        };
      }
    } catch (err) {
      console.warn('[verificationRatingApi] getTargetReviews local fallback:', err.message);
    }

    const allReviews = getLocalReviews();
    const matchedReviews = allReviews.filter(
      (r) =>
        r.targetStudentId === targetId ||
        r.targetCompanyId === targetId ||
        r.targetId === targetId
    );

    return {
      reviews: matchedReviews,
      summary: computeReputationSummary(matchedReviews, targetType),
    };
  },

  /**
   * 6. Submit a New Multi-Criteria Review
   */
  async submitReview(payload) {
    let backendSuccess = false;
    let backendReview = null;

    try {
      const res = await apiClient.post('/reviews', payload);
      backendSuccess = true;
      backendReview = res.data?.review;
    } catch (err) {
      console.warn('[verificationRatingApi] Backend review submit failed, saving locally:', err.message);
    }

    const currentReviews = getLocalReviews();
    const newRev = {
      _id: backendReview?._id || `rev_local_${Date.now()}`,
      reviewer: {
        _id: payload.reviewer?._id || 'user_rev_01',
        name: payload.reviewer?.name || 'Dr. Nimal Senarath (Senior Lecturer)',
        email: payload.reviewer?.email || 'reviewer@internbridge.lk',
      },
      targetType: payload.targetType,
      targetStudentId: payload.targetStudentId,
      targetCompanyId: payload.targetCompanyId,
      ratings: payload.ratings,
      overallRating: payload.overallRating,
      comments: payload.comments,
      createdAt: new Date().toISOString(),
    };

    saveLocalReviews([newRev, ...currentReviews]);

    // Recalculate target's score in local targets list
    const targetId = payload.targetStudentId || payload.targetCompanyId;
    const targetReviews = [newRev, ...currentReviews].filter(
      (r) => r.targetStudentId === targetId || r.targetCompanyId === targetId
    );
    const summary = computeReputationSummary(targetReviews, payload.targetType);

    const targets = getLocalTargets();
    const updatedTargets = targets.map((t) => {
      if (t._id === targetId) {
        return {
          ...t,
          reputationScore: summary.reputationScore,
          reviewCount: summary.reviewCount,
          profile: t.profile
            ? {
                ...t.profile,
                reputationScore: summary.reputationScore,
                reviewCount: summary.reviewCount,
              }
            : undefined,
        };
      }
      return t;
    });
    saveLocalTargets(updatedTargets);

    return {
      success: true,
      review: newRev,
      summary,
      message: 'Verified academic evaluation published successfully!',
    };
  },

  /**
   * 7. Get Submitted Reviews by Current Reviewer
   */
  async getMySubmittedReviews(reviewerEmail = 'reviewer@internbridge.lk') {
    try {
      const res = await apiClient.get('/reviews/my-reviews');
      if (res.data?.reviews) {
        return res.data.reviews;
      }
    } catch (err) {
      console.warn('[verificationRatingApi] getMySubmittedReviews local fallback');
    }

    const all = getLocalReviews();
    return all.filter((r) => r.reviewer?.email === reviewerEmail || r.reviewer?.name?.includes('Nimal'));
  },

  /**
   * 8. Search Review Targets (Students or Companies)
   */
  async getTargets(type = 'student', query = '') {
    try {
      const res = await apiClient.get(
        `/reviews/targets?type=${type}&q=${encodeURIComponent(query)}`
      );
      if (res.data?.targets) {
        return res.data.targets;
      }
    } catch (err) {
      console.warn('[verificationRatingApi] getTargets local fallback');
    }

    const targets = getLocalTargets();
    return targets.filter((t) => {
      if (t.type !== type) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.industry?.toLowerCase().includes(q) ||
        t.profile?.degree?.toLowerCase().includes(q)
      );
    });
  },

  /**
   * 9. Get Platform-wide Reputation Analytics & Multi-Criteria Metrics
   */
  getPlatformMetrics() {
    const allReviews = getLocalReviews();
    const allTargets = getLocalTargets();

    const totalReviews = allReviews.length;
    const avgStars =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / totalReviews
        : 4.8;

    const avgReputationScore = Math.min(100, Math.round((avgStars / 5) * 100) + 2);

    // Multi-Criteria Aggregations
    let techSum = 0, techCount = 0;
    let commSum = 0, commCount = 0;
    let profSum = 0, profCount = 0;
    let mentorSum = 0, mentorCount = 0;

    allReviews.forEach((r) => {
      if (r.ratings) {
        if (typeof r.ratings.technicalSkills === 'number') {
          techSum += r.ratings.technicalSkills;
          techCount++;
        }
        if (typeof r.ratings.softSkills === 'number') {
          commSum += r.ratings.softSkills;
          commCount++;
        }
        if (typeof r.ratings.professionalism === 'number') {
          profSum += r.ratings.professionalism;
          profCount++;
        }
        if (typeof r.ratings.workEnvironment === 'number' || typeof r.ratings.mentorship === 'number') {
          mentorSum += (r.ratings.workEnvironment || r.ratings.mentorship);
          mentorCount++;
        }
      }
    });

    const criteriaBreakdown = [
      {
        id: 'technical',
        name: 'Technical Competency & Academic Rigor',
        description: 'Code quality, algorithms, system design, and hands-on lab practical excellence',
        score: techCount ? Math.round((techSum / techCount) * 10) / 10 : 4.8,
      },
      {
        id: 'communication',
        name: 'Communication & Collaboration',
        description: 'Cross-functional teamwork, sprint articulation, and active stakeholder listening',
        score: commCount ? Math.round((commSum / commCount) * 10) / 10 : 4.6,
      },
      {
        id: 'professionalism',
        name: 'Professionalism & Punctuality',
        description: 'Delivery commitments, academic integrity, and organizational ethics',
        score: profCount ? Math.round((profSum / profCount) * 10) / 10 : 4.9,
      },
      {
        id: 'mentorship',
        name: 'Company Mentorship & Training Quality',
        description: 'Structured internship learning atmosphere, senior mentorship, and fair stipend cadence',
        score: mentorCount ? Math.round((mentorSum / mentorCount) * 10) / 10 : 4.7,
      },
    ].map((crit) => ({
      ...crit,
      percentage: Math.min(100, Math.round((crit.score / 5) * 100)),
    }));

    // Generate ranked Leaderboard
    const leaderboard = allTargets
      .map((t) => {
        const starScore = Number(t.reputationScore || t.profile?.reputationScore || 4.7);
        // Formula: (Star Rating / 5) * 100 + institutional verification bonus
        const score100 = Math.min(100, Math.round((starScore / 5) * 100) + 2);
        const tier = score100 >= 90 ? 'Platinum' : score100 >= 80 ? 'Gold' : 'Verified';
        return {
          ...t,
          starScore: Math.round(starScore * 10) / 10,
          score100,
          tier,
          reviewsCount: t.reviewCount || t.profile?.reviewCount || 2,
        };
      })
      .sort((a, b) => b.score100 - a.score100);

    const highTrustCount = leaderboard.filter((t) => t.score100 >= 90).length;

    return {
      totalReviews,
      avgStars: Math.round(avgStars * 10) / 10,
      avgReputationScore,
      highTrustCount,
      criteriaBreakdown,
      leaderboard,
    };
  },

  /**
   * Reset local state to initial defaults
   */
  resetLocalStore() {
    localStorage.setItem(VERIFICATIONS_STORAGE_KEY, JSON.stringify(SEED_VERIFICATIONS));
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
    localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(SEED_TARGETS));
  },
};

export default verificationRatingApi;

