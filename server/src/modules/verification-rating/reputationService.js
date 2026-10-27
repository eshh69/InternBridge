import { Review } from '../../models/Review.js';
import { StudentProfile } from '../../models/StudentProfile.js';
import { Company } from '../../models/Company.js';

/**
 * Calculates aggregate reputation score and criteria averages from verified reviews,
 * then synchronizes the result to the corresponding StudentProfile or Company document.
 * 
 * @param {'student' | 'company'} targetType 
 * @param {string | mongoose.Types.ObjectId} targetId - User ID for student, or Company ID / User ID for company
 * @returns {Promise<Object>} Aggregated metrics { reputationScore, reviewCount, breakdown, distribution }
 */
export const calculateAndSyncReputationScore = async (targetType, targetId) => {
  const query = {
    targetType,
    isVerifiedReview: true,
  };

  if (targetType === 'student') {
    query.targetStudent = targetId;
  } else {
    // targetId can be company ID or company user ID
    query.$or = [{ targetCompany: targetId }];
  }

  const reviews = await Review.find(query);
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    const emptyResult = {
      reputationScore: 0,
      reviewCount: 0,
      breakdown: targetType === 'student'
        ? { technicalSkills: 0, softSkills: 0, professionalism: 0 }
        : { workEnvironment: 0, mentorship: 0, professionalism: 0 },
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    if (targetType === 'student') {
      await StudentProfile.findOneAndUpdate(
        { user: targetId },
        { reputationScore: 0, reviewCount: 0 }
      );
    } else {
      await Company.findOneAndUpdate(
        { $or: [{ _id: targetId }, { user: targetId }] },
        { reputationScore: 0, reviewCount: 0 }
      );
    }

    return emptyResult;
  }

  // Calculate sum of overall ratings and distribution
  let sumOverall = 0;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Breakdown sums and counts
  const breakdownSums = {
    technicalSkills: 0,
    softSkills: 0,
    professionalism: 0,
    workEnvironment: 0,
    mentorship: 0,
  };
  const breakdownCounts = {
    technicalSkills: 0,
    softSkills: 0,
    professionalism: 0,
    workEnvironment: 0,
    mentorship: 0,
  };

  reviews.forEach((rev) => {
    const rating = Math.min(5, Math.max(1, Math.round(rev.overallRating)));
    distribution[rating] = (distribution[rating] || 0) + 1;
    sumOverall += rev.overallRating;

    if (rev.ratings) {
      for (const [key, val] of Object.entries(rev.ratings)) {
        if (typeof val === 'number' && val >= 1 && val <= 5) {
          breakdownSums[key] = (breakdownSums[key] || 0) + val;
          breakdownCounts[key] = (breakdownCounts[key] || 0) + 1;
        }
      }
    }
  });

  const rawAverage = sumOverall / reviewCount;
  // Round to 1 decimal place (e.g. 4.7)
  const reputationScore = Math.round(rawAverage * 10) / 10;

  const breakdown = {};
  for (const key of Object.keys(breakdownSums)) {
    if (breakdownCounts[key] > 0) {
      breakdown[key] = Math.round((breakdownSums[key] / breakdownCounts[key]) * 10) / 10;
    } else {
      breakdown[key] = 0;
    }
  }

  // Sync to database entity
  if (targetType === 'student') {
    await StudentProfile.findOneAndUpdate(
      { user: targetId },
      { reputationScore, reviewCount }
    );
  } else {
    await Company.findOneAndUpdate(
      { $or: [{ _id: targetId }, { user: targetId }] },
      { reputationScore, reviewCount }
    );
  }

  return {
    reputationScore,
    reviewCount,
    breakdown,
    distribution,
  };
};
