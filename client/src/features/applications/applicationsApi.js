import apiClient from '../../services/apiClient';

/**
 * Module 4: Application & Recruitment API Services
 * Dual-Mode Architecture:
 * 1. Attempts real backend HTTP requests (/api/v1/applications)
 * 2. Seamlessly falls back to persistent reactive local mock store if backend is offline/unauthenticated
 *    so the UI can be run and demonstrated immediately without requiring MongoDB/backend running.
 */

const STORAGE_KEY = 'internbridge_applications_mock_v1';

// Initial realistic seed applications
const SEED_APPLICATIONS = [
  {
    _id: 'app_seed_01',
    student: {
      _id: 'std_030',
      name: 'G.D.V. Bandara',
      email: 'bandara@tech.seu.ac.lk',
    },
    studentProfile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Software Systems & Web Architecture',
      gpa: '3.82',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'REST APIs'],
    },
    internship: {
      _id: 'int_01',
      title: 'Full Stack Engineering Intern',
      area: 'Software Engineering',
      location: 'Colombo (Hybrid)',
      locationType: 'Hybrid',
      stipend: 'LKR 55,000 / month',
      deadline: '2026-11-30',
      description: 'Collaborate with senior architects to build enterprise ERP extensions with React and Node.js.',
      requiredSkills: ['react', 'node.js', 'mongodb', 'rest apis'],
      company: {
        _id: 'comp_01',
        name: 'IFS Sri Lanka',
      },
    },
    company: {
      _id: 'comp_01',
      name: 'IFS Sri Lanka',
      logoUrl: '',
      location: 'Colombo 03',
      contactEmail: 'recruitment@ifs.lk',
    },
    resumeUrl: 'https://internbridge.storage/resumes/bandara_fullstack_cv.pdf',
    coverLetter: 'I am passionate about building scalable microservices and reactive interfaces. I have practical experience building MERN applications.',
    matchScore: 94,
    status: 'shortlisted',
    notes: 'Shortlisted for Round 1 Technical Interview. Scheduled for next Tuesday at 2:00 PM via Google Meet.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'app_seed_02',
    student: {
      _id: 'std_030',
      name: 'G.D.V. Bandara',
      email: 'bandara@tech.seu.ac.lk',
    },
    studentProfile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Software Systems & Web Architecture',
      gpa: '3.82',
      skills: ['Docker', 'AWS', 'Linux', 'CI/CD Pipelines'],
    },
    internship: {
      _id: 'int_02',
      title: 'Cloud & DevOps Intern',
      area: 'Cloud Infrastructure',
      location: 'Colombo / Remote',
      locationType: 'Remote',
      stipend: 'LKR 50,000 / month',
      deadline: '2026-11-25',
      description: 'Automate build pipelines, maintain container clusters, and manage AWS cloud resources.',
      requiredSkills: ['docker', 'aws', 'ci/cd', 'linux'],
      company: {
        _id: 'comp_02',
        name: 'Sysco LABS',
      },
    },
    company: {
      _id: 'comp_02',
      name: 'Sysco LABS',
      logoUrl: '',
      location: 'Colombo 02',
      contactEmail: 'careers@syscolabs.com',
    },
    resumeUrl: 'https://internbridge.storage/resumes/bandara_devops_cv.pdf',
    coverLetter: 'Experienced with Docker containerization, CI/CD runners, and deployment configuration.',
    matchScore: 82,
    status: 'under_review',
    notes: 'Resume under review by Senior SRE team lead.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'app_seed_03',
    student: {
      _id: 'std_030',
      name: 'G.D.V. Bandara',
      email: 'bandara@tech.seu.ac.lk',
    },
    studentProfile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information & Communication Technology',
      fieldOfStudy: 'Software Systems',
      gpa: '3.82',
      skills: ['Cypress', 'JavaScript', 'Jest', 'API Testing'],
    },
    internship: {
      _id: 'int_03',
      title: 'Quality Assurance (QA) Automation Intern',
      area: 'Quality Engineering',
      location: 'Colombo (On-site)',
      locationType: 'On-site',
      stipend: 'LKR 45,000 / month',
      deadline: '2026-12-05',
      description: 'Design and write automated integration and end-to-end test suites for API microservices.',
      requiredSkills: ['cypress', 'jest', 'javascript', 'api testing'],
      company: {
        _id: 'comp_03',
        name: 'WSO2 Sri Lanka',
      },
    },
    company: {
      _id: 'comp_03',
      name: 'WSO2 Sri Lanka',
      logoUrl: '',
      location: 'Colombo 04',
      contactEmail: 'careers@wso2.com',
    },
    resumeUrl: 'https://internbridge.storage/resumes/bandara_qa_cv.pdf',
    coverLetter: 'Dedicated to high test coverage and bulletproof automated integration testing.',
    matchScore: 89,
    status: 'applied',
    notes: 'Initial application submitted. Awaiting recruiter screening.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'app_seed_04',
    student: {
      _id: 'std_057',
      name: 'K.S. Weerasinghe',
      email: 'weerasinghe@tech.seu.ac.lk',
    },
    studentProfile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Computer Science',
      fieldOfStudy: 'Distributed Systems',
      gpa: '3.75',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    },
    internship: {
      _id: 'int_01',
      title: 'Full Stack Engineering Intern',
      area: 'Software Engineering',
      location: 'Colombo (Hybrid)',
      locationType: 'Hybrid',
      stipend: 'LKR 55,000 / month',
      deadline: '2026-11-30',
      description: 'Build enterprise ERP extensions with React, Node.js, and MongoDB.',
      requiredSkills: ['react', 'node.js', 'mongodb', 'rest apis'],
      company: {
        _id: 'comp_01',
        name: 'IFS Sri Lanka',
      },
    },
    company: {
      _id: 'comp_01',
      name: 'IFS Sri Lanka',
      logoUrl: '',
      location: 'Colombo 03',
      contactEmail: 'recruitment@ifs.lk',
    },
    resumeUrl: 'https://internbridge.storage/resumes/weerasinghe_cv.pdf',
    coverLetter: 'Experienced in building enterprise full-stack applications with modular components.',
    matchScore: 86,
    status: 'under_review',
    notes: 'Screened by HR. Awaiting feedback from engineering manager.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'app_seed_05',
    student: {
      _id: 'std_035',
      name: 'W.M.E. Saumya',
      email: 'saumya@tech.seu.ac.lk',
    },
    studentProfile: {
      university: 'South Eastern University of Sri Lanka',
      degree: 'BSc Hons in Information Systems',
      fieldOfStudy: 'Enterprise Web & Search Engines',
      gpa: '3.90',
      skills: ['React', 'Node.js', 'MongoDB', 'Elasticsearch'],
    },
    internship: {
      _id: 'int_01',
      title: 'Full Stack Engineering Intern',
      area: 'Software Engineering',
      location: 'Colombo (Hybrid)',
      locationType: 'Hybrid',
      stipend: 'LKR 55,000 / month',
      deadline: '2026-11-30',
      description: 'Build enterprise ERP extensions with React, Node.js, and MongoDB.',
      requiredSkills: ['react', 'node.js', 'mongodb', 'rest apis'],
      company: {
        _id: 'comp_01',
        name: 'IFS Sri Lanka',
      },
    },
    company: {
      _id: 'comp_01',
      name: 'IFS Sri Lanka',
      logoUrl: '',
      location: 'Colombo 03',
      contactEmail: 'recruitment@ifs.lk',
    },
    resumeUrl: 'https://internbridge.storage/resumes/saumya_cv.pdf',
    coverLetter: 'Proficient in search indexing, UI optimization, and full stack microservice design.',
    matchScore: 96,
    status: 'hired',
    notes: 'Offer extended and candidate accepted. Internship commences next month.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Helper to access persistent local mock applications
const getLocalStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
      return [...SEED_APPLICATIONS];
    }
    return JSON.parse(raw);
  } catch {
    return [...SEED_APPLICATIONS];
  }
};

const saveLocalStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};

export const applicationsApi = {
  /**
   * Submit an application (Student)
   * Tries backend first; seamlessly persists locally if offline/demo
   */
  async submitApplication({ internshipId, resumeUrl, coverLetter, internshipTitle, companyName, companyId }) {
    try {
      const response = await apiClient.post('/applications', {
        internshipId,
        resumeUrl,
        coverLetter,
      });
      return response;
    } catch (backendError) {
      console.warn('[applicationsApi] Operating via local reactive store:', backendError.message);

      const store = getLocalStore();
      const currentStudentId = 'std_030';

      // Enforce duplicate restriction: student can only apply once per internship
      const alreadyApplied = store.some(
        (app) =>
          (app.student?._id === currentStudentId || app.student?.id === currentStudentId) &&
          (app.internship?._id === internshipId || app.internship?.id === internshipId)
      );

      if (alreadyApplied) {
        const error = new Error('You have already applied for this internship position.');
        error.response = { data: { message: error.message } };
        throw error;
      }

      const newApp = {
        _id: `app_loc_${Date.now()}`,
        student: {
          _id: currentStudentId,
          name: 'G.D.V. Bandara',
          email: 'bandara@tech.seu.ac.lk',
        },
        studentProfile: {
          university: 'South Eastern University of Sri Lanka',
          degree: 'BSc Hons in Information & Communication Technology',
          fieldOfStudy: 'Software Systems & Web Architecture',
          gpa: '3.82',
          skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
        },
        internship: {
          _id: internshipId,
          title: internshipTitle || 'Full Stack Engineering Intern',
          area: 'Software Engineering',
          location: 'Colombo (Hybrid)',
          locationType: 'Hybrid',
          stipend: 'LKR 50,000 / month',
          deadline: '2026-11-30',
          company: {
            _id: companyId || 'comp_01',
            name: companyName || 'IFS Sri Lanka',
          },
        },
        company: {
          _id: companyId || 'comp_01',
          name: companyName || 'IFS Sri Lanka',
          logoUrl: '',
          location: 'Colombo',
        },
        resumeUrl: resumeUrl.trim(),
        coverLetter: coverLetter ? coverLetter.trim() : '',
        matchScore: Math.floor(Math.random() * 15) + 82, // realistic 82-96% match
        status: 'applied',
        notes: 'Application received. Pending review by recruitment team.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.unshift(newApp);
      saveLocalStore(store);

      return {
        success: true,
        message: 'Application submitted successfully',
        data: newApp,
      };
    }
  },

  /**
   * Get student's application history
   */
  async getStudentApplications(status = '') {
    try {
      const query = status && status !== 'all' ? `?status=${status}` : '';
      const response = await apiClient.get(`/applications/my${query}`);
      return response;
    } catch (backendError) {
      console.warn('[applicationsApi] Backend offline. Using local student history:', backendError.message);
      const store = getLocalStore();
      const currentStudentId = 'std_030';

      let results = store.filter(
        (app) => app.student?._id === currentStudentId || app.student?.id === currentStudentId
      );

      if (status && status !== 'all') {
        results = results.filter((app) => app.status === status);
      }

      return {
        success: true,
        count: results.length,
        data: results,
      };
    }
  },

  /**
   * Get all applicants across all company internships (Company Recruiter)
   */
  async getCompanyApplications(status = '', internshipId = '') {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (internshipId && internshipId !== 'all') params.append('internshipId', internshipId);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/applications/company/all${queryString}`);
      return response;
    } catch (backendError) {
      console.warn('[applicationsApi] Backend offline. Using local recruiter applicants:', backendError.message);
      let store = getLocalStore();

      if (status && status !== 'all') {
        store = store.filter((app) => app.status === status);
      }

      if (internshipId && internshipId !== 'all') {
        store = store.filter(
          (app) => app.internship?._id === internshipId || app.internship?.id === internshipId
        );
      }

      return {
        success: true,
        count: store.length,
        data: store,
      };
    }
  },

  /**
   * Get candidate applicants for a specific internship (Company Recruiter)
   */
  async getInternshipApplicants(internshipId, status = '') {
    try {
      const query = status && status !== 'all' ? `?status=${status}` : '';
      const response = await apiClient.get(`/applications/internship/${internshipId}${query}`);
      return response;
    } catch (backendError) {
      const store = getLocalStore();
      let results = store.filter(
        (app) => app.internship?._id === internshipId || app.internship?.id === internshipId
      );
      if (status && status !== 'all') {
        results = results.filter((app) => app.status === status);
      }
      return {
        success: true,
        count: results.length,
        data: results,
      };
    }
  },

  /**
   * Get single application details
   */
  async getApplicationById(applicationId) {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`);
      return response;
    } catch (backendError) {
      const store = getLocalStore();
      const app = store.find((a) => a._id === applicationId);
      if (!app) {
        throw new Error('Application not found');
      }
      return { success: true, data: app };
    }
  },

  /**
   * Update applicant recruitment status ('under_review', 'shortlisted', 'rejected', 'hired')
   */
  async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      const response = await apiClient.patch(`/applications/${applicationId}/status`, {
        status,
        notes,
      });
      return response;
    } catch (backendError) {
      console.warn('[applicationsApi] Status updated in local store:', backendError.message);
      const store = getLocalStore();
      const target = store.find((a) => a._id === applicationId);
      if (!target) {
        throw new Error('Application not found');
      }

      target.status = status;
      if (notes !== undefined) {
        target.notes = notes;
      }
      target.updatedAt = new Date().toISOString();

      saveLocalStore(store);

      return {
        success: true,
        message: `Candidate status updated to '${status}'`,
        data: target,
      };
    }
  },

  /**
   * Withdraw application (Student)
   */
  async withdrawApplication(applicationId) {
    try {
      const response = await apiClient.delete(`/applications/${applicationId}`);
      return response;
    } catch (backendError) {
      console.warn('[applicationsApi] Application withdrawn from local store:', backendError.message);
      let store = getLocalStore();
      store = store.filter((a) => a._id !== applicationId);
      saveLocalStore(store);

      return {
        success: true,
        message: 'Application successfully withdrawn',
      };
    }
  },

  /**
   * Reset mock store to initial demo state
   */
  resetLocalStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
    return [...SEED_APPLICATIONS];
  },
};

export default applicationsApi;
