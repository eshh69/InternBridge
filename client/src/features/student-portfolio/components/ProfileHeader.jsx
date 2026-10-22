import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
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
  const reputation = profile?.reputationScore || 0;
  const reviewCount = profile?.reviewCount || 0;

  const email = user?.email || profile?.user?.email;
  const name = user?.name || profile?.user?.name || 'Student';

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
        {/* Left Column: Big Profile Picture */}
        <div className="relative shrink-0 self-center md:self-start">
          {user?.avatarUrl || profile?.user?.avatarUrl ? (
            <img
              src={user?.avatarUrl || profile?.user?.avatarUrl}
              alt={name}
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-white shadow-md ring-1 ring-gray-200/70"
            />
          ) : (
            <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl bg-indigo-600 text-white font-bold text-5xl sm:text-6xl md:text-7xl flex items-center justify-center shadow-md ring-1 ring-indigo-200">
              {name?.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
          <span
            className="absolute -bottom-1 -right-1 block w-5 h-5 bg-emerald-500 rounded-full border-3 border-white shadow-xs"
            title="Active Student"
          />
        </div>

        {/* Right Column: All Profile Details */}
        <div className="flex-1 min-w-0 w-full space-y-3.5">
          {/* Top Row: Name, Badges & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{name}</h1>
              <Badge variant="info" size="sm">
                Student
              </Badge>
              {age && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200">
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

            <Button
              variant="primary"
              size="md"
              onClick={onEditClick}
              className="gap-2 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          {/* Academic & Degree Info */}
          <div className="space-y-1.5">
            <p className="text-sm sm:text-base text-gray-800 font-semibold">{degree}</p>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                {university}
              </span>
              {fieldOfStudy && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  {fieldOfStudy}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {academicYear}
              </span>
              {gpa !== null && gpa !== undefined && (
                <span className="flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  <Award className="w-3.5 h-3.5" />
                  GPA: {Number(gpa).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Bio section if present */}
          {bio && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
            </div>
          )}

          {/* Contact & Location Strip */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-600">
            {email && (
              <span className="flex items-center gap-1.5 text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <a href={`mailto:${email}`} className="hover:text-indigo-600 transition-colors">
                  {email}
                </a>
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                <a href={`tel:${phone}`} className="hover:text-indigo-600 transition-colors">
                  {phone}
                </a>
              </span>
            )}
            {whatsapp && (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-md border border-emerald-200/60 font-medium">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WA: {whatsapp}</span>
              </span>
            )}
            {address && (
              <span className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{address}</span>
              </span>
            )}
          </div>

          {/* Professional & Creative Platform Links */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
              Links:
            </span>
            {links.github && (
              <a
                href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 bg-gray-100/80 hover:bg-gray-200/80 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
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
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors"
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
                className="inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors"
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
                className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 bg-purple-50/70 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 transition-colors"
              >
                <Palette className="w-3.5 h-3.5" />
                Behance / Creative
              </a>
            )}
            {links.other && (
              <a
                href={links.other.startsWith('http') ? links.other : `https://${links.other}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Other Profile
              </a>
            )}
            {Array.isArray(links.customLinks) &&
              links.customLinks.map((item, idx) => {
                if (!item?.url) return null;
                const href = item.url.startsWith('http') ? item.url : `https://${item.url}`;
                const label = item.label?.trim() || 'Custom Link';
                return (
                  <a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors"
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
              (!Array.isArray(links.customLinks) || links.customLinks.filter((l) => l?.url).length === 0) && (
                <span className="text-xs text-gray-400 italic">
                  No external links added yet. Click &quot;Edit Profile&quot; to add.
                </span>
              )}
          </div>
        </div>
      </div>
    </Card>
  );
};
