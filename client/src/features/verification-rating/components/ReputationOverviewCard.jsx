import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { Star, ShieldCheck, Award } from 'lucide-react';

export const ReputationOverviewCard = ({
  score = 0,
  reviewCount = 0,
  breakdown = {},
  distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  targetType = 'student',
  title = 'Aggregate Reputation Score',
}) => {
  const criteriaLabels = {
    technicalSkills: 'Technical Proficiency',
    softSkills: 'Soft Skills & Teamwork',
    professionalism: 'Professionalism & Ethic',
    workEnvironment: 'Work Environment & Culture',
    mentorship: 'Mentorship & Supervision',
  };

  const totalReviews = reviewCount || 0;

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">
            Certified metrics derived from verified university reviewer evaluations
          </p>
        </div>
        <Badge variant="success" size="sm" className="hidden sm:inline-flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Verified Endorsements
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Score */}
        <div className="md:col-span-5 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tight">
              {Number(score || 0).toFixed(1)}
            </span>
            <span className="text-gray-400 text-lg font-medium">/ 5.0</span>
          </div>

          <StarRating value={score} size="lg" readOnly />

          <p className="text-xs text-gray-500 font-medium">
            Based on <strong className="text-gray-800">{totalReviews}</strong> verified academic evaluation
            {totalReviews === 1 ? '' : 's'}
          </p>
        </div>

        {/* Right Column: Rating Distribution Bars */}
        <div className="md:col-span-7 space-y-1.5">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = distribution[starNum] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={starNum} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-gray-600 font-medium flex items-center justify-end gap-0.5">
                  {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-9 text-right text-gray-400 font-mono text-[11px]">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Criteria Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Evaluation Criteria Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(breakdown).map(([criterion, val]) => {
              const label = criteriaLabels[criterion] || criterion;
              const numericVal = Number(val || 0);
              const pct = (numericVal / 5) * 100;

              return (
                <div key={criterion} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium truncate" title={label}>
                      {label}
                    </span>
                    <span className="font-bold text-gray-900">{numericVal.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
