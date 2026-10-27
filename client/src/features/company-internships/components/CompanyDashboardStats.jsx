import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Briefcase,
  CheckCircle,
  FileText,
  Archive,
  Users,
  PlusCircle,
  Building2,
  ShieldCheck,
  Star,
  MapPin,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    if (value === displayValue) return;
    setIsPulsing(true);
    const start = displayValue;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
        setTimeout(() => setIsPulsing(false), 200);
      }
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return (
    <span
      className={`inline-block transition-transform duration-200 ${
        isPulsing ? 'scale-105 text-indigo-600' : ''
      }`}
    >
      {displayValue}
    </span>
  );
};

export const CompanyDashboardStats = ({
  stats,
  company,
  recentInternships = [],
  onOpenCreateModal,
  onSwitchTab,
  onViewInternship,
}) => {
  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Verified Employer
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold backdrop-blur-xs">
            Verification Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full text-xs font-semibold backdrop-blur-xs">
            Verification Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-slate-200 border border-white/20 rounded-full text-xs font-medium backdrop-blur-xs">
            Unverified
          </span>
        );
    }
  };

  const statCards = [
    {
      title: 'Total Postings',
      value: stats?.total ?? 0,
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-100',
      description: 'All internship listings',
    },
    {
      title: 'Active / Published',
      value: stats?.published ?? 0,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      description: 'Currently open to applicants',
    },
    {
      title: 'Draft Postings',
      value: stats?.draft ?? 0,
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      description: 'Private draft opportunities',
    },
    {
      title: 'Closed Listings',
      value: stats?.closed ?? 0,
      icon: <Archive className="w-5 h-5 text-slate-600" />,
      iconBg: 'bg-slate-100 border-slate-200',
      description: 'Past recruitment posts',
    },
    {
      title: 'Total Applicants',
      value: stats?.totalApplicants ?? 0,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-100',
      description: 'Candidate applications',
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ====================================================
          Refined Executive Brand Banner
          ==================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {company?.name || 'Recruiter Portal'}
              </h2>
              {company && getVerificationBadge(company.verificationStatus)}
            </div>

            <p className="text-indigo-100 text-sm max-w-2xl leading-relaxed">
              {company?.description
                ? company.description.length > 150
                  ? `${company.description.substring(0, 150)}...`
                  : company.description
                : 'Welcome to your recruitment management dashboard. Publish technical internships, review student candidate metrics, and oversee your hiring pipeline.'}
            </p>

            {company && (
              <div className="flex items-center gap-4 text-xs text-indigo-200/90 pt-1 flex-wrap">
                {company.location?.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    {company.location.city}, {company.location.country || 'Sri Lanka'}
                  </span>
                )}
                {company.industry && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                    {company.industry}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <strong className="text-white">
                    {company.reputationScore ? company.reputationScore.toFixed(1) : '0.0'}
                  </strong>
                  <span>({company.reviewCount || 0} reviews)</span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons with high contrast and zero rendering collisions */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Button
              onClick={onOpenCreateModal}
              variant="white"
              size="md"
              className="font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" /> Post Internship
            </Button>
            <Button
              onClick={() => onSwitchTab('profile')}
              variant="outline-white"
              size="md"
              className="font-medium"
            >
              <Building2 className="w-4 h-4 text-indigo-200" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* ====================================================
          KPI Statistics Grid
          ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="p-5 border border-slate-200/90 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-xl border transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight transition-colors duration-200 group-hover:text-indigo-600">
              <AnimatedNumber value={card.value} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{card.description}</p>
          </Card>
        ))}
      </div>

      {/* ====================================================
          Recent Internship Postings Overview
          ==================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Internship Opportunities
            </h3>
            <p className="text-xs text-slate-500">
              Your most recently created or updated recruitment positions
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSwitchTab('internships')}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 font-semibold gap-1"
          >
            View All ({stats?.total || 0}) <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {recentInternships.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-slate-200">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">No internship postings yet</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Get started by creating your first internship opportunity to attract talented undergraduates.
            </p>
            <Button onClick={onOpenCreateModal} variant="primary" size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" /> Create Your First Internship
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentInternships.slice(0, 6).map((item) => {
              const statusVariant =
                item.status === 'published'
                  ? 'success'
                  : item.status === 'draft'
                  ? 'neutral'
                  : 'warning';

              return (
                <Card
                  key={item._id}
                  className="p-5 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 cursor-pointer line-clamp-1 transition-colors"
                        onClick={() => onViewInternship(item)}
                      >
                        {item.title}
                      </h4>
                      <Badge variant={statusVariant} size="sm" className="capitalize shrink-0">
                        {item.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {item.area}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.location} ({item.locationType})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.requiredSkills?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="neutral" size="sm" className="lowercase">
                          {skill}
                        </Badge>
                      ))}
                      {item.requiredSkills?.length > 3 && (
                        <span className="text-[11px] text-slate-400 font-medium self-center pl-1">
                          +{item.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      <Users className="w-3.5 h-3.5" />
                      {item.applicantCount || 0} Applicants
                    </span>
                    <button
                      onClick={() => onViewInternship(item)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
