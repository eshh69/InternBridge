import React, { useRef } from 'react';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
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
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Download,
  Calendar,
  Sparkles,
  Award,
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

      {/* ==================================================================
          STUDENT EXECUTIVE HERO BANNER (MATCHES COMPANY DASHBOARD THEME)
          ================================================================== */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg border border-[#7F8C6A]/30 w-full"
        style={{
          background: 'linear-gradient(135deg, #1E3B2F 0%, #183026 55%, #152A22 100%)',
        }}
      >
        {/* Decorative background glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#C8B48A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-[#7F8C6A]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Architectural pure CSS rings graphic */}
        <div className="absolute right-0 top-0 h-full w-64 sm:w-80 pointer-events-none hidden sm:flex items-center justify-end pr-6 opacity-20">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full border-2 border-white/30" />
            <div className="absolute inset-4 rounded-full border-2 border-white/25" />
            <div className="absolute inset-8 rounded-full border-2 border-white/20" />
            <div className="absolute inset-12 rounded-full bg-white/10" />
            <GraduationCap className="absolute inset-0 m-auto w-12 h-12 text-white/40" />
          </div>
        </div>

        {/* Banner Content */}
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center gap-6">
            {/* Avatar / Photo with Hover Camera Controls */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-white/10 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-white text-3xl sm:text-4xl font-extrabold select-none">
                    {name?.charAt(0).toUpperCase() || 'S'}
                  </span>
                )}
              </div>

              {/* Hover Camera Controls */}
              <div className="absolute inset-0 bg-[#12261E]/75 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="p-1.5 bg-white text-[#13261E] rounded-lg shadow-sm hover:bg-[#F5F0E6] transition-transform hover:scale-105 cursor-pointer"
                  title="Change photo"
                >
                  {isUploadingAvatar ? (
                    <Spinner size="xs" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-[#13261E]" />
                  )}
                </button>
                {avatarUrl && onDeleteAvatar && (
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={onDeleteAvatar}
                    className="p-1.5 bg-red-600/90 text-white rounded-lg shadow-sm hover:bg-red-700 transition-transform hover:scale-105 cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Student Main Details */}
            <div className="flex-1 space-y-2">
              {/* Name & Status Badges Row */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified Student
                </span>
                {age && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-white/10 text-slate-200 border border-white/20 rounded-full text-[11px] font-medium">
                    {age} yrs
                  </span>
                )}
                {strengthData?.tier && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C8B48A]/25 text-[#F5F0E6] border border-[#C8B48A]/40 rounded-full text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3 text-[#C8B48A]" /> {strengthData.tier} Tier
                  </span>
                )}
              </div>

              {/* Bio summary */}
              <p className="text-[#F5F0E6]/85 text-xs sm:text-sm leading-relaxed max-w-2xl line-clamp-2">
                {bio ||
                  'Undergraduate pursuing technical excellence through verified coursework, projects, and active career preparation.'}
              </p>

              {/* Academic & Meta row */}
              <div className="flex items-center gap-3.5 sm:gap-4 text-xs text-[#F5F0E6]/80 flex-wrap pt-0.5">
                {university && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#C8B48A]" />
                    <span className="font-medium text-white/95">{university}</span>
                  </span>
                )}
                {degree && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C8B48A]" />
                    <span>{degree}</span>
                  </span>
                )}
                {academicYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C8B48A]" />
                    <span>{academicYear}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <strong className="text-white font-bold">
                    {gpa ? `GPA ${gpa}` : 'GPA 4.00'}
                  </strong>
                  <span className="opacity-80">({reviewCount} reviews)</span>
                </span>
                {address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C8B48A]" />
                    <span>{address}</span>
                  </span>
                )}
              </div>

              {/* Contact & Social Links Pill Strip */}
              <div className="flex items-center gap-2 flex-wrap pt-1.5">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F5F0E6] rounded-lg text-[11px] font-medium border border-white/15 transition-colors"
                  >
                    <Mail className="w-3 h-3 text-[#C8B48A]" /> {email}
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F5F0E6] rounded-lg text-[11px] font-medium border border-white/15 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#C8B48A]" /> {phone}
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-lg text-[11px] font-medium border border-emerald-400/30 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-300" /> WhatsApp
                  </a>
                )}
                {links.github && (
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F5F0E6] rounded-lg text-[11px] font-medium border border-white/15 transition-colors"
                  >
                    <Github className="w-3 h-3" /> GitHub
                  </a>
                )}
                {links.linkedin && (
                  <a
                    href={links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 rounded-lg text-[11px] font-medium border border-sky-400/30 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </a>
                )}
                {links.portfolio && (
                  <a
                    href={links.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F5F0E6] rounded-lg text-[11px] font-medium border border-white/15 transition-colors"
                  >
                    <Globe className="w-3 h-3 text-[#C8B48A]" /> Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons on Right (White + Outline-White) */}
            <div className="flex flex-wrap sm:flex-col lg:flex-row gap-2.5 shrink-0 pt-2 sm:pt-0">
              <Button
                onClick={onEditClick}
                variant="white"
                size="md"
                className="gap-2 font-semibold shadow-md whitespace-nowrap"
              >
                <Edit3 className="w-4 h-4 text-[#1E3B2F]" />
                Edit Profile
              </Button>

              {cvUrl ? (
                <div className="flex items-center gap-1.5">
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-transparent hover:bg-white/15 active:bg-white/20 text-[#F5F0E6] border border-[#C8B48A]/50 rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-[#C8B48A]" />
                    <span>View CV</span>
                  </a>
                  <button
                    type="button"
                    disabled={isUploadingCv}
                    onClick={() => cvInputRef.current?.click()}
                    className="p-2 bg-white/10 hover:bg-white/20 text-[#F5F0E6] border border-white/20 rounded-xl transition-colors"
                    title="Replace CV"
                  >
                    <UploadCloud className="w-4 h-4 text-[#C8B48A]" />
                  </button>
                  {onDeleteCv && (
                    <button
                      type="button"
                      disabled={isDeletingCv}
                      onClick={onDeleteCv}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-xl transition-colors"
                      title="Delete CV"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => cvInputRef.current?.click()}
                  variant="outline-white"
                  size="md"
                  disabled={isUploadingCv}
                  className="gap-2 font-medium whitespace-nowrap"
                >
                  <UploadCloud className="w-4 h-4 text-[#C8B48A]" />
                  <span>{isUploadingCv ? 'Uploading...' : 'Upload Resume (CV)'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
