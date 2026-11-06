import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Edit3,
  MoreHorizontal,
  Clock,
  ChevronRight,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';

/* ============================================================
   AnimatedNumber — counts up when value changes
   ============================================================ */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(value);
      return;
    }
    if (value === display) return;
    setPulse(true);
    const start = display;
    const end = value;
    const duration = 450;
    const startTime = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(() => setPulse(false), 150);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <span
      className={`inline-block transition-transform duration-200 ${
        pulse ? 'scale-110 text-indigo-600' : ''
      }`}
    >
      {display}
    </span>
  );
};

/* ============================================================
   MiniBar — decorative sparkline bars for KPI cards
   ============================================================ */
const MiniBar = ({ color = 'bg-indigo-200', heights = [40, 60, 45, 70, 55, 80, 65] }) => (
  <div className="flex items-end gap-0.5 h-6 opacity-60">
    {heights.map((h, i) => (
      <div
        key={i}
        className={`w-1 rounded-sm ${color} transition-all duration-300`}
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

/* ============================================================
   getRelativeTime — "Posted recently" or "3 days ago"
   ============================================================ */
const getRelativeTime = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ============================================================
   getVerificationBadge — banner-style (white text on dark bg)
   ============================================================ */
const getVerificationBadge = (status) => {
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-semibold">
          <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-[11px] font-semibold">
          Verification Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full text-[11px] font-semibold">
          Verification Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-slate-200 border border-white/20 rounded-full text-[11px] font-medium">
          Unverified
        </span>
      );
  }
};

/* ============================================================
   InternshipRowCard — compact recent opportunity row
   ============================================================ */
const InternshipRowCard = ({ item, onView, onEdit, onStatusChange, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusVariant =
    item.status === 'published' ? 'success' : item.status === 'draft' ? 'neutral' : 'warning';

  const statusDot =
    item.status === 'published'
      ? 'bg-emerald-500'
      : item.status === 'draft'
      ? 'bg-amber-400'
      : 'bg-slate-400';

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 group">
      {/* Company Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
        <Briefcase className="w-5 h-5 text-indigo-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 cursor-pointer transition-colors truncate"
            onClick={() => onView(item)}
          >
            {item.title}
          </h4>
          <Badge variant={statusVariant} size="sm" className="capitalize shrink-0">
            {item.status}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
          {item.area && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              {item.area}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {item.location}
              {item.locationType ? ` (${item.locationType})` : ''}
            </span>
          )}
        </div>

        {/* Description excerpt */}
        {item.description && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Skills chips */}
        {item.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.requiredSkills.slice(0, 3).map((sk) => (
              <span
                key={sk}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium lowercase border border-slate-200"
              >
                {sk}
              </span>
            ))}
            {item.requiredSkills.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{item.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Posted time */}
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Clock className="w-3 h-3" />
          {getRelativeTime(item.createdAt || item.updatedAt)}
        </span>

        {/* Applicants + Details */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Users className="w-3 h-3 text-slate-400" />
            {item.applicantCount || 0} Applicants
          </span>
          <button
            onClick={() => onView(item)}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
          >
            Details <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 w-40 bg-white rounded-xl border border-slate-200 shadow-lg py-1 animate-scale-in">
              <button
                onClick={() => { setMenuOpen(false); onEdit(item); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit
              </button>
              {item.status !== 'published' && (
                <button
                  onClick={() => { setMenuOpen(false); onStatusChange(item._id, 'published'); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Publish
                </button>
              )}
              {item.status === 'published' && (
                <button
                  onClick={() => { setMenuOpen(false); onStatusChange(item._id, 'closed'); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5" /> Close
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); onDelete(item); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT — CompanyDashboardStats
   ============================================================ */
export const CompanyDashboardStats = ({
  stats,
  company,
  recentInternships = [],
  onOpenCreateModal,
  onSwitchTab,
  onViewInternship,
  onEditInternship,
  onStatusChange,
  onDeleteInternship,
}) => {
  const navigate = useNavigate();

  /* ------ KPI card definitions ------ */
  const kpiCards = [
    {
      title: 'Total Postings',
      value: stats?.total ?? 0,
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-100',
      description: 'All internship listings',
      barColor: 'bg-indigo-300',
      arrowColor: 'text-indigo-400',
      barHeights: [30, 50, 40, 65, 55, 75, 60],
    },
    {
      title: 'Active / Published',
      value: stats?.published ?? 0,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      description: 'Currently open to applicants',
      barColor: 'bg-emerald-300',
      arrowColor: 'text-emerald-400',
      barHeights: [45, 65, 55, 80, 70, 90, 75],
    },
    {
      title: 'Draft Postings',
      value: stats?.draft ?? 0,
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      description: 'Private draft opportunities',
      barColor: 'bg-amber-300',
      arrowColor: 'text-amber-400',
      barHeights: [20, 35, 25, 40, 30, 45, 35],
    },
    {
      title: 'Closed Listings',
      value: stats?.closed ?? 0,
      icon: <Archive className="w-5 h-5 text-slate-500" />,
      iconBg: 'bg-slate-100 border-slate-200',
      description: 'Past recruitment posts',
      barColor: 'bg-slate-300',
      arrowColor: 'text-slate-400',
      barHeights: [50, 40, 55, 35, 45, 30, 40],
    },
    {
      title: 'Total Applicants',
      value: stats?.totalApplicants ?? 0,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-100',
      description: 'Candidate applications',
      barColor: 'bg-purple-300',
      arrowColor: 'text-purple-400',
      barHeights: [25, 45, 35, 60, 50, 70, 55],
    },
  ];

  /* ------ Quick Actions ------ */
  const quickActions = [
    {
      icon: <PlusCircle className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-100',
      label: 'Post New Internship',
      subtitle: 'Reach talented students',
      onClick: onOpenCreateModal,
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
      label: 'View Applicants',
      subtitle: 'Manage candidate applications',
      onClick: () => navigate('/applications'),
    },
    {
      icon: <Edit3 className="w-5 h-5 text-slate-600" />,
      iconBg: 'bg-slate-100',
      label: 'Edit Company Profile',
      subtitle: 'Keep your information up to date',
      onClick: () => onSwitchTab('profile'),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ==================================================================
          COMPANY HERO BANNER
          ================================================================== */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-indigo-900/30"
        style={{
          background: 'linear-gradient(135deg, #26236B 0%, #3730a3 40%, #5b21b6 75%, #4c1d95 100%)'
        }}
      >
        {/* Decorative glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        {/* Architectural illustration — pure CSS rings */}
        <div className="absolute right-0 top-0 h-full w-64 sm:w-80 pointer-events-none hidden sm:flex items-center justify-end pr-6 opacity-20">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full border-2 border-white/30" />
            <div className="absolute inset-4 rounded-full border-2 border-white/25" />
            <div className="absolute inset-8 rounded-full border-2 border-white/20" />
            <div className="absolute inset-12 rounded-full bg-white/10" />
            <Building2 className="absolute inset-0 m-auto w-12 h-12 text-white/40" />
          </div>
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Logo / initials */}
            <div className="flex-shrink-0">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center shadow-lg">
                  {company?.name ? (
                    <span className="text-white text-2xl sm:text-3xl font-extrabold select-none">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Building2 className="w-8 h-8 text-white/70" />
                  )}
                </div>
              )}
            </div>

            {/* Company info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {company?.name || 'Recruiter Portal'}
                </h2>
                {company && getVerificationBadge(company.verificationStatus)}
              </div>

              {company?.description && (
                <p className="text-indigo-200 text-sm leading-relaxed max-w-xl">
                  {company.description.length > 100
                    ? `${company.description.substring(0, 100)}...`
                    : company.description}
                </p>
              )}

              {!company && (
                <p className="text-indigo-200 text-sm leading-relaxed">
                  Welcome to your recruitment management portal. Set up your company profile to begin posting internships.
                </p>
              )}

              {company && (
                <div className="flex items-center gap-4 text-xs text-indigo-200 flex-wrap pt-0.5">
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
                    <strong className="text-white font-bold">
                      {company.reputationScore ? company.reputationScore.toFixed(1) : '0.0'}
                    </strong>
                    <span>({company.reviewCount || 0} reviews)</span>
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5 sm:flex-nowrap shrink-0">
              <Button
                onClick={onOpenCreateModal}
                variant="white"
                size="md"
                className="gap-2 font-semibold shadow-md"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Post Internship
              </Button>
              <Button
                onClick={() => onSwitchTab('profile')}
                variant="outline-white"
                size="md"
                className="gap-2 font-medium"
              >
                <Edit3 className="w-4 h-4 text-indigo-200" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================
          KEY OVERVIEW — KPI CARDS
          ================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Key Overview</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">A quick snapshot of your internship activity</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            This Month
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpiCards.map((card) => (
            <Card
              key={card.title}
              className="p-4 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-xl border transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}>
                  {card.icon}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    <AnimatedNumber value={card.value} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-tight">
                    {card.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <ChevronRight className={`w-3.5 h-3.5 ${card.arrowColor}`} />
                  <MiniBar color={card.barColor} heights={card.barHeights} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ==================================================================
          LOWER SECTION — Recent Opportunities + Quick Actions
          ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ---- Recent Internship Opportunities (2/3 width) ---- */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">Recent Internship Opportunities</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Your most recently created or updated recruitment positions</p>
            </div>
            <button
              onClick={() => onSwitchTab('internships')}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              View All ({stats?.total || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentInternships.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No internship postings yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Create your first internship opportunity to start attracting talented students.
              </p>
              <Button onClick={onOpenCreateModal} variant="primary" size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" /> Post First Internship
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInternships.slice(0, 5).map((item) => (
                <InternshipRowCard
                  key={item._id}
                  item={item}
                  onView={onViewInternship}
                  onEdit={onEditInternship || (() => onSwitchTab('internships'))}
                  onStatusChange={onStatusChange || (() => {})}
                  onDelete={onDeleteInternship || (() => {})}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---- Quick Actions (1/3 width) ---- */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage your recruitment process</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {quickActions.map((action, idx) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset group ${
                  idx < quickActions.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${action.iconBg} flex items-center justify-center transition-transform duration-150 group-hover:scale-105`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-snug">{action.label}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{action.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Company profile completeness hint */}
          {!company && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-900 mb-1">Complete your profile</p>
              <p className="text-[11px] text-amber-700 mb-3">
                Set up your company profile to unlock all features and start posting internships.
              </p>
              <Button
                onClick={() => onSwitchTab('profile')}
                variant="primary"
                size="sm"
                className="w-full gap-2"
              >
                <Building2 className="w-3.5 h-3.5" /> Set Up Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
