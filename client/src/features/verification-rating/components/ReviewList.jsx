import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StarRating } from './StarRating';
import { ShieldCheck, MessageSquare, Calendar, User, ThumbsUp, Filter } from 'lucide-react';

export const ReviewList = ({ reviews = [], emptyMessage = 'No verified evaluations available yet.' }) => {
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest'

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') {
      return (b.overallRating || 0) - (a.overallRating || 0);
    }
    if (sortBy === 'lowest') {
      return (a.overallRating || 0) - (b.overallRating || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No Evaluations Found"
        description={emptyMessage}
        icon={<MessageSquare className="w-12 h-12 text-slate-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-extrabold text-slate-800">
          Showing {reviews.length} Verified Academic Evaluation{reviews.length === 1 ? '' : 's'}
        </span>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-slate-300 !rounded-none px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {sortedReviews.map((rev) => {
          // Normalize criteria keys across all reviews to the 3 exact standard keys
          const ratings = rev.ratings || rev.ratingCriteria || {};
          const techVal =
            ratings.technicalSkills ??
            ratings.technical ??
            ratings.technicalProficiency ??
            ratings.workEnvironment ??
            5;
          const softVal =
            ratings.softSkills ??
            ratings.communication ??
            ratings.softSkillsAndTeamwork ??
            ratings.mentorship ??
            5;
          const profVal =
            ratings.professionalism ??
            ratings.workEthic ??
            ratings.professionalismAndEthic ??
            5;

          const criteriaPills = [
            { label: 'Technical Proficiency', val: Number(techVal) },
            { label: 'Soft Skills & Teamwork', val: Number(softVal) },
            { label: 'Professionalism & Ethic', val: Number(profVal) },
          ];

          return (
            <div
              key={rev._id}
              className="bg-white border border-slate-200 !rounded-none p-4 shadow-2xs space-y-3 hover:border-blue-400 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 !rounded-none bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {rev.reviewer?.name?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        {rev.reviewer?.name || 'Academic Reviewer'}
                      </h5>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 !rounded-none bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Reviewer
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {rev.reviewer?.email ? `${rev.reviewer.email} • ` : ''}
                      Official Academic Evaluation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StarRating value={rev.overallRating} size="sm" showScore readOnly />
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Normalized Criteria Breakdown Pills (Technical Proficiency, Soft Skills & Teamwork, Professionalism & Ethic) */}
              <div className="flex flex-wrap gap-2">
                {criteriaPills.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 text-slate-700 !rounded-none border border-slate-200 font-medium"
                  >
                    <span className="text-slate-600 font-semibold">{item.label}:</span>
                    <strong className="text-blue-700 font-bold">{item.val}/5</strong>
                  </span>
                ))}
              </div>

              {/* Qualitative Feedback Text */}
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 !rounded-none border border-slate-200">
                "{rev.comments}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;
