import mongoose from 'mongoose';
import { Company } from '../../models/Company.js';
import { Internship } from '../../models/Internship.js';
import { Application } from '../../models/Application.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

/**
 * Helper to normalize skills array to lowercase and trimmed strings
 */
const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  if (Array.isArray(skills)) {
    return skills
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
};

/**
 * @desc    Create a new internship listing
 * @route   POST /api/v1/internships
 * @access  Private (Role: company)
 */
export const createInternship = async (req, res, next) => {
  try {
    // 1. Verify user has a company profile
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return sendError(
        res,
        400,
        'Company profile must be created before posting an internship. Please complete your company profile first.'
      );
    }

    const {
      title,
      description,
      area,
      requiredSkills,
      qualifications,
      locationType = 'On-site',
      location,
      durationMonths = 6,
      openPositions = 1,
      stipend,
      deadline,
      status = 'published',
    } = req.body;

    // 2. Validate required text fields
    if (!title || !title.trim()) {
      return sendError(res, 400, 'Internship title is required');
    }
    if (!description || !description.trim()) {
      return sendError(res, 400, 'Internship description is required');
    }
    if (!area || !area.trim()) {
      return sendError(res, 400, 'Area or discipline is required (e.g., Software Engineering)');
    }
    if (!location || !location.trim()) {
      return sendError(res, 400, 'Location is required');
    }

    // 3. Validate requiredSkills
    const normalizedSkills = normalizeSkills(requiredSkills);
    if (normalizedSkills.length === 0) {
      return sendError(res, 400, 'Please provide at least one required skill');
    }

    // 4. Validate locationType enum
    const validLocationTypes = ['On-site', 'Remote', 'Hybrid'];
    if (!validLocationTypes.includes(locationType)) {
      return sendError(
        res,
        400,
        `Location type must be one of: ${validLocationTypes.join(', ')}`
      );
    }

    // 5. Validate numbers
    const numDuration = Number(durationMonths);
    if (isNaN(numDuration) || numDuration < 1) {
      return sendError(res, 400, 'Duration must be at least 1 month');
    }

    const numPositions = Number(openPositions);
    if (isNaN(numPositions) || numPositions < 1) {
      return sendError(res, 400, 'Open positions must be at least 1');
    }

    // 6. Validate stipend
    const isPaid = Boolean(stipend?.isPaid);
    const stipendAmount = Number(stipend?.amount) || 0;
    if (stipendAmount < 0) {
      return sendError(res, 400, 'Stipend amount cannot be negative');
    }

    // 7. Validate deadline
    if (!deadline) {
      return sendError(res, 400, 'Application deadline is required');
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return sendError(res, 400, 'Invalid deadline date format');
    }
    if (deadlineDate <= new Date()) {
      return sendError(res, 400, 'Application deadline must be a future date');
    }

    // 8. Validate status
    const validStatuses = ['draft', 'published', 'closed'];
    const finalStatus = validStatuses.includes(status) ? status : 'published';

    // 9. Qualifications sanitization
    const sanitizedQualifications = Array.isArray(qualifications)
      ? qualifications.map((q) => String(q).trim()).filter(Boolean)
      : typeof qualifications === 'string'
      ? qualifications.split('\n').map((q) => q.trim()).filter(Boolean)
      : [];

    const internship = await Internship.create({
      company: company._id,
      title: title.trim(),
      description: description.trim(),
      area: area.trim(),
      requiredSkills: normalizedSkills,
      qualifications: sanitizedQualifications,
      locationType,
      location: location.trim(),
      durationMonths: numDuration,
      openPositions: numPositions,
      stipend: {
        isPaid,
        amount: stipendAmount,
        currency: stipend?.currency?.trim() || 'LKR',
      },
      deadline: deadlineDate,
      status: finalStatus,
    });

    return sendSuccess(res, 201, 'Internship created successfully', internship);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all internships posted by current authenticated company with dashboard stats
 * @route   GET /api/v1/internships/my
 * @access  Private (Role: company)
 */
export const getMyInternships = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
      return sendSuccess(res, 200, 'No company profile found', {
        internships: [],
        company: null,
        stats: {
          total: 0,
          published: 0,
          draft: 0,
          closed: 0,
          totalApplicants: 0,
        },
      });
    }

    // Filter by status if query param is present
    const filter = { company: company._id };
    if (req.query.status && ['draft', 'published', 'closed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const internships = await Internship.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate applicant counts per internship
    const internshipIds = internships.map((i) => i._id);
    const applicantAggregates = await Application.aggregate([
      { $match: { internship: { $in: internshipIds } } },
      { $group: { _id: '$internship', count: { $sum: 1 } } },
    ]);

    const applicantCountMap = {};
    applicantAggregates.forEach((item) => {
      applicantCountMap[item._id.toString()] = item.count;
    });

    const enrichedInternships = internships.map((item) => ({
      ...item,
      applicantCount: applicantCountMap[item._id.toString()] || 0,
    }));

    // Calculate company-wide dashboard metrics
    const [allInternshipsCount, publishedCount, draftCount, closedCount, totalApplicantsCount] =
      await Promise.all([
        Internship.countDocuments({ company: company._id }),
        Internship.countDocuments({ company: company._id, status: 'published' }),
        Internship.countDocuments({ company: company._id, status: 'draft' }),
        Internship.countDocuments({ company: company._id, status: 'closed' }),
        Application.countDocuments({ company: company._id }),
      ]);

    return sendSuccess(res, 200, 'Company internships retrieved successfully', {
      internships: enrichedInternships,
      company: {
        id: company._id,
        name: company.name,
        verificationStatus: company.verificationStatus,
        reputationScore: company.reputationScore,
        reviewCount: company.reviewCount,
      },
      stats: {
        total: allInternshipsCount,
        published: publishedCount,
        draft: draftCount,
        closed: closedCount,
        totalApplicants: totalApplicantsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single internship details by ID
 * @route   GET /api/v1/internships/:id
 * @access  Public / Token
 */
export const getInternshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid internship ID format');
    }

    const internship = await Internship.findById(id).populate(
      'company',
      'name logoUrl location industry verificationStatus website reputationScore reviewCount'
    );

    if (!internship) {
      return sendError(res, 404, 'Internship listing not found');
    }

    return sendSuccess(res, 200, 'Internship details retrieved successfully', internship);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update internship listing
 * @route   PUT /api/v1/internships/:id
 * @access  Private (Role: company - Owner only)
 */
export const updateInternship = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid internship ID format');
    }

    const internship = await Internship.findById(id);
    if (!internship) {
      return sendError(res, 404, 'Internship listing not found');
    }

    // Ownership check
    const company = await Company.findOne({ user: req.user._id });
    if (!company || !internship.company.equals(company._id)) {
      return sendError(
        res,
        403,
        'Forbidden. You can only edit internships posted by your own company.'
      );
    }

    const {
      title,
      description,
      area,
      requiredSkills,
      qualifications,
      locationType,
      location,
      durationMonths,
      openPositions,
      stipend,
      deadline,
      status,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return sendError(res, 400, 'Internship title cannot be empty');
      internship.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) return sendError(res, 400, 'Internship description cannot be empty');
      internship.description = description.trim();
    }

    if (area !== undefined) {
      if (!area.trim()) return sendError(res, 400, 'Area cannot be empty');
      internship.area = area.trim();
    }

    if (requiredSkills !== undefined) {
      const normalizedSkills = normalizeSkills(requiredSkills);
      if (normalizedSkills.length === 0) {
        return sendError(res, 400, 'At least one required skill is required');
      }
      internship.requiredSkills = normalizedSkills;
    }

    if (qualifications !== undefined) {
      internship.qualifications = Array.isArray(qualifications)
        ? qualifications.map((q) => String(q).trim()).filter(Boolean)
        : typeof qualifications === 'string'
        ? qualifications.split('\n').map((q) => q.trim()).filter(Boolean)
        : [];
    }

    if (locationType !== undefined) {
      const validLocationTypes = ['On-site', 'Remote', 'Hybrid'];
      if (!validLocationTypes.includes(locationType)) {
        return sendError(
          res,
          400,
          `Location type must be one of: ${validLocationTypes.join(', ')}`
        );
      }
      internship.locationType = locationType;
    }

    if (location !== undefined) {
      if (!location.trim()) return sendError(res, 400, 'Location cannot be empty');
      internship.location = location.trim();
    }

    if (durationMonths !== undefined) {
      const numDuration = Number(durationMonths);
      if (isNaN(numDuration) || numDuration < 1) {
        return sendError(res, 400, 'Duration must be at least 1 month');
      }
      internship.durationMonths = numDuration;
    }

    if (openPositions !== undefined) {
      const numPositions = Number(openPositions);
      if (isNaN(numPositions) || numPositions < 1) {
        return sendError(res, 400, 'Open positions must be at least 1');
      }
      internship.openPositions = numPositions;
    }

    if (stipend !== undefined) {
      const isPaid = Boolean(stipend.isPaid);
      const amount = Number(stipend.amount) || 0;
      if (amount < 0) {
        return sendError(res, 400, 'Stipend amount cannot be negative');
      }
      internship.stipend = {
        isPaid,
        amount,
        currency: stipend.currency?.trim() || 'LKR',
      };
    }

    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return sendError(res, 400, 'Invalid deadline date format');
      }
      if (deadlineDate <= new Date()) {
        return sendError(res, 400, 'Application deadline must be a future date');
      }
      internship.deadline = deadlineDate;
    }

    if (status !== undefined) {
      const validStatuses = ['draft', 'published', 'closed'];
      if (!validStatuses.includes(status)) {
        return sendError(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
      }
      internship.status = status;
    }

    await internship.save();
    return sendSuccess(res, 200, 'Internship updated successfully', internship);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change status of an internship (draft, published, closed)
 * @route   PATCH /api/v1/internships/:id/status
 * @access  Private (Role: company - Owner only)
 */
export const updateInternshipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid internship ID format');
    }

    const validStatuses = ['draft', 'published', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(
        res,
        400,
        `Invalid status. Status must be one of: ${validStatuses.join(', ')}`
      );
    }

    const internship = await Internship.findById(id);
    if (!internship) {
      return sendError(res, 404, 'Internship listing not found');
    }

    // Ownership check
    const company = await Company.findOne({ user: req.user._id });
    if (!company || !internship.company.equals(company._id)) {
      return sendError(
        res,
        403,
        'Forbidden. You can only update internships posted by your own company.'
      );
    }

    internship.status = status;
    await internship.save();

    return sendSuccess(
      res,
      200,
      `Internship status changed to '${status}' successfully`,
      internship
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an internship listing
 * @route   DELETE /api/v1/internships/:id
 * @access  Private (Role: company - Owner only)
 */
export const deleteInternship = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid internship ID format');
    }

    const internship = await Internship.findById(id);
    if (!internship) {
      return sendError(res, 404, 'Internship listing not found');
    }

    // Ownership check
    const company = await Company.findOne({ user: req.user._id });
    if (!company || !internship.company.equals(company._id)) {
      return sendError(
        res,
        403,
        'Forbidden. You can only delete internships posted by your own company.'
      );
    }

    await Internship.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Internship listing deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
