import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StarRating } from './StarRating';
import { apiClient } from '../../../services/apiClient';
import {
  ShieldCheck,
  Star,
  Award,
  Calendar,
  Filter,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const ReputationAndReviewsCard = ({
  targetId,
  targetType = 'student',
  title = 'Verified Reputation & Reviews',
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    targetId: null,
    totalReviews: 0,
    averageRating: 0,
    reputationScore: 0, // out of 100
    reviews: [],
    summary: null,
  });

  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest'

  useEffect(() => {
    if (!targetId) return;

    let isMounted = true;
    const fetchReputationAndReviews = async () => {
      setLoading(true);
      setError('');
      try {
        // Calls GET /api/reviews/:targetId
        const res = await apiClient.get(`/reviews/${targetId}`);
        if (isMounted && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reputation and reviews', err);
        if (isMounted) {
          setError(err.message || 'Failed to load reputation metrics.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReputationAndReviews();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  if (!targetId) {
    return null;
  }

  if (loading) {
    return (
      <Card className={`p-8 flex flex-col items-center justify-center gap-2 ${className}`}>
        <Spinner size="md" />
        <p className="text-xs text-gray-400 font-medium">Loading verified reputation...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <p className="text-xs text-red-500 font-medium">{error}</p>
      </Card>
    );
  }

  const {
    totalReviews = 0,
    averageRating = 0,
    reputationScore = 0, // out of 100
    reviews = [],
    summary,
  } = data;

  // Criteria breakdown values
  const breakdown = summary?.breakdown || {};
  const criteriaList = [
    { key: 'technicalSkills', label: 'Technical Competence', val: breakdown.technicalSkills || 0 },
    { key: 'communication', label: 'Communication & Teamwork', val: breakdown.communication || breakdown.softSkills || 0 },
    { key: 'professionalism', label: 'Professionalism & Ethics', val: breakdown.professionalism || 0 },
  ];

  // Sorting
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return (b.overallRating || 0) - (a.overallRating || 0);
    if (sortBy === 'lowest') return (a.overallRating || 0) - (b.overallRating || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Reputation tier label
  const getReputationTier = (score) => {
    if (score >= 90) return { label: 'Top Tier (Outstanding)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 75) return { label: 'High Reputation (Commended)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (score >= 60) return { label: 'Good Standing (Verified)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score > 0) return { label: 'Emerging Rating', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Unrated Candidate', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const tier = getReputationTier(reputationScore);

  return (
    <Card className={`space-y-6 shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
            <Badge variant="success" size="sm" className="inline-flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Evaluations
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Certified university & employer evaluation metrics based on verified third-party reviews.
          </p>
        </div>

        {/* Reputation Score Badge (out of 100) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reputation Score</p>
            <p className="text-xs font-semibold text-gray-700">{tier.label}</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl border font-black text-lg sm:text-xl shadow-xs bg-indigo-50 border-indigo-200 text-indigo-700 flex items-center gap-1">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>{reputationScore}</span>
            <span className="text-[11px] font-medium text-indigo-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* Main Score & Multi-Criteria Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Overall Rating (1–5) */}
        <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
          <div className="flex items-baseline justify-center md:justify-start gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              {Number(averageRating || 0).toFixed(1)}
            </span>
            <span className="text-gray-400 text-lg font-medium">/ 5.0</span>
          </div>

          <StarRating value={averageRating} size="lg" readOnly />

          <p className="text-xs text-gray-500 font-medium">
            Computed from <strong className="text-gray-900">{totalReviews}</strong> verified academic evaluation
            {totalReviews === 1 ? '' : 's'}.
          </p>
        </div>

        {/* Right Column: Multi-Criteria Progress Bars */}
        <div className="md:col-span-8 space-y-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Competency Criteria Breakdown
          </p>
          <div className="space-y-2.5">
            {criteriaList.map((crit) => {
              const val = Number(crit.val || 0);
              const pct = (val / 5) * 100;

              return (
                <div key={crit.key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-semibold">{crit.label}</span>
                    <span className="font-bold text-indigo-700">{val.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* List of Verified Written Reviews */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Verified Written Feedback ({reviews.length})
          </h4>

          {reviews.length > 1 && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            title="No evaluations submitted yet"
            description="Verified ratings and written endorsements from approved university lecturers and supervisors will appear here."
            icon={<MessageSquare className="w-10 h-10 text-gray-300" />}
          />
        ) : (
          <div className="space-y-3">
            {sortedReviews.map((rev) => {
              const reviewerObj = rev.reviewerId || rev.reviewer || {};
              const reviewCriteria = rev.ratingCriteria || rev.ratings || {};

              return (
                <div
                  key={rev._id}
                  className="p-4 bg-gray-50/60 rounded-xl border border-gray-200/80 space-y-2.5 transition-all hover:border-gray-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                        {reviewerObj.name?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-xs">
                            {reviewerObj.name || 'Verified Faculty Reviewer'}
                          </p>
                          <Badge variant="success" size="sm" className="text-[10px] py-0 px-1.5">
                            <ShieldCheck className="w-3 h-3 mr-0.5 inline" /> Verified
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {reviewerObj.email || 'Academic Supervisor / Evaluator'}
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

                  {/* Criteria score chips */}
                  {Object.keys(reviewCriteria).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {reviewCriteria.technicalSkills && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700">
                          Technical: <strong className="text-indigo-600">{reviewCriteria.technicalSkills}/5</strong>
                        </span>
                      )}
                      {(reviewCriteria.communication || reviewCriteria.softSkills) && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700">
                          Communication: <strong className="text-indigo-600">{reviewCriteria.communication || reviewCriteria.softSkills}/5</strong>
                        </span>
                      )}
                      {reviewCriteria.professionalism && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700">
                          Professionalism: <strong className="text-indigo-600">{reviewCriteria.professionalism}/5</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Feedback Comments */}
                  <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                    "{rev.comments}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReputationAndReviewsCard;
