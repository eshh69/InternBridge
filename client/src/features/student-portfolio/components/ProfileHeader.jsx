import React, { useRef } from 'react';
import { Spinner } from '../../../components/ui/Spinner';
import {
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
  ShieldCheck,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export const ProfileHeader = ({
  profile,
  user,
  strengthData,
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
    <>
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

      {/* Master 2-Column Section: Standalone 3:4 Photo on Left + Stacked Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        {/* LEFT COLUMN: Standalone 3:4 Portrait Photo Card */}
        <div className="lg:col-span-4 xl:col-span-3.5 flex flex-col">
          <div className="relative group w-full h-full min-h-[380px] aspect-[3/4] rounded-3xl border border-[#C8B48A]/45 shadow-xl overflow-hidden bg-[#13261E] flex flex-col justify-between">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#1E3B2F] via-[#1A3329] to-[#12261E] flex flex-col items-center justify-center gap-3 select-none p-4 text-center">
                <span className="font-black text-6xl text-[#C8B48A]">
                  {name?.charAt(0).toUpperCase() || 'S'}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  Portrait 3:4
                </span>
              </div>
            )}

            {/* Hover Camera Controls */}
            <div className="absolute inset-0 bg-[#12261E]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-3">
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="px-4 py-2 bg-white text-[#13261E] rounded-xl shadow-md hover:bg-[#F5F0E6] text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-4 h-4 text-[#13261E]" />
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
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Uploading indicator */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-[#12261E]/90 flex flex-col items-center justify-center text-xs text-white gap-2 font-medium">
                <Spinner size="md" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Stacked Header Details Card + Readiness & Strength Card */}
        <div className="lg:col-span-8 xl:col-span-8.5 flex flex-col justify-between gap-5">
          {/* CARD 1: Executive Profile Details Card */}
          <div className="rounded-3xl bg-[#13261E] border border-[#C8B48A]/35 shadow-xl text-[#F5F0E6] p-6 sm:p-7 relative overflow-hidden flex-1 flex flex-col justify-between space-y-4">
            {/* Ambient lighting */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#7F8C6A]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3.5 relative z-10">
              {/* Row 1: Large Name + Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {name}
                  </h1>

                  {/* Verification & Age Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-medium text-xs border border-white/15 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Verified Student
                    </span>
                    {age && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white font-medium text-xs border border-white/15 shadow-2xs">
                        {age} yrs
                      </span>
                    )}
                  </div>

                  {/* Degree */}
                  {degree && (
                    <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#C8B48A] mt-1 tracking-tight">
                      <GraduationCap className="w-5 h-5 text-[#C8B48A] shrink-0" />
                      <span>{degree}</span>
                    </div>
                  )}

                  {/* University & Metadata Line */}
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-white/80 mt-1 font-normal">
                    {university && (
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-white/60 shrink-0" />
                        <span>{university}</span>
                      </span>
                    )}
                    {academicYear && <span>• {academicYear}</span>}
                    {reputation > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-300 font-bold text-xs ml-1">
                        <Star className="w-3.5 h-3.5 fill-amber-300" />
                        {reputation.toFixed(1)}
                        {reviewCount > 0 && (
                          <span className="text-white/50 font-normal">({reviewCount})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sleek Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-start pt-1">
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#13261E] hover:bg-[#F5F0E6] font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#13261E]" />
                    <span>Edit Profile</span>
                  </button>

                  {cvUrl ? (
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-1">
                      <a
                        href={cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                        title="View Resume in new tab"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C8B48A]" />
                        <span>Resume</span>
                        <ExternalLink className="w-3 h-3 text-white/60" />
                      </a>

                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        disabled={isUploadingCv}
                        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                          className="p-1.5 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-colors cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[#C8B48A]/70 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                      title="Upload Resume (PDF, DOCX)"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#C8B48A]" />
                      <span>{isUploadingCv ? 'Uploading...' : 'Upload CV'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Editorial Bio */}
              <div className="pt-1">
                {bio ? (
                  <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-2xl font-normal">
                    {bio}
                  </p>
                ) : (
                  <p className="text-sm text-white/60 leading-relaxed max-w-2xl italic font-normal">
                    {fieldOfStudy || degree || 'Undergraduate student at South Eastern University of Sri Lanka'}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Minimalist Horizontal Contact & Social Strip */}
            {(email || phone || whatsapp || address || hasAnyLink) && (
              <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-white/85 font-normal relative z-10">
                {/* Direct Contacts */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-1.5 text-white/85 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4 text-[#C8B48A]" />
                      <span className="truncate max-w-[200px]">{email}</span>
                    </a>
                  )}
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center gap-1.5 text-white/85 hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#C8B48A]" />
                      <span>{phone}</span>
                    </a>
                  )}
                  {whatsapp && (
                    <div className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>{whatsapp}</span>
                    </div>
                  )}
                  {address && (
                    <div className="inline-flex items-center gap-1.5 text-white/80">
                      <MapPin className="w-4 h-4 text-[#7F8C6A]" />
                      <span className="truncate max-w-[220px]">{address}</span>
                    </div>
                  )}
                </div>

                {/* Social & Professional Links */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {links.github && (
                    <a
                      href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white border border-white/10 text-xs font-medium transition-colors"
                    >
                      <Github className="w-3.5 h-3.5 text-white" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {links.linkedin && (
                    <a
                      href={links.linkedin.startsWith('http') ? links.linkedin : `https://${links.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A66C2]/30 hover:bg-[#0A66C2]/45 text-white border border-[#0A66C2]/50 text-xs font-semibold transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {links.portfolio && (
                    <a
                      href={links.portfolio.startsWith('http') ? links.portfolio : `https://${links.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7F8C6A]/30 hover:bg-[#7F8C6A]/50 text-white border border-[#C8B48A]/40 text-xs font-semibold transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#C8B48A]" />
                      <span>Portfolio</span>
                    </a>
                  )}
                  {links.behance && (
                    <a
                      href={links.behance.startsWith('http') ? links.behance : `https://${links.behance}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white border border-white/10 text-xs font-medium transition-colors"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#C8B48A]" />
                      <span>Behance</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: Portfolio Readiness & Strength Card (Positioned directly below the Header Card to balance the photo height) */}
          {strengthData && (
            <div className="rounded-3xl bg-gradient-to-r from-[#F5F0E6] via-[#FAF7F0] to-[#EAE2D2] border border-[#C8B48A]/50 p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#1E3B2F] tracking-tight">
                        Portfolio Readiness & Strength
                      </h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border shadow-2xs ${strengthData.badgeStyle}`}>
                        {strengthData.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">
                      Algorithmic evaluation metric used by corporate hiring partners
                    </p>
                  </div>
                </div>

                {strengthData.tip && (
                  <div className="bg-white/90 rounded-xl px-3 py-1.5 border border-[#C8B48A]/40 text-[11px] text-gray-800 font-medium shadow-2xs shrink-0 max-w-sm">
                    {strengthData.tip}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#1E3B2F]/10 rounded-full h-2.5 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#1E3B2F] via-[#4A5D4E] to-[#7F8C6A] h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${strengthData.score}%` }}
                  />
                </div>
              </div>

              {/* 5 Granular Scoring Category Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-0.5 text-[11px] font-semibold text-gray-700">
                <div className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#C8B48A]/35 flex items-center justify-between shadow-2xs">
                  <span className="text-gray-600">Projects (3+)</span>
                  <span className="text-[#1E3B2F] font-black">{strengthData.breakdown.projects}/25</span>
                </div>
                <div className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#C8B48A]/35 flex items-center justify-between shadow-2xs">
                  <span className="text-gray-600">Faculty</span>
                  <span className="text-[#1E3B2F] font-black">{strengthData.breakdown.faculty}/20</span>
                </div>
                <div className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#C8B48A]/35 flex items-center justify-between shadow-2xs">
                  <span className="text-gray-600">Skills</span>
                  <span className="text-[#1E3B2F] font-black">{strengthData.breakdown.skills}/20</span>
                </div>
                <div className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#C8B48A]/35 flex items-center justify-between shadow-2xs">
                  <span className="text-gray-600">Academic</span>
                  <span className="text-[#1E3B2F] font-black">{strengthData.breakdown.academic}/20</span>
                </div>
                <div className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#C8B48A]/35 flex items-center justify-between shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-gray-600">Credentials</span>
                  <span className="text-[#1E3B2F] font-black">{strengthData.breakdown.credentials}/15</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
