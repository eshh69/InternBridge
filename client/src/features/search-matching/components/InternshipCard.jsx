import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Users,
  Check,
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
    requiredSkills = [],
    matchScore,
    matchedSkills = [],
    missingSkills = [],
  } = internship;

  // Format deadline date
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
        <Badge variant="success" size="md" className="gap-1 font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {matchScore}% Match
        </Badge>
      );
    }
    if (matchScore >= 50) {
      return (
        <Badge variant="purple" size="md" className="gap-1 font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          {matchScore}% Match
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="md" className="gap-1">
        {matchScore}% Match
      </Badge>
    );
  };

  // Location type color
  const getLocationTypeBadge = () => {
    switch (locationType) {
      case 'Remote':
        return <Badge variant="success" size="sm">Remote</Badge>;
      case 'Hybrid':
        return <Badge variant="info" size="sm">Hybrid</Badge>;
      default:
        return <Badge variant="neutral" size="sm">On-site</Badge>;
    }
  };

  // Normalized set of student's matched skills for easy lookup
  const matchedSet = new Set(
    (matchedSkills || []).map((s) => s.toLowerCase().trim())
  );

  return (
    <Card className="hover:border-indigo-300 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Company & Title info */}
        <div className="flex items-start gap-3.5">
          {/* Company Logo or Monogram */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/60 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-lg overflow-hidden shadow-xs">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company?.name || 'Company Logo'}
                className="w-full h-full object-cover"
              />
            ) : (
              (company?.name?.charAt(0) || 'C').toUpperCase()
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                onClick={() => onViewDetails(internship)}
                className="text-lg font-bold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors"
              >
                {title}
              </h3>
              {getLocationTypeBadge()}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span className="font-medium text-gray-800 flex items-center gap-1">
                {company?.name || 'Company Partner'}
                {company?.verificationStatus === 'verified' && (
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-500 fill-emerald-50 inline"
                    title="Verified Company"
                  />
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {location}
              </span>
            </div>

            {area && (
              <p className="text-xs text-indigo-600 font-medium mt-1">
                {area}
              </p>
            )}
          </div>
        </div>

        {/* Right: Match Pill & Key Meta */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
          {getMatchPill()}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Due {formattedDeadline}
          </span>
        </div>
      </div>

      {/* Required Skills Tags */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1 font-medium">Skills:</span>
          {requiredSkills.slice(0, 7).map((skill, idx) => {
            const isMatched = matchedSet.has(skill.toLowerCase().trim());
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                  isMatched
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
                title={isMatched ? 'Matches your portfolio skill' : 'Skill requirement'}
              >
                {isMatched && <Check className="w-3 h-3 text-emerald-600" />}
                {skill}
              </span>
            );
          })}
          {requiredSkills.length > 7 && (
            <span className="text-xs text-gray-400 font-medium">
              +{requiredSkills.length - 7} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {/* Meta badges: Stipend & Duration */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            {stipend?.isPaid
              ? `${stipend?.currency || 'LKR'} ${Number(stipend?.amount || 0).toLocaleString()} / mo`
              : 'Unpaid / Experience'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {durationMonths} Months
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            {openPositions} {openPositions === 1 ? 'opening' : 'openings'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails(internship)}
          >
            Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApply(internship)}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InternshipCard;
