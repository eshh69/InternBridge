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
  title = 'Verified Faculty Evaluations',
  className = '',
  compact = false,
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
      <Card className={`p-8 flex flex-col items-center justify-center gap-2 bg-white ${className}`}>
        <Spinner size="md" />
        <p className="text-xs text-slate-400 font-medium">Loading verified reputation...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 bg-white ${className}`}>
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

  // Criteria breakdown values: fallback to review individual criteria if summary.breakdown has 0 or is empty
  const breakdown = { ...(summary?.breakdown || {}) };
  if (reviews.length > 0) {
    const sums = { technicalSkills: 0, communication: 0, professionalism: 0 };
    const counts = { technicalSkills: 0, communication: 0, professionalism: 0 };

    reviews.forEach((r) => {
      const crit = r.ratingCriteria || r.ratings || {};
      const tech = crit.technicalSkills || crit.technical;
      if (typeof tech === 'number' && tech > 0) {
        sums.technicalSkills += tech;
        counts.technicalSkills += 1;
      }
      const comm = crit.communication || crit.softSkills;
      if (typeof comm === 'number' && comm > 0) {
        sums.communication += comm;
        counts.communication += 1;
      }
      const prof = crit.professionalism || crit.ethics;
      if (typeof prof === 'number' && prof > 0) {
        sums.professionalism += prof;
        counts.professionalism += 1;
      }
    });

    if (counts.technicalSkills > 0 && !breakdown.technicalSkills) {
      breakdown.technicalSkills = Math.round((sums.technicalSkills / counts.technicalSkills) * 10) / 10;
    }
    if (counts.communication > 0 && !breakdown.communication && !breakdown.softSkills) {
      breakdown.communication = Math.round((sums.communication / counts.communication) * 10) / 10;
    }
    if (counts.professionalism > 0 && !breakdown.professionalism) {
      breakdown.professionalism = Math.round((sums.professionalism / counts.professionalism) * 10) / 10;
    }
  }

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
    if (score >= 90) return { label: 'Top Tier (Outstanding)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (score >= 75) return { label: 'High Reputation (Commended)', color: 'bg-[#1E3B2F]/10 text-[#1E3B2F] border-[#1E3B2F]/20' };
    if (score >= 60) return { label: 'Good Standing (Verified)', color: 'bg-[#7F8C6A]/20 text-[#1E3B2F] border-[#7F8C6A]/40' };
    if (score > 0) return { label: 'Emerging Rating', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { label: 'Unrated Candidate', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const tier = getReputationTier(reputationScore);

  // ========================================================
  // COMPACT LAYOUT (For Sidebar & Narrow Columns)
  // ========================================================
  if (compact) {
    return (
      <Card className={`space-y-4 shadow-2xs border border-[#C8B48A]/40 bg-white overflow-hidden ${className}`}>
        {/* Header */}
        <div className="space-y-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-[#1E3B2F] flex-shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                {title}
              </h4>
            </div>

            {/* Score Pill (Never Overflows) */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1E3B2F] text-white shadow-xs font-black text-xs flex-shrink-0">
              <Award className="w-3.5 h-3.5 text-[#C8B48A]" />
              <span>{reputationScore}</span>
              <span className="text-[10px] text-white/70 font-medium">/100</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Verified evaluations based on authenticated third-party supervisor reviews.
          </p>

          {/* Tier Banner */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F5F0E6]/70 border border-[#C8B48A]/35 text-xs">
            <span className="text-[11px] font-semibold text-slate-600">Reputation Tier</span>
            <span className="text-[11px] font-bold text-[#1E3B2F] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C8B48A]" />
              {tier.label}
            </span>
          </div>
        </div>

        {/* Rating Hero Block */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#1E3B2F] tracking-tight">
                {Number(averageRating || 0).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Based on <strong className="text-slate-800">{totalReviews}</strong> evaluation{totalReviews === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StarRating value={averageRating} size="sm" readOnly />
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Faculty Verified
            </span>
          </div>
        </div>

        {/* Competency Criteria Breakdown */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Competency Breakdown
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Max 5.0</span>
          </div>
          <div className="space-y-2">
            {criteriaList.map((crit) => {
              const val = Number(crit.val || 0);
              const pct = (val / 5) * 100;

              return (
                <div key={crit.key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-semibold text-[11px] truncate max-w-[170px]">
                      {crit.label}
                    </span>
                    <span className="font-extrabold text-[#1E3B2F] text-[11px]">
                      {val.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#7F8C6A] to-[#1E3B2F] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Written Feedback Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#1E3B2F]" />
              Written Feedback ({reviews.length})
            </h4>

            {reviews.length > 1 && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3B2F]"
              >
                <option value="recent">Recent</option>
                <option value="highest">Highest</option>
                <option value="lowest">Lowest</option>
              </select>
            )}
          </div>

          {reviews.length === 0 ? (
            <EmptyState
              title="No evaluations submitted yet"
              description="Ratings and written endorsements from approved university lecturers will appear here."
              icon={<MessageSquare className="w-8 h-8 text-slate-300" />}
            />
          ) : (
            <div className="space-y-3">
              {sortedReviews.map((rev) => {
                const reviewerObj = rev.reviewerId || rev.reviewer || {};
                const reviewCriteria = rev.ratingCriteria || rev.ratings || {};

                return (
                  <div
                    key={rev._id}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5 transition-all hover:border-slate-300"
                  >
                    {/* Reviewer identity */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1E3B2F] text-[#C8B48A] flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs">
                        {reviewerObj.name?.charAt(0) || 'R'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {reviewerObj.name || 'Verified Faculty Reviewer'}
                          </p>
                          <Badge variant="success" size="sm" className="text-[9px] py-0 px-1 font-bold flex-shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5 inline" /> Verified
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {reviewerObj.email || 'Academic Supervisor / Evaluator'}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating & Date */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <StarRating value={rev.overallRating} size="sm" readOnly />
                        <span className="font-extrabold text-[#1E3B2F] text-xs">
                          {Number(rev.overallRating || 0).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Criteria score chips */}
                    {Object.keys(reviewCriteria).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reviewCriteria.technicalSkills && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">
                            Tech: <strong className="text-[#1E3B2F]">{reviewCriteria.technicalSkills}/5</strong>
                          </span>
                        )}
                        {(reviewCriteria.communication || reviewCriteria.softSkills) && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">
                            Comm: <strong className="text-[#1E3B2F]">{reviewCriteria.communication || reviewCriteria.softSkills}/5</strong>
                          </span>
                        )}
                        {reviewCriteria.professionalism && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">
                            Ethics: <strong className="text-[#1E3B2F]">{reviewCriteria.professionalism}/5</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Feedback Comments */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 italic shadow-2xs">
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
  }

  // ========================================================
  // FULL-WIDTH LAYOUT (For Tab 4 & Tab 5)
  // ========================================================
  return (
    <Card className={`space-y-6 shadow-sm border border-[#C8B48A]/40 bg-white ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{title}</h3>
            <Badge variant="success" size="sm" className="inline-flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Evaluations
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Certified university & employer evaluation metrics based on verified third-party reviews.
          </p>
        </div>

        {/* Reputation Score Badge (out of 100) */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reputation Score</p>
            <p className="text-xs font-semibold text-[#1E3B2F]">{tier.label}</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl border font-black text-lg sm:text-xl shadow-xs bg-[#1E3B2F] text-white flex items-center gap-1.5">
            <Award className="w-5 h-5 text-[#C8B48A]" />
            <span>{reputationScore}</span>
            <span className="text-[11px] font-medium text-white/70">/ 100</span>
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
                    <span className="font-bold text-[#1E3B2F]">{val.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#7F8C6A] to-[#1E3B2F] h-full rounded-full transition-all duration-500"
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
            <MessageSquare className="w-4 h-4 text-[#1E3B2F]" />
            Verified Written Feedback ({reviews.length})
          </h4>

          {reviews.length > 1 && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3B2F]"
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
                      <div className="w-8 h-8 rounded-full bg-[#1E3B2F] text-[#C8B48A] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                        {reviewerObj.name?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
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
                          Technical: <strong className="text-[#1E3B2F]">{reviewCriteria.technicalSkills}/5</strong>
                        </span>
                      )}
                      {(reviewCriteria.communication || reviewCriteria.softSkills) && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700">
                          Communication: <strong className="text-[#1E3B2F]">{reviewCriteria.communication || reviewCriteria.softSkills}/5</strong>
                        </span>
                      )}
                      {reviewCriteria.professionalism && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700">
                          Professionalism: <strong className="text-[#1E3B2F]">{reviewCriteria.professionalism}/5</strong>
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
