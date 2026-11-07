import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { verificationRatingApi } from '../verificationRatingApi';
import {
  Award,
  Star,
  ShieldCheck,
  Sparkles,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  User,
  Building2,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const ReputationMetricsDashboard = ({
  onOpenReviewModal,
  refreshTrigger = 0,
}) => {
  const [metrics, setMetrics] = useState({
    totalReviews: 0,
    avgStars: 0,
    avgReputationScore: 0,
    highTrustCount: 0,
    criteriaBreakdown: [],
    leaderboard: [],
  });

  const [leaderboardFilter, setLeaderboardFilter] = useState('all'); // 'all' | 'student' | 'company'

  const loadMetrics = () => {
    const data = verificationRatingApi.getPlatformMetrics();
    setMetrics(data);
  };

  useEffect(() => {
    loadMetrics();
  }, [refreshTrigger]);

  const filteredLeaderboard = metrics.leaderboard.filter((item) => {
    if (leaderboardFilter === 'all') return true;
    return item.type === leaderboardFilter;
  });

  const getTierBadge = (tier) => {
    if (tier === 'Platinum') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1E3B2F]/15 text-[#1E3B2F] border border-[#1E3B2F]/30 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#1E3B2F]" />
          Platinum Tier
        </span>
      );
    }
    if (tier === 'Gold') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#C8B48A]/30 text-[#1E3B2F] border border-[#C8B48A]/60 uppercase tracking-wider">
          <Award className="w-3 h-3 text-[#C8B48A]" />
          Gold Tier
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wider">
        <ShieldCheck className="w-3 h-3 text-slate-600" />
        Verified Tier
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. Top Summary KPI Cards (4 Cards matching Queue Style) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Average Reputation Score */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#1E3B2F] shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#1E3B2F]" /> Average Reputation Score
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-3xl font-black text-slate-900">{metrics.avgReputationScore}</p>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Weighted academic standard</p>
        </div>

        {/* Card 2: Platform Star Rating */}
        <div className="p-4 bg-[#C8B48A]/10 rounded-xl border border-[#C8B48A]/40 border-l-4 border-l-[#C8B48A] shadow-xs">
          <p className="text-xs font-bold text-[#1E3B2F] uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#C8B48A] text-[#C8B48A]" /> Platform Star Rating
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-3xl font-black text-[#1E3B2F]">{metrics.avgStars}</p>
            <span className="text-xs font-bold text-[#1E3B2F]/80">/ 5.0 Stars</span>
          </div>
          <p className="text-[11px] text-[#1E3B2F]/70 mt-1">Faculty & employer certified</p>
        </div>

        {/* Card 3: Total Verified Reviews */}
        <div className="p-4 bg-[#7F8C6A]/10 rounded-xl border border-[#7F8C6A]/30 border-l-4 border-l-[#1E3B2F] shadow-xs">
          <p className="text-xs font-bold text-[#1E3B2F] uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E3B2F]" /> Total Verified Reviews
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-3xl font-black text-[#1E3B2F]">{metrics.totalReviews}</p>
            <span className="text-xs font-bold text-[#1E3B2F]/80">Evaluations</span>
          </div>
          <p className="text-[11px] text-[#1E3B2F]/70 mt-1">100% authenticated records</p>
        </div>

        {/* Card 4: High-Trust Profiles */}
        <div className="p-4 bg-[#1E3B2F]/5 rounded-xl border border-[#1E3B2F]/20 border-l-4 border-l-[#1E3B2F] shadow-xs">
          <p className="text-xs font-bold text-[#1E3B2F] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1E3B2F]" /> High-Trust Profiles (90%+)
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-3xl font-black text-[#1E3B2F]">{metrics.highTrustCount}</p>
            <span className="text-xs font-bold text-[#1E3B2F]/80">Top Tier</span>
          </div>
          <p className="text-[11px] text-[#1E3B2F]/70 mt-1">Eligible for Platinum badge</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2 & 3. Multi-Criteria Breakdown & Algorithm/Trust Tiers */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 2: Multi-Criteria Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1E3B2F]" />
                Multi-Criteria Evaluation Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Core competencies rated on a 1.0 to 5.0 scale by university lecturers & corporate supervisors
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#C8B48A]/40 uppercase tracking-wider">
              Normalized Standards
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {metrics.criteriaBreakdown.map((crit) => (
              <div key={crit.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-800">{crit.name}</span>
                    <p className="text-[11px] text-slate-400 font-normal">{crit.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="text-sm font-black text-[#1E3B2F]">{crit.score.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-medium"> / 5.0 </span>
                    <span className="text-[11px] font-bold text-slate-500">({crit.percentage}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-[#1E3B2F] h-full transition-all duration-700 rounded-full"
                    style={{ width: `${crit.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
              Minimum passing threshold for academic recommendations is <strong>70% (3.5 / 5.0)</strong>
            </span>
            <span className="font-bold text-[#1E3B2F]">Continuous Grading</span>
          </div>
        </div>

        {/* Section 3: Algorithm & Trust Tiers Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1E3B2F]" />
              Reputation Algorithm & Trust Tiers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mathematical scoring formula and institutional certification thresholds
            </p>
          </div>

          {/* Formula Callout Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Scoring Formula
              </span>
              <span className="text-[10px] font-bold text-[#1E3B2F] bg-[#7F8C6A]/20 px-1.5 py-0.2 rounded-full">
                0 – 100 Index
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-[#1E3B2F] bg-white p-2 border border-slate-200 rounded-lg text-center">
              Score = (Weighted Criteria Avg / 5.0) × 100 + Verification Bonus
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li>Technical Competency weighting: <strong>40%</strong></li>
              <li>Communication & Professionalism: <strong>40%</strong></li>
              <li>Mentorship / Academic rigor: <strong>20%</strong></li>
              <li>Verified Institutional Credentials: <strong>+2 to +5 Bonus</strong></li>
            </ul>
          </div>

          {/* Trust Tiers */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
              Institutional Trust Tiers
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-2 border border-indigo-200 bg-indigo-50/50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {getTierBadge('Platinum')}
                    <span className="font-bold text-slate-900">Score 90 – 100</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Highest credibility tier. Prioritized in algorithmic search matching engine.
                  </p>
                </div>
              </div>

              <div className="p-2 border border-amber-200 bg-amber-50/50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {getTierBadge('Gold')}
                    <span className="font-bold text-slate-900">Score 80 – 89</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Highly endorsed candidates and partners with consistent high marks.
                  </p>
                </div>
              </div>

              <div className="p-2 border border-slate-200 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {getTierBadge('Verified')}
                    <span className="font-bold text-slate-900">Score 70 – 79</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Accreditation complete. Certified authentic profile with verified records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Top Reputation Leaderboard & Quick Review Action */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1E3B2F]" />
              Platform Reputation Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked profiles based on verified multi-criteria evaluations and institutional accreditation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLeaderboardFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  leaderboardFilter === 'all'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                All Leaderboard
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardFilter('student')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  leaderboardFilter === 'student'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Top Students
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardFilter('company')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  leaderboardFilter === 'company'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Top Companies
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenReviewModal}
              className="gap-1.5 text-xs rounded-lg !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] font-semibold shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Submit New Evaluation
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3">Rank</th>
                <th scope="col" className="px-4 py-3">Candidate / Partner Entity</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Trust Tier</th>
                <th scope="col" className="px-4 py-3">Star Rating</th>
                <th scope="col" className="px-4 py-3">Reputation Score</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {filteredLeaderboard.map((item, idx) => (
                <tr key={item._id} className="hover:bg-[#7F8C6A]/10 transition-colors">
                  {/* Rank */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-black rounded-lg ${
                        idx === 0
                          ? 'bg-[#C8B48A] text-[#1E3B2F] font-black'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-[#C8B48A]/80 text-[#1E3B2F]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>

                  {/* Name & Subtitle */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#C8B48A]/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {item.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{item.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.type === 'student'
                            ? item.profile?.degree || item.email
                            : item.industry || 'Technology Partner'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 capitalize">
                      {item.type === 'student' ? (
                        <>
                          <User className="w-3.5 h-3.5 text-[#1E3B2F]" /> Student
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" /> Company
                        </>
                      )}
                    </span>
                  </td>

                  {/* Tier */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getTierBadge(item.tier)}
                  </td>

                  {/* Star Rating */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-bold text-[#C8B48A]">
                      <Star className="w-3.5 h-3.5 fill-[#C8B48A] text-[#C8B48A]" />
                      <span>{item.starScore.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({item.reviewsCount} review{item.reviewsCount === 1 ? '' : 's'})
                      </span>
                    </div>
                  </td>

                  {/* Reputation Score out of 100 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="bg-[#1E3B2F] h-full rounded-full"
                          style={{ width: `${item.score100}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-[#1E3B2F]">
                        {item.score100}
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={onOpenReviewModal}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3B2F] hover:text-[#152A22] bg-[#7F8C6A]/15 hover:bg-[#7F8C6A]/25 px-2.5 py-1 rounded-lg border border-[#C8B48A]/40 transition-colors"
                    >
                      <PlusCircle className="w-3 h-3 text-[#1E3B2F]" />
                      Evaluate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReputationMetricsDashboard;

