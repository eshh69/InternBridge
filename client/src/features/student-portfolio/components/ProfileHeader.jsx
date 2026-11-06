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
} from 'lucide-react';

const SKILL_COLOR_PALETTES = [
  'bg-indigo-50 text-indigo-700',
  'bg-purple-50 text-purple-700',
  'bg-blue-50 text-blue-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-800',
  'bg-rose-50 text-rose-700',
  'bg-cyan-50 text-cyan-700',
];

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
  const skills = profile?.skills || [];
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
    <div className="relative py-2 sm:py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* =========================================================================
            SECTION 1 (LEFT): Normal Profile Picture (Vertical Rectangle aspect-[3/4])
           ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col items-center sm:items-start">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
            className="hidden"
            onChange={handleAvatarFileChange}
          />

          <div className="relative group w-52 sm:w-[250px] aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200/90 bg-slate-100 shadow-xs">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 text-slate-600 font-extrabold text-6xl flex items-center justify-center rounded-2xl select-none">
                {name?.charAt(0).toUpperCase() || 'S'}
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-xl shadow-xs hover:bg-slate-100 flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                {isUploadingAvatar ? 'Saving...' : 'Change Photo'}
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
                  className="px-3 py-1 bg-rose-600 text-white text-[11px] font-medium rounded-xl shadow-xs hover:bg-rose-700 flex items-center gap-1 transition-transform hover:scale-105"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            {/* Uploading Loader */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold text-blue-600">
                <Spinner size="md" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2 (RIGHT): Name, Degree, Bio, Contact Information (ABOVE Skills), Skills
           ========================================================================= */}
        <div className="lg:col-span-9 flex flex-col justify-center space-y-3.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  {name}
                </h1>
                {age && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold tracking-normal border border-gray-200/80">
                    {age} yrs
                  </span>
                )}
                {reputation > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/80">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{reputation.toFixed(1)}</span>
                    {reviewCount > 0 && <span className="text-slate-400">({reviewCount})</span>}
                  </div>
                )}
              </div>

              {/* Minimal Edit Profile Button */}
              <button
                type="button"
                onClick={onEditClick}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none shrink-0"
                title="Edit Profile"
                aria-label="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {fieldOfStudy && (
              <p className="text-xs sm:text-sm font-semibold text-blue-600">
                {fieldOfStudy}
              </p>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-3xl">
              {bio}
            </p>
          )}

          {/* Degree & University & Resume (In place of isolated GPA) */}
          {(degree || university || cvUrl || onUploadCv) && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <div className="min-w-0 space-y-0.5">
                {degree && <p className="text-sm font-bold text-gray-900 truncate">{degree}</p>}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {university && <span className="truncate">{university}</span>}
                  {academicYear && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-blue-600 font-medium">{academicYear}</span>
                    </>
                  )}
                  {gpa !== null && gpa !== undefined && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-emerald-600 font-bold">GPA {Number(gpa).toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Resume Widget (replaces isolated GPA on the right) */}
              <div className="shrink-0 flex items-center gap-1.5">
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvFileChange}
                  className="hidden"
                />

                {cvUrl ? (
                  <div className="flex items-center gap-1.5 bg-gray-50/90 border border-gray-200/90 rounded-xl p-1 shadow-2xs">
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-102"
                      title="View Resume in new tab"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Resume</span>
                      <ExternalLink className="w-3 h-3 text-blue-100" />
                    </a>

                    <button
                      type="button"
                      onClick={() => cvInputRef.current?.click()}
                      disabled={isUploadingCv}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Replace Resume document"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isUploadingCv ? 'animate-spin text-blue-600' : ''}`}
                      />
                    </button>

                    {onDeleteCv && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Remove your resume?')) {
                            onDeleteCv();
                          }
                        }}
                        disabled={isDeletingCv}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 font-semibold text-xs transition-all shadow-2xs"
                    title="Upload Resume (PDF, DOCX)"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isUploadingCv ? 'Uploading...' : 'Upload Resume'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              CONTACT INFORMATION & SOCIAL LINKS (SHOWN DIRECTLY ABOVE SKILL CARDS)
             ========================================================================= */}
          {(email || phone || whatsapp || address || hasAnyLink) && (
            <div className="pt-2.5 pb-1 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              {email && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <a href={`mailto:${email}`} className="truncate hover:text-blue-600 font-medium">
                    {email}
                  </a>
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-blue-600 font-medium">
                    {phone}
                  </a>
                </div>
              )}

              {whatsapp && (
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-semibold">{whatsapp}</span>
                </div>
              )}

              {address && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
              )}

              {/* Social Links */}
              {links.github && (
                <a
                  href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full border border-gray-200/80 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {links.linkedin && (
                <a
                  href={links.linkedin.startsWith('http') ? links.linkedin : `https://${links.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200/80 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
              {links.portfolio && (
                <a
                  href={links.portfolio.startsWith('http') ? links.portfolio : `https://${links.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200/80 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Portfolio
                </a>
              )}
              {links.behance && (
                <a
                  href={links.behance.startsWith('http') ? links.behance : `https://${links.behance}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200/80 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Behance
                </a>
              )}
              {links.other && (
                <a
                  href={links.other.startsWith('http') ? links.other : `https://${links.other}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-full border border-gray-200/80"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
              {Array.isArray(links.customLinks) &&
                links.customLinks.map((item, idx) => {
                  if (!item?.url) return null;
                  const href = item.url.startsWith('http') ? item.url : `https://${item.url}`;
                  const label = item.label?.trim() || 'Link';
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {label}
                    </a>
                  );
                })}
            </div>
          )}

          {/* Quick Skill Tags Preview (Directly UNDER Contact Information) */}
          {skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {skills.slice(0, 8).map((skill, index) => {
                const skillName = typeof skill === 'string' ? skill : skill?.name || '';
                return (
                  <span
                    key={skillName || index}
                    className="text-xs font-medium px-3 py-1 rounded-full capitalize bg-gray-100 text-gray-700 border border-gray-200/80 hover:bg-gray-200 transition-colors"
                  >
                    {skillName}
                  </span>
                );
              })}
              {skills.length > 8 && (
                <span className="text-xs font-semibold text-gray-400 px-1.5">
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
