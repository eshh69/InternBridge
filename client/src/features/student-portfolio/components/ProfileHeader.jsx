import React, { useRef } from 'react';
import { Spinner } from '../../../components/ui/Spinner';
import {
  GraduationCap,
  Star,
  Github,
  Linkedin,
  Globe,
  Edit3,
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  Palette,
  ExternalLink,
  Camera,
  Trash2,
  FileText,
  UploadCloud,
  RefreshCw,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

export const ProfileHeader = ({
  profile,
  user,
  onEditClick,
  onUploadAvatar,
  onDeleteAvatar,
  isUploadingAvatar,
  cvUrl: propCvUrl,
  onUploadCv,
  onDeleteCv,
  isUploadingCv,
  isDeletingCv,
}) => {
  const avatarInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const university = profile?.university;
  const degree = profile?.degree;
  const fieldOfStudy = profile?.fieldOfStudy;
  const academicYear = profile?.academicYear;
  const gpa = profile?.gpa;
  const bio = profile?.bio;
  const phone = profile?.phone;
  const whatsapp = profile?.whatsapp;
  const address = profile?.address;
  const age = profile?.age;
  const links = profile?.links || {};
  const reputation = profile?.reputationScore || 0;
  const reviewCount = profile?.reviewCount || 0;
  const cvUrl = propCvUrl !== undefined ? propCvUrl : profile?.cvUrl;

  const email = user?.email || profile?.user?.email;
  const name = user?.name || profile?.user?.name || 'Student';
  const avatarUrl = user?.avatarUrl || profile?.user?.avatarUrl;

  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onUploadAvatar) {
        onUploadAvatar(file);
      }
      e.target.value = '';
    }
  };

  const handleCvFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onUploadCv) {
        onUploadCv(file);
      }
      e.target.value = '';
    }
  };

  const hasAnyLink =
    links.github ||
    links.linkedin ||
    links.portfolio ||
    links.behance ||
    links.other ||
    (Array.isArray(links.customLinks) && links.customLinks.some((l) => l?.url));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3B2F] via-[#1A3329] to-[#12261E] border border-[#C8B48A]/40 shadow-lg text-[#F5F0E6]">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#7F8C6A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-[#C8B48A]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Architectural illustration — concentric rings matching executive dashboard */}
      <div className="absolute right-0 top-0 h-full w-64 sm:w-80 pointer-events-none hidden sm:flex items-center justify-end pr-6 opacity-20">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 rounded-full border-2 border-[#C8B48A]/40" />
          <div className="absolute inset-4 rounded-full border-2 border-[#C8B48A]/30" />
          <div className="absolute inset-8 rounded-full border-2 border-[#C8B48A]/20" />
          <div className="absolute inset-12 rounded-full bg-[#C8B48A]/10" />
          <GraduationCap className="absolute inset-0 m-auto w-12 h-12 text-[#F5F0E6]" />
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
        className="hidden"
        onChange={handleAvatarFileChange}
      />
      <input
        ref={cvInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleCvFileChange}
        className="hidden"
      />

      <div className="relative z-10 p-6 sm:p-8 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Avatar & Profile Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 flex-1 min-w-0">
            {/* Avatar Container with hover camera action */}
            <div className="relative group w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl flex-shrink-0 border-2 sm:border-3 border-[#C8B48A]/60 shadow-xl overflow-hidden bg-white/10 backdrop-blur-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                />
              ) : (
                <div className="w-full h-full bg-[#1E3B2F] text-[#F5F0E6] font-black text-3xl sm:text-5xl flex items-center justify-center select-none">
                  {name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[#12261E]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#F5F0E6] text-[#1E3B2F] rounded-xl shadow-xs hover:bg-white text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4 text-[#1E3B2F]" />
                  <span>{isUploadingAvatar ? 'Saving...' : 'Change Photo'}</span>
                </button>

                {avatarUrl && onDeleteAvatar && (
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Remove profile photo?')) {
                        onDeleteAvatar();
                      }
                    }}
                    className="px-2.5 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Uploading indicator */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-[#12261E]/90 flex flex-col items-center justify-center text-xs text-[#F5F0E6] gap-1.5 font-medium">
                  <Spinner size="md" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* Name, Verified Badge, and Bio */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F5F0E6] tracking-tight truncate">
                  {name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#7F8C6A]/25 text-[#F5F0E6] border border-[#C8B48A]/40 rounded-full text-[11px] font-semibold">
                  <CheckCircle className="w-3 h-3 text-[#C8B48A]" />
                  Verified Student
                </span>
                {age && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-[#F5F0E6]/80 font-medium border border-white/15">
                    {age} yrs
                  </span>
                )}
              </div>

              {/* Bio description */}
              {bio ? (
                <p className="text-xs sm:text-sm text-[#F5F0E6]/80 leading-relaxed max-w-2xl line-clamp-2">
                  {bio}
                </p>
              ) : (
                <p className="text-xs text-[#F5F0E6]/60 leading-relaxed max-w-xl">
                  {fieldOfStudy || degree || 'Undergraduate student at South Eastern University of Sri Lanka'}
                </p>
              )}

              {/* Key metadata line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#F5F0E6]/75 pt-1">
                {degree && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-[#C8B48A]" />
                    <span className="truncate max-w-[280px]">{degree}</span>
                  </span>
                )}
                {university && (
                  <span className="flex items-center gap-1.5 text-[#F5F0E6]/65">
                    <BookOpen className="w-3.5 h-3.5 text-[#7F8C6A]" />
                    <span className="truncate max-w-[240px]">{university}</span>
                  </span>
                )}
                {academicYear && (
                  <span className="flex items-center gap-1 font-semibold text-[#C8B48A]">
                    • {academicYear}
                  </span>
                )}
                {gpa !== null && gpa !== undefined && (
                  <span className="flex items-center gap-1 font-bold text-[#F5F0E6] bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                    GPA {Number(gpa).toFixed(2)}
                  </span>
                )}
                {reputation > 0 && (
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    {reputation.toFixed(1)}
                    {reviewCount > 0 && <span className="text-white/60 font-normal">({reviewCount})</span>}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Resume Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-start sm:self-center">
            {/* Primary Action Button: Edit Profile */}
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F0E6] hover:bg-white text-[#1E3B2F] font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1E3B2F]" />
              <span>Edit Profile</span>
            </button>

            {/* Secondary Action Button: Resume Download / Upload */}
            {cvUrl ? (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-[#C8B48A]/40 rounded-xl p-1">
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8B48A]/25 hover:bg-[#C8B48A]/40 text-[#F5F0E6] font-semibold text-xs transition-colors"
                  title="View Resume in new tab"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C8B48A]" />
                  <span>Resume</span>
                  <ExternalLink className="w-3 h-3 text-[#F5F0E6]/70" />
                </a>

                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={isUploadingCv}
                  className="p-1.5 rounded-lg text-[#F5F0E6]/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Replace Resume document"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isUploadingCv ? 'animate-spin text-[#C8B48A]' : ''}`}
                  />
                </button>

                {onDeleteCv && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Remove your resume document?')) {
                        onDeleteCv();
                      }
                    }}
                    disabled={isDeletingCv}
                    className="p-1.5 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => cvInputRef.current?.click()}
                disabled={isUploadingCv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[#C8B48A]/80 bg-white/10 hover:bg-white/20 text-[#F5F0E6] font-semibold text-xs transition-all shadow-xs"
                title="Upload Resume (PDF, DOCX)"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#C8B48A]" />
                <span>{isUploadingCv ? 'Uploading...' : 'Upload CV'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Contact & Social Links Bar */}
        {(email || phone || whatsapp || address || hasAnyLink) && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F5F0E6]/80">
            {/* Direct Contacts */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 text-[#F5F0E6]/80 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C8B48A]" />
                  <span className="truncate max-w-[200px]">{email}</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 text-[#F5F0E6]/80 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C8B48A]" />
                  <span>{phone}</span>
                </a>
              )}
              {whatsapp && (
                <div className="inline-flex items-center gap-1.5 text-emerald-300">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{whatsapp}</span>
                </div>
              )}
              {address && (
                <div className="inline-flex items-center gap-1.5 text-[#F5F0E6]/70">
                  <MapPin className="w-3.5 h-3.5 text-[#7F8C6A]" />
                  <span className="truncate max-w-[180px]">{address}</span>
                </div>
              )}
            </div>

            {/* Social & Professional Links */}
            <div className="flex flex-wrap items-center gap-2">
              {links.github && (
                <a
                  href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5F0E6] border border-white/15 text-[11px] font-medium transition-colors"
                >
                  <Github className="w-3 h-3 text-white" />
                  <span>GitHub</span>
                </a>
              )}
              {links.linkedin && (
                <a
                  href={links.linkedin.startsWith('http') ? links.linkedin : `https://${links.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A66C2]/30 hover:bg-[#0A66C2]/45 text-white border border-[#0A66C2]/50 text-[11px] font-semibold transition-colors"
                >
                  <Linkedin className="w-3 h-3 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {links.portfolio && (
                <a
                  href={links.portfolio.startsWith('http') ? links.portfolio : `https://${links.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7F8C6A]/30 hover:bg-[#7F8C6A]/50 text-[#F5F0E6] border border-[#C8B48A]/40 text-[11px] font-semibold transition-colors"
                >
                  <Globe className="w-3 h-3 text-[#C8B48A]" />
                  <span>Portfolio</span>
                </a>
              )}
              {links.behance && (
                <a
                  href={links.behance.startsWith('http') ? links.behance : `https://${links.behance}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-[11px] font-medium transition-colors"
                >
                  <Palette className="w-3 h-3 text-[#C8B48A]" />
                  <span>Behance</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
