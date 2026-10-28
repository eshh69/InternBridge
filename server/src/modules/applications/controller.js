import mongoose from 'mongoose';
import { Application } from '../../models/Application.js';
import { Internship } from '../../models/Internship.js';
import { Company } from '../../models/Company.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { Notification } from '../../models/Notification.js';
import { getIO } from '../../socket/index.js';
import { calculateInternshipMatch } from '../search-matching/matchingEngine.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

/**
 * @desc    Submit a new internship application
 * @route   POST /api/v1/applications
 * @access  Private (Role: student)
 */
export const submitApplication = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { internshipId, resumeUrl, coverLetter } = req.body;

    // 1. Validate required fields
    if (!internshipId) {
      return sendError(res, 400, 'Internship ID is required to apply.');
    }

    if (!resumeUrl || !resumeUrl.trim()) {
      return sendError(res, 400, 'A valid Resume/CV URL or document is required.');
    }

    // 2. Validate internship existence
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return sendError(res, 404, 'The requested internship listing was not found.');
    }

    if (internship.status && internship.status !== 'published') {
      return sendError(
        res,
        400,
        `Cannot apply: internship listing is currently '${internship.status}'. Only published listings accept applications.`
      );
    }

    // 3. Prevent duplicate application (enforce 1 student per listing constraint)
    const existingApplication = await Application.findOne({
      student: studentId,
      internship: internshipId,
    });

    if (existingApplication) {
      return sendError(res, 400, 'You have already applied for this internship position.');
    }

    // 4. Calculate Match Score using student's profile skills
    let matchScore = 0;
    try {
      const studentProfile = await StudentProfile.findOne({ user: studentId });
      if (studentProfile) {
        const matchResult = calculateInternshipMatch(studentProfile, internship);
        matchScore = matchResult?.matchScore || 0;
      }
    } catch (matchErr) {
      console.warn('Match score calculation non-fatal warning:', matchErr.message);
    }

    // 5. Create new application
    const newApplication = await Application.create({
      student: studentId,
      internship: internshipId,
      company: internship.company,
      resumeUrl: resumeUrl.trim(),
      coverLetter: coverLetter ? coverLetter.trim() : '',
      matchScore,
      status: 'applied',
    });

    const populatedApplication = await Application.findById(newApplication._id)
      .populate({
        path: 'internship',
        select: 'title area location locationType stipend deadline requiredSkills',
      })
      .populate({
        path: 'company',
        select: 'name logoUrl location website',
      });

    // Dispatch notification to company recruiter if available
    try {
      const companyDoc = await Company.findById(internship.company);
      if (companyDoc?.user) {
        await Notification.create({
          recipient: companyDoc.user,
          sender: studentId,
          type: 'application_status',
          title: 'New Applicant Received',
          message: `A candidate has submitted an application for "${internship.title}".`,
          referenceId: newApplication._id,
        });

        try {
          const io = getIO();
          io.to(`user_${companyDoc.user}`).emit('new_applicant_received', {
            applicationId: newApplication._id,
            internshipId: internship._id,
            internshipTitle: internship.title,
            studentName: req.user.name,
          });
        } catch {
          // Non-fatal if socket not running
        }
      }
    } catch (notifErr) {
      console.warn('Recruiter notification non-fatal warning:', notifErr.message);
    }

    return sendSuccess(res, 201, 'Application submitted successfully', populatedApplication);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'You have already applied for this internship position.');
    }
    next(error);
  }
};

/**
 * @desc    Get all submitted applications for logged-in student
 * @route   GET /api/v1/applications/my
 * @access  Private (Role: student)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { status } = req.query;

    const query = { student: studentId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'internship',
        select: 'title area location locationType stipend deadline description requiredSkills company status',
      })
      .populate({
        path: 'company',
        select: 'name logoUrl location website contactEmail',
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applicants for a specific internship listing (for company owner)
 * @route   GET /api/v1/applications/internship/:id
 * @access  Private (Role: company, admin)
 */
export const getInternshipApplicants = async (req, res, next) => {
  try {
    const { id: internshipId } = req.params;
    const { status } = req.query;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return sendError(res, 404, 'Internship listing not found.');
    }

    // If company role, ensure they own this internship
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || internship.company.toString() !== company._id.toString()) {
        return sendError(res, 403, 'Access denied: You do not own this internship listing.');
      }
    }

    const query = { internship: internshipId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applicants = await Application.find(query)
      .populate({
        path: 'student',
        select: 'name email avatarUrl',
      })
      .populate({
        path: 'internship',
        select: 'title area location stipend deadline requiredSkills',
      })
      .sort({ createdAt: -1 });

    // Attach student profile info (university, degree, skills) for recruiter convenience
    const studentIds = applicants.map((app) => app.student?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ user: { $in: studentIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const enrichedApplicants = applicants.map((app) => {
      const appObj = app.toObject();
      if (appObj.student?._id) {
        appObj.studentProfile = profileMap.get(appObj.student._id.toString()) || null;
      }
      return appObj;
    });

    return sendSuccess(res, 200, 'Internship applicants retrieved successfully', enrichedApplicants);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applicants across all internships of logged-in company
 * @route   GET /api/v1/applications/company/all
 * @access  Private (Role: company, admin)
 */
export const getCompanyApplicants = async (req, res, next) => {
  try {
    let companyId;

    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company) {
        return sendError(res, 404, 'Company profile not found.');
      }
      companyId = company._id;
    } else if (req.query.companyId) {
      companyId = req.query.companyId;
    }

    const query = companyId ? { company: companyId } : {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.internshipId && req.query.internshipId !== 'all') {
      query.internship = req.query.internshipId;
    }

    const applicants = await Application.find(query)
      .populate({
        path: 'student',
        select: 'name email avatarUrl',
      })
      .populate({
        path: 'internship',
        select: 'title area location stipend deadline requiredSkills',
      })
      .sort({ createdAt: -1 });

    // Attach student profile info
    const studentIds = applicants.map((app) => app.student?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ user: { $in: studentIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const enrichedApplicants = applicants.map((app) => {
      const appObj = app.toObject();
      if (appObj.student?._id) {
        appObj.studentProfile = profileMap.get(appObj.student._id.toString()) || null;
      }
      return appObj;
    });

    return sendSuccess(res, 200, 'Company applicants retrieved successfully', enrichedApplicants);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/v1/applications/:id
 * @access  Private (Applicant student, Owner company, or Admin)
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate({
        path: 'student',
        select: 'name email avatarUrl',
      })
      .populate({
        path: 'internship',
        select: 'title area location locationType stipend deadline description requiredSkills',
      })
      .populate({
        path: 'company',
        select: 'name logoUrl location website contactEmail',
      });

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Role verification
    if (req.user.role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied.');
    }

    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || application.company._id.toString() !== company._id.toString()) {
        return sendError(res, 403, 'Access denied.');
      }
    }

    const appObj = application.toObject();
    if (appObj.student?._id) {
      appObj.studentProfile = (await StudentProfile.findOne({ user: appObj.student._id })) || null;
    }

    return sendSuccess(res, 200, 'Application details retrieved successfully', appObj);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update applicant recruitment status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (Role: company, admin)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['applied', 'under_review', 'shortlisted', 'rejected', 'hired'];
    if (!status || !allowedStatuses.includes(status)) {
      return sendError(
        res,
        400,
        `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      );
    }

    const application = await Application.findById(id);
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Verify company ownership
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user._id });
      if (!company || application.company.toString() !== company._id.toString()) {
        return sendError(res, 403, 'Access denied: You do not own this application listing.');
      }
    }

    application.status = status;
    application.statusUpdatedAt = new Date();
    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    const updated = await Application.findById(id)
      .populate('student', 'name email avatarUrl')
      .populate('internship', 'title area location')
      .populate('company', 'name logoUrl');

    // Dispatch in-app notification & real-time Socket.IO event to student
    try {
      const notifMessage = notes
        ? `Your application for "${updated.internship?.title || 'internship'}" was updated to '${status}'. Note: ${notes}`
        : `Your application for "${updated.internship?.title || 'internship'}" was updated to '${status}'.`;

      await Notification.create({
        recipient: application.student,
        sender: req.user._id,
        type: 'application_status',
        title: `Application Status: ${status.replace('_', ' ').toUpperCase()}`,
        message: notifMessage,
        referenceId: application._id,
      });

      try {
        const io = getIO();
        io.to(`user_${application.student}`).emit('application_status_updated', {
          applicationId: application._id,
          status,
          notes: application.notes,
          internshipTitle: updated.internship?.title,
          companyName: updated.company?.name,
        });
      } catch {
        // Non-fatal if socket server not active
      }
    } catch (notifErr) {
      console.warn('Notification dispatch non-fatal error:', notifErr.message);
    }

    return sendSuccess(res, 200, `Application status updated to '${status}' successfully`, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw application (for student)
 * @route   DELETE /api/v1/applications/:id
 * @access  Private (Role: student)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You can only withdraw your own applications.');
    }

    if (application.status !== 'applied') {
      return sendError(
        res,
        400,
        `Cannot withdraw application that is already in '${application.status}' stage.`
      );
    }

    await Application.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Application successfully withdrawn.');
  } catch (error) {
    next(error);
  }
};
