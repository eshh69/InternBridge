import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import {
  Sparkles,
  MapPin,
  Clock,
  Banknote,
  Calendar,
  Building2,
  CheckCircle2,
  Users,
  Check,
  ArrowRight,
  Bookmark,
  Briefcase,
} from 'lucide-react';

export const InternshipCard = ({
  internship,
  onViewDetails,
  onApply,
  isStudent = false,
}) => {
  const {
    title,
    company,
    area,
    location,
    locationType,
    durationMonths,
    stipend,
    openPositions = 1,
    deadline,
    description,
    requiredSkills = [],
    matchScore,
    matchedSkills = [],
    missingSkills = [],
  } = internship;

  // Format deadline date (e.g. "Dec 30, 2024")
  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Open';

  // Compute match pill properties
  const getMatchPill = () => {
    if (matchScore === undefined || matchScore === null) return null;

    if (matchScore >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          {matchScore}% Match
        </span>
      );
    }
    if (matchScore >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
          <Sparkles className="w-3 h-3 text-blue-600" />
          {matchScore}% Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        {matchScore}% Match
      </span>
    );
  };

  // Location / Workplace badge
  const getLocationTypeBadge = () => {
    switch (locationType) {
      case 'Remote':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Remote
          </span>
        );
      case 'Hybrid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Hybrid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            On-site
          </span>
        );
    }
  };

  const matchedSet = new Set(
    (matchedSkills || []).map((s) => s.toLowerCase().trim())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Left: Clean Monogram / Logo Box */}
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xl flex items-center justify-center flex-shrink-0 border border-slate-200/80 shadow-xs overflow-hidden select-none">
          {company?.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company?.name || 'Company'}
              className="w-full h-full object-cover"
            />
          ) : (
            (company?.name?.charAt(0) || 'C').toUpperCase()
          )}
        </div>

        {/* Right: Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Row 1: Title, Badges, and Top-Right Deadline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                onClick={() => onViewDetails(internship)}
                className="text-base font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
              >
                {title}
              </h3>
              {getLocationTypeBadge()}
              {getMatchPill()}
            </div>

            {/* Top-Right Calendar Deadline */}
            <span className="text-xs text-gray-400 flex items-center gap-1.5 flex-shrink-0 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formattedDeadline}
            </span>
          </div>

          {/* Row 2: Subtitle: Company • Location • Area */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {company?.name || 'Company Partner'}
              {company?.verificationStatus === 'verified' && (
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 inline"
                  title="Verified Company"
                />
              )}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {location}
            </span>
            {area && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  {area}
                </span>
              </>
            )}
          </div>

          {/* Row 3: Description Snippet (1-2 lines) */}
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Row 4: Skill Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {requiredSkills.slice(0, 6).map((skill, idx) => {
              const isMatched = matchedSet.has(skill.toLowerCase().trim());
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gray-100/90 text-gray-700 border-gray-200/80 hover:bg-gray-200/70'
                  }`}
                  title={isMatched ? 'Matches your portfolio skill' : 'Required skill'}
                >
                  {isMatched && <Check className="w-3 h-3 text-emerald-600" />}
                  {skill}
                </span>
              );
            })}
            {requiredSkills.length > 6 && (
              <span className="text-xs text-gray-400 font-medium px-2 py-0.5">
                +{requiredSkills.length - 6}
              </span>
            )}
          </div>

          {/* Row 5: Bottom Footer Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {/* Left Meta: Stipend, Duration, Openings */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1 font-semibold text-gray-800">
                <Banknote className="w-3.5 h-3.5 text-gray-500" />
                {stipend?.isPaid
                  ? `${stipend?.currency || 'LKR'} ${Number(stipend?.amount || 0).toLocaleString()} / mo`
                  : 'Unpaid'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {durationMonths} Months
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                {openPositions} {openPositions === 1 ? 'Opening' : 'Openings'}
              </span>
            </div>

            {/* Right Actions: Save/Details + Apply Now */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => onViewDetails(internship)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5 text-gray-500" />
                Save
              </button>
              <button
                type="button"
                onClick={() => onApply(internship)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Apply Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;
