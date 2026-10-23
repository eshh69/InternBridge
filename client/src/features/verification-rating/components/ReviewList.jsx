import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StarRating } from './StarRating';
import { ShieldCheck, MessageSquare, Calendar, User, ThumbsUp, Filter } from 'lucide-react';

export const ReviewList = ({ reviews = [], emptyMessage = 'No verified evaluations available yet.' }) => {
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest'

  const criteriaLabels = {
    technicalSkills: 'Technical',
    softSkills: 'Soft Skills',
    professionalism: 'Professionalism',
    workEnvironment: 'Environment',
    mentorship: 'Mentorship',
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') {
      return b.overallRating - a.overallRating;
    }
    if (sortBy === 'lowest') {
      return a.overallRating - b.overallRating;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No Evaluations Found"
        description={emptyMessage}
        icon={<MessageSquare className="w-12 h-12 text-gray-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-gray-700">
          Showing {reviews.length} Verified Review{reviews.length === 1 ? '' : 's'}
        </span>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {sortedReviews.map((rev) => (
          <Card key={rev._id} className="space-y-3 hover:border-gray-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {rev.reviewer?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-900 text-sm">
                      {rev.reviewer?.name || 'Academic Reviewer'}
                    </h5>
                    <Badge variant="success" size="sm" className="text-[10px] py-0 px-2">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified Reviewer
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {rev.reviewer?.email ? `${rev.reviewer.email} • ` : ''}
                    University Evaluator
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StarRating value={rev.overallRating} size="sm" showScore readOnly />
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Criteria Breakdown Pills */}
            {rev.ratings && Object.keys(rev.ratings).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(rev.ratings)
                  .filter(([_, val]) => typeof val === 'number')
                  .map(([criterion, val]) => (
                    <span
                      key={criterion}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium"
                    >
                      <span className="text-gray-500">{criteriaLabels[criterion] || criterion}:</span>
                      <strong className="text-indigo-600">{val}/5</strong>
                    </span>
                  ))}
              </div>
            )}

            {/* Qualitative Feedback Text */}
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              "{rev.comments}"
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
