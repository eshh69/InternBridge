import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
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
} from 'lucide-react';

const SKILL_COLOR_PALETTES = [
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
];

export const ProfileHeader = ({ profile, user, onEditClick }) => {
  const university = profile?.university || 'University not specified';
  const degree = profile?.degree || 'Degree not specified';
  const fieldOfStudy = profile?.fieldOfStudy;
  const academicYear = profile?.academicYear || '3rd Year';
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

  const email = user?.email || profile?.user?.email;
  const name = user?.name || profile?.user?.name || 'Student';

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 border border-gray-200/90 shadow-sm !p-5 sm:!p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* =========================================================================
            SECTION 1 (LEFT): Profile Picture (Exact Square)
           ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-64 lg:h-64 xl:w-72 xl:h-72 aspect-square rounded-lg overflow-hidden p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md">
            <div className="w-full h-full rounded-md overflow-hidden bg-white">
              {user?.avatarUrl || profile?.user?.avatarUrl ? (
                <img
                  src={user?.avatarUrl || profile?.user?.avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white font-black text-7xl sm:text-8xl flex items-center justify-center shadow-inner rounded-md">
                  {name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
            </div>
            <span
              className="absolute bottom-2.5 right-2.5 block w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white shadow-md"
              title="Active Student"
            />
          </div>
        </div>

        {/* =========================================================================
            SECTION 2 (MIDDLE): Name, Position, Small Description, Degree & Univ + GPA, Skills
           ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {/* 1. Name & Badges + Position placed under the name */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {name}
              </h1>
              <Badge variant="info" size="sm" className="font-semibold">
                Student
              </Badge>
              {age && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {age} yrs
                </span>
              )}
              {reputation > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{reputation.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewCount})</span>
                </div>
              )}
            </div>

            {/* Position placed under the name */}
            {fieldOfStudy && (
              <p className="text-sm font-semibold text-indigo-600 tracking-wide">
                {fieldOfStudy}
              </p>
            )}
          </div>

          {/* 2. Small Description */}
          <div className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-gray-200/70 shadow-2xs">
            {bio ? (
              <p className="line-clamp-2">{bio}</p>
            ) : (
              <p className="text-gray-400 italic">
                No description added yet. Click &quot;Edit Profile&quot; to add your bio.
              </p>
            )}
          </div>

          {/* 3. Degree and University (Left) & GPA (Right) */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 via-indigo-50/40 to-purple-50/40 border border-indigo-100">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-gray-900 truncate">{degree}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate font-medium">{university}</span>
                {academicYear && (
                  <>
                    <span className="text-indigo-300">•</span>
                    <span className="text-indigo-700 font-medium">{academicYear}</span>
                  </>
                )}
              </div>
            </div>

            {gpa !== null && gpa !== undefined && (
              <div className="shrink-0 flex flex-col items-end pl-2">
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                  GPA
                </span>
                <span className="text-base font-extrabold text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg shadow-2xs border border-emerald-200">
                  {Number(gpa).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* 4. Skills tags (without the redundant heading text) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {skills && skills.length > 0 ? (
              <>
                {skills.slice(0, 7).map((skill, idx) => (
                  <span
                    key={idx}
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border shadow-2xs ${
                      SKILL_COLOR_PALETTES[idx % SKILL_COLOR_PALETTES.length]
                    }`}
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 7 && (
                  <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">
                    +{skills.length - 7} more
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No skills listed yet</span>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3 (RIGHT): Contact Details & Other Link Cards
           ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4 border-t lg:border-t-0 lg:border-l border-gray-200/80 lg:pl-6 pt-4 lg:pt-0">
          {/* Header Row: Contact Details Title & Edit Profile Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Contact Details
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={onEditClick}
              className="gap-1.5 shadow-xs text-xs px-3 py-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          </div>

          {/* Contact Details List */}
          <div className="space-y-2 text-xs">
            {email && (
              <div className="flex items-center gap-2.5 text-gray-700">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/70 shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`mailto:${email}`}
                  className="truncate hover:text-indigo-600 font-medium transition-colors"
                >
                  {email}
                </a>
              </div>
            )}

            {phone ? (
              <div className="flex items-center gap-2.5 text-gray-700">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/70 shadow-2xs">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`tel:${phone}`}
                  className="hover:text-indigo-600 font-medium transition-colors"
                >
                  {phone}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200 shadow-2xs">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="italic">Phone not added</span>
              </div>
            )}

            {whatsapp ? (
              <div className="flex items-center gap-2.5 text-emerald-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/70 shadow-2xs">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-emerald-900">{whatsapp}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200 shadow-2xs">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="italic">WhatsApp not added</span>
              </div>
            )}

            {address && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-200/70 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">{address}</span>
              </div>
            )}
          </div>

          {/* And other link cards */}
          <div className="space-y-1.5 pt-3 border-t border-gray-150">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              And Other Link Cards
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {links.github && (
                <a
                  href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-black px-2.5 py-1 rounded-md transition-all shadow-2xs hover:shadow"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] px-2.5 py-1 rounded-md transition-all shadow-2xs hover:shadow"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 px-2.5 py-1 rounded-md transition-all shadow-2xs hover:shadow"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#053eff] hover:bg-blue-700 px-2.5 py-1 rounded-md transition-all shadow-2xs hover:shadow"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
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
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {label}
                    </a>
                  );
                })}
              {!links.github &&
                !links.linkedin &&
                !links.portfolio &&
                !links.behance &&
                !links.other &&
                (!Array.isArray(links.customLinks) ||
                  links.customLinks.filter((l) => l?.url).length === 0) && (
                  <span className="text-xs text-gray-400 italic">No external links added</span>
                )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
