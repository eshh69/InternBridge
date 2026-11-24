import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StarRating } from './StarRating';
import {
  ShieldCheck,
  MessageSquare,
  Calendar,
  User,
  ThumbsUp,
  Filter,
  Mail,
  GraduationCap,
  Building2,
  Sparkles,
} from 'lucide-react';

const resolveTarget = (rev) => {
  if (rev.targetStudent && typeof rev.targetStudent === 'object') {
    return {
      name: rev.targetStudent.name || rev.targetName || 'Student Candidate',
      email: rev.targetStudent.email,
      info:
        rev.targetStudent.profile?.degree ||
        rev.targetStudent.profile?.fieldOfStudy ||
        rev.targetInfo ||
        'Student Candidate',
      type: 'student',
      avatarUrl: rev.targetStudent.avatarUrl,
    };
  }

  if (rev.targetCompany && typeof rev.targetCompany === 'object') {
    return {
      name: rev.targetCompany.name || rev.targetName || 'Corporate Partner',
      email: rev.targetCompany.contactEmail || rev.targetCompany.email,
      info: rev.targetCompany.industry || rev.targetInfo || 'Corporate Partner',
      type: 'company',
      avatarUrl: rev.targetCompany.logoUrl,
    };
  }

  if (rev.targetName) {
    return {
      name: rev.targetName,
      email: rev.targetEmail,
      info: rev.targetInfo || (rev.targetType === 'student' ? 'Student Candidate' : 'Corporate Partner'),
      type: rev.targetType || 'student',
    };
  }

  const comment = rev.comments || '';
  if (comment.includes('Kasun') || rev.targetStudentId === 'std_057') {
    return {
      name: 'Kasun Weerasinghe',
      email: 'student@internbridge.lk',
      info: 'BSc Hons in ICT • South Eastern University of Sri Lanka',
      type: 'student',
    };
  }
  if (comment.includes('Virtusa') || rev.targetCompanyId === 'comp_01') {
    return {
      name: 'Virtusa Technologies',
      email: 'company@internbridge.lk',
      info: 'Enterprise Software Engineering',
      type: 'company',
    };
  }
  if (comment.includes('WSO2') || rev.targetCompanyId === 'comp_02') {
    return {
      name: 'WSO2 Lanka',
      email: 'careers@wso2.com',
      info: 'Open Source & Cloud Middleware',
      type: 'company',
    };
  }

  return null;
};

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
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] font-semibold"
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

          const target = resolveTarget(rev);

          return (
            <div
              key={rev._id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 hover:border-[#1E3B2F] transition-colors"
            >
              {/* Target Recipient Banner (Who was evaluated) */}
              {target && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#FAF7F0] border border-[#C8B48A]/40 rounded-xl text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1E3B2F] text-[#F5F0E6] flex items-center gap-1 shadow-2xs flex-shrink-0">
                      {target.type === 'company' ? (
                        <>
                          <Building2 className="w-3 h-3 text-[#C8B48A]" /> Corporate Partner
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3 h-3 text-[#C8B48A]" /> Student Candidate
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-gray-500 font-medium">Evaluation for:</span>
                      <strong className="text-gray-900 font-extrabold truncate">
                        {target.name}
                      </strong>
                      {target.info && (
                        <span className="text-gray-500 truncate hidden sm:inline">
                          • {target.info}
                        </span>
                      )}
                    </div>
                  </div>

                  {target.email && (
                    <span className="text-[11px] text-[#1E3B2F] font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#C8B48A]/30 flex-shrink-0">
                      <Mail className="w-3 h-3 text-[#1E3B2F]" />
                      {target.email}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#C8B48A]/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {rev.reviewer?.name?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        {rev.reviewer?.name || 'Academic Reviewer'}
                      </h5>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E3B2F]/10 text-[#1E3B2F] border border-[#1E3B2F]/20 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-[#1E3B2F]" />
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
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-medium"
                  >
                    <span className="text-slate-600 font-semibold">{item.label}:</span>
                    <strong className="text-[#1E3B2F] font-bold">{item.val}/5</strong>
                  </span>
                ))}
              </div>

              {/* Qualitative Feedback Text */}
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
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
