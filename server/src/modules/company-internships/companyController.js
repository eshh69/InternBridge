import mongoose from 'mongoose';
import { Company } from '../../models/Company.js';
import { Internship } from '../../models/Internship.js';
import { Application } from '../../models/Application.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

/**
 * @desc    Get current authenticated user's company profile
 * @route   GET /api/v1/companies/me
 * @access  Private (Role: company)
 */
export const getMyCompanyProfile = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });

    if (!company) {
      return sendError(res, 404, 'Company profile has not been created yet');
    }

    return sendSuccess(res, 200, 'Company profile retrieved successfully', company);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update current authenticated user's company profile
 * @route   PUT /api/v1/companies/me
 * @access  Private (Role: company)
 */
export const updateMyCompanyProfile = async (req, res, next) => {
  try {
    const {
      name,
      description,
      industry,
      location,
      website,
      contactEmail,
      contactPhone,
      logoUrl,
    } = req.body;

    // Validation for essential fields
    if (!name || !name.trim()) {
      return sendError(res, 400, 'Company name is required');
    }
    if (!description || !description.trim()) {
      return sendError(res, 400, 'Company description is required');
    }
    if (!industry || !industry.trim()) {
      return sendError(res, 400, 'Industry is required');
    }
    if (!contactEmail || !contactEmail.trim()) {
      return sendError(res, 400, 'Contact email is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      return sendError(res, 400, 'Please provide a valid contact email address');
    }

    // Location object validation
    const parsedLocation = {
      address: location?.address?.trim() || 'Headquarters',
      city: location?.city?.trim() || 'Colombo',
      country: location?.country?.trim() || 'Sri Lanka',
    };

    let company = await Company.findOne({ user: req.user._id });

    if (company) {
      // Update existing profile (exclude verificationStatus, reputationScore, reviewCount)
      company.name = name.trim();
      company.description = description.trim();
      company.industry = industry.trim();
      company.location = parsedLocation;
      company.website = website ? website.trim() : '';
      company.contactEmail = contactEmail.trim().toLowerCase();
      company.contactPhone = contactPhone ? contactPhone.trim() : '';
      if (logoUrl !== undefined) {
        company.logoUrl = logoUrl;
      }

      await company.save();
      return sendSuccess(res, 200, 'Company profile updated successfully', company);
    } else {
      // Create new company profile
      company = await Company.create({
        user: req.user._id,
        name: name.trim(),
        description: description.trim(),
        industry: industry.trim(),
        location: parsedLocation,
        website: website ? website.trim() : '',
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone ? contactPhone.trim() : '',
        logoUrl: logoUrl || null,
        verificationStatus: 'unverified',
        reputationScore: 0,
        reviewCount: 0,
      });

      return sendSuccess(res, 201, 'Company profile created successfully', company);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public company profile by Company ID
 * @route   GET /api/v1/companies/:id
 * @access  Private (Role: Any authenticated user)
 */
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid company ID format');
    }

    const company = await Company.findById(id).select(
      'name description industry location website contactEmail contactPhone logoUrl verificationStatus reputationScore reviewCount createdAt'
    );

    if (!company) {
      return sendError(res, 404, 'Company not found');
    }

    return sendSuccess(res, 200, 'Company details retrieved successfully', company);
  } catch (error) {
    next(error);
  }
};
