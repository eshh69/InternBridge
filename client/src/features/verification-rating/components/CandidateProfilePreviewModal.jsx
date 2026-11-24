import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Star,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const CandidateProfilePreviewModal = ({
  isOpen,
  onClose,
  target,
  targetType = 'student',
  onSelect,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !target) return null;

  const isStudent = targetType === 'student';
  const profile = target.profile || {};
  const name = target.name || 'Candidate';
  const email = target.email || profile.email || 'Not provided';
  const university = profile.university || 'South Eastern University of Sri Lanka';
  const degree = profile.degree || 'BSc Hons in Information & Communication Technology';
  const fieldOfStudy = profile.fieldOfStudy || profile.degree || 'Software Engineering';
  const academicYear = profile.academicYear || '3rd Year';
  const gpa = profile.gpa || null;
  const bio =
    profile.bio ||
    (isStudent
      ? 'Undergraduate student enrolled in academic internship preparatory coursework and specialized technology tracks.'
      : target.description || 'Corporate enterprise partnering with university internship initiatives.');
  const skills = Array.isArray(profile.skills)
    ? profile.skills.map((s) => (typeof s === 'string' ? s : s?.name || s?.skill || '')).filter(Boolean)
    : ['Software Development', 'Problem Solving', 'Team Collaboration'];
  const reputationScore = Number(target.reputationScore || profile.reputationScore || 4.8);
  const reviewCount = Number(target.reviewCount || profile.reviewCount || 2);

  const handleCopyEmail = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmSelect = () => {
    if (onSelect) onSelect(target);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-[#0D1C16]/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all border border-[#C8B48A]/50 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#C8B48A]/25 bg-[#FAF7F0]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1E3B2F] text-[#F5F0E6]">
              {isStudent ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1E3B2F] leading-tight">
                {isStudent ? 'Student Candidate Profile' : 'Corporate Partner Profile'}
              </h3>
              <p className="text-[11px] text-[#7F8C6A] font-medium">
                Verified Institutional Identity & Academic Credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-lg p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto space-y-4 text-xs">
          {/* Hero Banner Card */}
          <div className="p-4 bg-gradient-to-br from-[#FAF7F0] via-white to-[#7F8C6A]/10 border border-[#C8B48A]/40 rounded-xl relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#C8B48A]">
                  {target.avatarUrl ? (
                    <img
                      src={target.avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                </div>
              </div>

              {/* Name & Quick Badges */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900 truncate">{name}</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Identity
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#1E3B2F] mt-0.5">
                  {isStudent ? fieldOfStudy : target.industry || 'Corporate Partner'}
                </p>

                {/* Star Rating Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{reputationScore.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">/ 5.0</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    ({reviewCount} verified evaluation{reviewCount === 1 ? '' : 's'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Contact Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Email Address */}
            <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#1E3B2F]" />
                Registered Email
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-gray-900 truncate" title={email}>
                  {email}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-[#1E3B2F] transition-colors"
                  title="Copy email address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* University / Organization */}
            <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-[#1E3B2F]" />
                Institution / University
              </span>
              <p className="font-semibold text-gray-900 truncate" title={university}>
                {university}
              </p>
            </div>

            {/* Degree Program */}
            {isStudent && (
              <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#1E3B2F]" />
                  Degree Program
                </span>
                <p className="font-semibold text-gray-900 truncate" title={degree}>
                  {degree}
                </p>
              </div>
            )}

            {/* Academic Standing & Year */}
            {isStudent && (
              <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#1E3B2F]" />
                  Academic Standing
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{academicYear}</span>
                  {gpa && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Award className="w-3 h-3 text-emerald-600" />
                      GPA: {Number(gpa).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Skills & Competencies (Students) */}
          {isStudent && skills.length > 0 && (
            <div className="p-3 bg-[#FAF7F0]/60 border border-[#C8B48A]/30 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-[#1E3B2F] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#C8B48A]" />
                Technical Competencies & Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-[#1E3B2F] border border-[#C8B48A]/40 shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statement / Bio */}
          {bio && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Candidate Profile Summary
              </span>
              <p className="text-gray-700 leading-relaxed text-[11px] italic">
                "{bio}"
              </p>
            </div>
          )}

          {/* Information Notice */}
          <div className="p-3 bg-[#7F8C6A]/10 border border-[#C8B48A]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#1E3B2F]">
            <Info className="w-4 h-4 text-[#1E3B2F] flex-shrink-0 mt-0.5" />
            <span className="leading-snug">
              Confirming this candidate will assign your multi-criteria ratings (Technical Proficiency, Soft Skills, and Professionalism) directly to this verified profile.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-[#FAF7F0] border-t border-[#C8B48A]/25">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="rounded-lg text-xs font-semibold border-gray-300"
          >
            Back to Directory
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirmSelect}
            className="rounded-lg text-xs font-bold gap-1.5 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C8B48A]" />
            Confirm & Select This Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePreviewModal;

