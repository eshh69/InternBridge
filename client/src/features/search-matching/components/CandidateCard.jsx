import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  GraduationCap,
  Star,
  Award,
  Sparkles,
  Mail,
  User,
  MessageSquare,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CandidateCard = ({ candidate, queriedSkills = [] }) => {
  const navigate = useNavigate();

  const {
    user,
    university,
    degree,
    fieldOfStudy,
    academicYear,
    gpa,
    skills = [],
    reputationScore = 0,
    reviewCount = 0,
    matchScore,
    matchedSkills = [],
  } = candidate;

  const matchedSet = new Set(
    (matchedSkills || []).map((s) => s.toLowerCase().trim())
  );

  return (
    <Card className="hover:border-indigo-300 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Avatar & Candidate Info */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name || 'Student'}
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.name?.charAt(0) || 'S').toUpperCase()
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                {user?.name || 'Student Candidate'}
              </h3>
              {academicYear && (
                <Badge variant="neutral" size="sm">
                  {academicYear}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-700 font-medium mt-0.5">
              {degree} {fieldOfStudy ? `• ${fieldOfStudy}` : ''}
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                {university}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Match Score & Rating */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
          {matchScore !== undefined && matchScore !== null && (
            <Badge
              variant={matchScore >= 80 ? 'success' : matchScore >= 50 ? 'purple' : 'neutral'}
              size="md"
              className="gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {matchScore}% Match
            </Badge>
          )}

          {/* Reputation / Rating */}
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{reputationScore ? reputationScore.toFixed(1) : '5.0'}</span>
            <span className="text-gray-400">({reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Skills list */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1 font-medium">Skills:</span>
          {skills.slice(0, 8).map((skill, idx) => {
            const isMatched = matchedSet.has(skill.toLowerCase().trim());
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                  isMatched
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {isMatched && <Check className="w-3 h-3 text-emerald-600" />}
                {skill}
              </span>
            );
          })}
          {skills.length > 8 && (
            <span className="text-xs text-gray-400 font-medium">
              +{skills.length - 8} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Message Button */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {gpa && (
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              GPA {gpa.toFixed(2)}
            </span>
          )}
          {user?.email && (
            <span className="flex items-center gap-1 text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {user.email}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate('/chat')}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Message
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CandidateCard;
