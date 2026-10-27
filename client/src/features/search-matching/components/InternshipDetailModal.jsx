import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Sparkles,
  MapPin,
  Clock,
  Banknote,
  Calendar,
  Building2,
  CheckCircle2,
  Check,
  AlertCircle,
  Briefcase,
  Users,
} from 'lucide-react';

export const InternshipDetailModal = ({
  isOpen,
  onClose,
  internship,
  onApply,
  isStudent = false,
}) => {
  if (!internship) return null;

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
    qualifications = [],
    requiredSkills = [],
    matchScore,
    matchedSkills = [],
    missingSkills = [],
    matchBreakdown,
  } = internship;

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Open';

  const matchedSet = new Set(
    (matchedSkills || []).map((s) => s.toLowerCase().trim())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Internship Opportunity Overview"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onApply(internship);
            }}
          >
            Apply for this Internship
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/60 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-xl overflow-hidden shadow-xs">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                (company?.name?.charAt(0) || 'C').toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  {company?.name || 'Company Partner'}
                  {company?.verificationStatus === 'verified' && (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-500 fill-emerald-50"
                      title="Verified Company"
                    />
                  )}
                </span>
                <span>•</span>
                <span className="text-xs text-indigo-600 font-medium">{area}</span>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          {matchScore !== undefined && matchScore !== null && (
            <div className="text-right">
              <Badge
                variant={matchScore >= 80 ? 'success' : matchScore >= 50 ? 'purple' : 'neutral'}
                size="lg"
                className="gap-1 font-bold shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                {matchScore}% Match
              </Badge>
              <p className="text-[11px] text-gray-500 mt-1">Based on your portfolio</p>
            </div>
          )}
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              Location
            </span>
            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {location} ({locationType})
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              Stipend
            </span>
            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
              {stipend?.isPaid
                ? `${stipend?.currency || 'LKR'} ${Number(stipend?.amount || 0).toLocaleString()}`
                : 'Unpaid'}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              Duration
            </span>
            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {durationMonths} Months
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              Deadline
            </span>
            <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              {formattedDeadline}
            </p>
          </div>
        </div>

        {/* Skill Gap Analysis (for student) */}
        {isStudent && matchScore !== undefined && (
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Skills Fit & Gap Breakdown
              </h4>
              <span className="text-xs font-semibold text-indigo-700">
                {matchedSkills.length} of {requiredSkills.length} skills matched
              </span>
            </div>

            {/* Matched Skills */}
            {matchedSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                  Skills you possess:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300"
                    >
                      <Check className="w-3 h-3 text-emerald-700" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {missingSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-amber-800 block mb-1">
                  Recommended skills to learn / add to portfolio:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-600" /> Role Description
          </h4>
          <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {description}
          </p>
        </div>

        {/* Qualifications */}
        {qualifications && qualifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900">
              Qualifications & Requirements
            </h4>
            <ul className="space-y-1.5">
              {qualifications.map((q, idx) => (
                <li
                  key={idx}
                  className="text-xs text-gray-600 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Company About */}
        {company?.description && (
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-500" /> About {company.name}
            </h4>
            <p className="text-xs text-gray-500 line-clamp-3">
              {company.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default InternshipDetailModal;
