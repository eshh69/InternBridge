import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { Star, ShieldCheck, Award } from 'lucide-react';

export const ReputationOverviewCard = ({
  reviews = [],
  score,
  reviewCount,
  breakdown,
  distribution,
  targetType = 'student',
  title = 'Aggregate Reputation Score',
}) => {
  // If reviews array is passed and has items, dynamically compute all metrics directly from reviews
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;
  const totalReviews = hasReviews ? reviews.length : (reviewCount || 0);

  // 1. Dynamic Overall Average Score
  const computedScore = hasReviews
    ? Math.round(
        (reviews.reduce((acc, r) => acc + Number(r.overallRating || 0), 0) / reviews.length) * 10
      ) / 10
    : Number(score || 0);

  // 2. Dynamic Reputation Score out of 100
  const reputationScore100 = Math.round((computedScore / 5) * 100);

  // 3. Dynamic Rating Distribution
  const computedDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (hasReviews) {
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.overallRating || 5))));
      computedDistribution[star] = (computedDistribution[star] || 0) + 1;
    });
  } else if (distribution) {
    Object.assign(computedDistribution, distribution);
  }

  // 4. Normalized 3 Core Criteria Breakdown (Technical Proficiency, Soft Skills & Teamwork, Professionalism & Ethic)
  let techSum = 0, techCnt = 0;
  let softSum = 0, softCnt = 0;
  let profSum = 0, profCnt = 0;

  if (hasReviews) {
    reviews.forEach((r) => {
      const ratings = r.ratings || r.ratingCriteria || {};
      const tech =
        ratings.technicalSkills ??
        ratings.technical ??
        ratings.technicalProficiency ??
        ratings.workEnvironment ??
        5;
      const soft =
        ratings.softSkills ??
        ratings.communication ??
        ratings.softSkillsAndTeamwork ??
        ratings.mentorship ??
        5;
      const prof =
        ratings.professionalism ??
        ratings.workEthic ??
        ratings.professionalismAndEthic ??
        5;

      techSum += Number(tech);
      techCnt++;
      softSum += Number(soft);
      softCnt++;
      profSum += Number(prof);
      profCnt++;
    });
  }

  const normalizedCriteriaBreakdown = [
    {
      key: 'technicalSkills',
      label: 'Technical Proficiency',
      val: hasReviews && techCnt ? Math.round((techSum / techCnt) * 10) / 10 : Number(breakdown?.technicalSkills || 0),
    },
    {
      key: 'softSkills',
      label: 'Soft Skills & Teamwork',
      val: hasReviews && softCnt ? Math.round((softSum / softCnt) * 10) / 10 : Number(breakdown?.softSkills || 0),
    },
    {
      key: 'professionalism',
      label: 'Professionalism & Ethic',
      val: hasReviews && profCnt ? Math.round((profSum / profCnt) * 10) / 10 : Number(breakdown?.professionalism || 0),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 !rounded-none p-5 shadow-2xs space-y-6">
      {/* Header with Title and Prominent Reputation Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Certified metrics derived from verified university reviewer evaluations
          </p>
        </div>

        {/* Reputation Score & Verification Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 !rounded-none bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black shadow-2xs">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Reputation Score: {reputationScore100}/100
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 !rounded-none bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Endorsements
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Overall Score */}
        <div className="md:col-span-5 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {computedScore.toFixed(1)}
            </span>
            <span className="text-slate-400 text-lg font-bold">/ 5.0</span>
          </div>

          <StarRating value={computedScore} size="lg" readOnly />

          <p className="text-xs text-slate-600 font-medium">
            Based on <strong className="text-slate-900 font-bold">{totalReviews}</strong> verified academic evaluation
            {totalReviews === 1 ? '' : 's'}
          </p>
        </div>

        {/* Right Column: Rating Distribution Bars */}
        <div className="md:col-span-7 space-y-1.5">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = computedDistribution[starNum] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={starNum} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-slate-600 font-bold flex items-center justify-end gap-0.5">
                  {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                </span>
                <div className="flex-1 bg-slate-100 !rounded-none h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-amber-400 h-full !rounded-none transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-9 text-right text-slate-500 font-mono text-[11px] font-bold">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Criteria Breakdown (Always showing the exact 3 normalized criteria) */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Evaluation Criteria Breakdown
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">Standardized 3-tier matrix</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {normalizedCriteriaBreakdown.map((crit) => {
            const numericVal = Number(crit.val || 0);
            const pct = Math.min(100, Math.round((numericVal / 5) * 100));

            return (
              <div
                key={crit.key}
                className="p-3 bg-slate-50 !rounded-none border border-slate-200 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-bold truncate" title={crit.label}>
                    {crit.label}
                  </span>
                  <span className="font-black text-blue-700 text-sm">
                    {numericVal.toFixed(1)} <span className="text-slate-400 text-xs font-normal">/ 5</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 !rounded-none h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full !rounded-none transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReputationOverviewCard;
