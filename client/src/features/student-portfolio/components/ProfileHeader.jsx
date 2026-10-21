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
} from 'lucide-react';

export const ProfileHeader = ({ profile, user, onEditClick }) => {
  const university = profile?.university || 'University not specified';
  const degree = profile?.degree || 'Degree not specified';
  const fieldOfStudy = profile?.fieldOfStudy;
  const academicYear = profile?.academicYear || '3rd Year';
  const gpa = profile?.gpa;
  const bio = profile?.bio;
  const links = profile?.links || {};
  const reputation = profile?.reputationScore || 0;
  const reviewCount = profile?.reviewCount || 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar / Initials */}
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 block w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Active Student" />
          </div>

          {/* Core Info */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <Badge variant="info" size="sm">
                Student
              </Badge>
              {reputation > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{reputation.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewCount})</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium">{degree}</p>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                {university}
              </span>
              {fieldOfStudy && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  {fieldOfStudy}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {academicYear}
              </span>
              {gpa !== null && gpa !== undefined && (
                <span className="flex items-center gap-1 font-semibold text-indigo-600">
                  <Award className="w-3.5 h-3.5" />
                  GPA: {Number(gpa).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button variant="primary" size="md" onClick={onEditClick} className="gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Bio section if present */}
      {bio && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
        </div>
      )}

      {/* External Links */}
      <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Connect:</span>
        {links.github && (
          <a
            href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 transition-colors"
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
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 bg-blue-50/60 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors"
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
            className="inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50/60 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            Portfolio
          </a>
        )}
        {!links.github && !links.linkedin && !links.portfolio && (
          <span className="text-xs text-gray-400 italic">No external links added yet. Click &quot;Edit Profile&quot; to add.</span>
        )}
      </div>
    </Card>
  );
};
