import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import studentPortfolioService from './services/studentPortfolioService';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SkillTagsSection } from './components/SkillTagsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { CertificatesBadgesSection } from './components/CertificatesBadgesSection';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle,
  AlertCircle,
  BarChart3,
  Award,
  Sparkles,
  Briefcase,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ChevronRight,
  PlusCircle,
  UploadCloud,
  FileText,
  Search,
  MessageSquare,
  Compass,
  LayoutDashboard,
  GraduationCap,
  Edit3,
  Star,
  ExternalLink,
} from 'lucide-react';
import { ReputationAndReviewsCard } from '../verification-rating';

/* ============================================================
   AnimatedNumber — counts up smoothly when value changes
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
    const start = Number(display) || 0;
    const end = Number(value) || 0;
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
        pulse ? 'scale-105 text-[#1E3B2F]' : ''
      }`}
    >
      {display}
    </span>
  );
};

/* ============================================================
   MiniBar — decorative sparkline bars for KPI cards
   ============================================================ */
const MiniBar = ({ color = 'bg-[#7F8C6A]', heights = [40, 60, 45, 70, 55, 80, 65] }) => (
  <div className="flex items-end gap-0.5 h-5 opacity-65">
    {heights.map((h, i) => (
      <div
        key={i}
        className={`w-1 rounded-xs ${color} transition-all duration-300`}
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

export const StudentPortfolioPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sideCvInputRef = useRef(null);

  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'dashboard');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isDeletingCv, setIsDeletingCv] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4500);
  };

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentPortfolioService.getMyProfile();
      setProfile(res.data || res);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile({
          skills: [],
          projects: [],
          education: [],
          experience: [],
          certificates: [],
          badges: [],
          links: {},
        });
      } else {
        showFeedback('error', err.message || 'Failed to load profile.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (updatedFields) => {
    setIsSaving(true);
    try {
      const res = await studentPortfolioService.updateMyProfile(updatedFields);
      setProfile(res.data || res);
      showFeedback('success', 'Profile updated successfully.');
      return res.data || res;
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAvatar = async (file) => {
    setIsUploadingAvatar(true);
    try {
      const res = await studentPortfolioService.uploadAvatar(file);
      const newAvatarUrl = res.data?.avatarUrl || res.avatarUrl;
      setProfile((prev) => ({
        ...prev,
        user: { ...prev?.user, avatarUrl: newAvatarUrl },
      }));
      if (user) {
        user.avatarUrl = newAvatarUrl;
        localStorage.setItem('internbridge_user', JSON.stringify(user));
      }
      showFeedback('success', 'Profile photo updated successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await studentPortfolioService.deleteAvatar();
      setProfile((prev) => ({
        ...prev,
        user: { ...prev?.user, avatarUrl: null },
      }));
      if (user) {
        user.avatarUrl = null;
        localStorage.setItem('internbridge_user', JSON.stringify(user));
      }
      showFeedback('success', 'Profile photo removed.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUploadCv = async (file) => {
    setIsUploadingCv(true);
    try {
      const res = await studentPortfolioService.uploadCv(file);
      const newCvUrl = res.data?.cvUrl || res.cvUrl;
      setProfile((prev) => ({ ...prev, cvUrl: newCvUrl }));
      showFeedback('success', 'Resume (CV) uploaded successfully.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to upload CV.');
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleDeleteCv = async () => {
    setIsDeletingCv(true);
    try {
      await studentPortfolioService.deleteCv();
      setProfile((prev) => ({ ...prev, cvUrl: null }));
      showFeedback('success', 'Resume (CV) removed.');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to delete CV.');
    } finally {
      setIsDeletingCv(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 mt-4 font-medium animate-pulse">
          Loading student portfolio...
        </p>
      </div>
    );
  }

  // Calculate live counts
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const educationCount = profile?.education?.length || 0;
  const experienceCount = profile?.experience?.length || 0;
  const certificatesCount = profile?.certificates?.length || 0;
  const badgesCount = profile?.badges?.length || 0;
  const credentialsCount = certificatesCount + badgesCount;
  const currentGpa = profile?.gpa ? Number(profile.gpa).toFixed(2) : '4.00';
  const studentUserId = user?._id || user?.id || profile?.user?._id || profile?.user;

  // Portfolio strength calculation
  const calculatePortfolioStrength = (profile, user) => {
    if (!profile) return { score: 0, tier: 'Developing', label: 'Developing (0%)', breakdown: {} };
    const pCount = profile.projects?.length || 0;
    const projectPts = Math.min(25, pCount * 8 + (pCount >= 3 ? 1 : 0));
    const reviewCount = profile.reviewCount || 0;
    const repScore = profile.reputationScore || 0;
    let reviewPts = 0;
    if (reviewCount > 0) reviewPts = 10 + Math.min(10, Math.round((repScore / 5) * 10));
    const hasEdu = (profile.education?.length || 0) > 0;
    const gpaNum = Number(profile.gpa) || 0;
    let academicPts = 0;
    if (hasEdu) academicPts += 10;
    if (gpaNum >= 3.7) academicPts += 10;
    else if (gpaNum >= 3.0) academicPts += 7;
    else if (gpaNum > 0) academicPts += 4;
    const sCount = profile.skills?.length || 0;
    const skillPts = Math.min(20, sCount * 2.5);
    const certCount = profile.certificates?.length || 0;
    const badgeCount = profile.badges?.length || 0;
    const hasCv = !!profile.cvUrl;
    let credPts = Math.min(8, certCount * 4 + badgeCount * 2);
    if (hasCv) credPts += 7;
    credPts = Math.min(15, credPts);

    const totalRaw = projectPts + reviewPts + academicPts + skillPts + credPts;
    let finalScore = Math.min(100, Math.round(totalRaw));
    if (pCount < 3 && finalScore > 74) finalScore = 74;

    let tier = 'Developing';
    let label = `Developing (${finalScore}%)`;
    let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-300';
    let tip = '';

    if (finalScore >= 90) {
      tier = 'Elite';
      label = `Elite (${finalScore}%)`;
      badgeStyle = 'bg-[#1E3B2F] text-[#F5F0E6] border-[#152A22]';
      tip = '🌟 Exceptional standing! Top priority in recruiter search algorithms.';
    } else if (finalScore >= 75) {
      tier = 'Advanced';
      label = `Advanced (${finalScore}%)`;
      badgeStyle = 'bg-[#7F8C6A]/25 text-[#1E3B2F] border-[#7F8C6A]/40';
      if (reviewCount === 0) {
        tip = '💡 Tip: Obtain 1 faculty endorsement to unlock Elite (90%+) status!';
      } else if (sCount < 8) {
        tip = `💡 Tip: Expand skills to 8+ competencies to reach Elite status.`;
      } else {
        tip = '💡 Tip: Add live demo links to your projects to maximize score.';
      }
    } else if (finalScore >= 50) {
      tier = 'Intermediate';
      label = `Intermediate (${finalScore}%)`;
      badgeStyle = 'bg-amber-50 text-amber-900 border-amber-300';
      if (pCount < 3) {
        tip = `💡 Tip: Add ${3 - pCount} more featured project(s) to reach 3+ projects.`;
      } else if (reviewCount === 0) {
        tip = '💡 Tip: Request a faculty evaluation from Section 06 to boost standing.';
      } else if (!profile.cvUrl) {
        tip = '💡 Tip: Upload your resume (CV) to boost standing.';
      } else {
        tip = '💡 Tip: Add more verified skills and project demos to reach Advanced tier.';
      }
    } else {
      tier = 'Developing';
      label = `Developing (${finalScore}%)`;
      badgeStyle = 'bg-gray-100 text-gray-700 border-gray-300';
      tip = '💡 Tip: Add 3+ featured projects, skills, and upload your CV to improve.';
    }

    return {
      score: finalScore,
      tier,
      label,
      badgeStyle,
      tip,
      breakdown: {
        projects: Math.min(25, projectPts),
        faculty: Math.min(20, reviewPts),
        academic: Math.min(20, academicPts),
        skills: Math.min(20, skillPts),
        credentials: Math.min(15, credPts),
      },
    };
  };

  const strengthData = calculatePortfolioStrength(profile, user);

  // Tabs Configuration matching Company Dashboard
  const tabsConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'projects',
      label: 'Projects & Skills',
      icon: Briefcase,
      count: projectsCount + skillsCount,
    },
    {
      id: 'academics',
      label: 'Education & Experience',
      icon: GraduationCap,
      count: educationCount + experienceCount,
    },
    {
      id: 'credentials',
      label: 'Certifications & Reviews',
      icon: ShieldCheck,
      count: credentialsCount,
    },
    { id: 'all', label: 'Full Portfolio', icon: FileText },
  ];

  // 5 KPI Metric Cards
  const kpiCards = [
    {
      title: 'ACADEMIC GPA',
      value: currentGpa,
      isNumeric: false,
      icon: <Award className="w-5 h-5 text-[#1E3B2F]" />,
      iconBg: 'bg-[#7F8C6A]/20 border border-[#7F8C6A]/40',
      description: 'University Grading Scale',
      barColor: 'bg-[#1E3B2F]',
      barHeights: [50, 70, 60, 85, 75, 95, 90],
    },
    {
      title: 'VERIFIED SKILLS',
      value: skillsCount,
      isNumeric: true,
      icon: <Sparkles className="w-5 h-5 text-[#1E3B2F]" />,
      iconBg: 'bg-[#C8B48A]/25 border border-[#C8B48A]/50',
      description: 'Core competencies',
      barColor: 'bg-[#7F8C6A]',
      barHeights: [35, 50, 45, 65, 55, 80, 70],
    },
    {
      title: 'FEATURED PROJECTS',
      value: projectsCount,
      isNumeric: true,
      icon: <Briefcase className="w-5 h-5 text-[#1E3B2F]" />,
      iconBg: 'bg-[#1E3B2F]/10 border border-[#1E3B2F]/20',
      description: 'Portfolio repositories',
      barColor: 'bg-[#C8B48A]',
      barHeights: [25, 40, 35, 60, 50, 75, 65],
    },
    {
      title: 'WORK EXPERIENCE',
      value: experienceCount,
      isNumeric: true,
      icon: <Clock className="w-5 h-5 text-[#1E3B2F]" />,
      iconBg: 'bg-[#7F8C6A]/20 border border-[#7F8C6A]/40',
      description: 'Internships & engagements',
      barColor: 'bg-[#1E3B2F]',
      barHeights: [40, 55, 45, 70, 60, 80, 75],
    },
    {
      title: 'CREDENTIALS',
      value: credentialsCount,
      isNumeric: true,
      icon: <ShieldCheck className="w-5 h-5 text-[#1E3B2F]" />,
      iconBg: 'bg-[#C8B48A]/25 border border-[#C8B48A]/50',
      description: 'Certificates & badges',
      barColor: 'bg-[#7F8C6A]',
      barHeights: [30, 45, 40, 65, 55, 75, 70],
    },
  ];

  // Quick Actions definitions
  const quickActions = [
    {
      icon: <Edit3 className="w-4 h-4 text-[#1E3B2F]" />,
      iconBg: 'bg-[#7F8C6A]/15',
      label: 'Edit Student Profile',
      subtitle: 'Update bio, contact & university details',
      onClick: () => setIsEditModalOpen(true),
    },
    {
      icon: <Search className="w-4 h-4 text-[#1E3B2F]" />,
      iconBg: 'bg-[#C8B48A]/20',
      label: 'Find Matching Internships',
      subtitle: 'Explore roles curated for your skill stack',
      onClick: () => navigate('/search'),
    },
    {
      icon: <UploadCloud className="w-4 h-4 text-[#1E3B2F]" />,
      iconBg: 'bg-emerald-50',
      label: profile?.cvUrl ? 'Update Resume (CV)' : 'Upload Resume (CV)',
      subtitle: 'Boost recruiter matching priority',
      onClick: () => sideCvInputRef.current?.click(),
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-[#1E3B2F]" />,
      iconBg: 'bg-[#7F8C6A]/15',
      label: 'Real-time Chat',
      subtitle: 'Communicate with company recruiters',
      onClick: () => navigate('/conversations'),
    },
    {
      icon: <Compass className="w-4 h-4 text-[#1E3B2F]" />,
      iconBg: 'bg-[#C8B48A]/20',
      label: 'Track Applications',
      subtitle: 'Review your recruitment pipeline',
      onClick: () => navigate('/applications'),
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-16">
      {/* Hidden CV file input for Quick Action trigger */}
      <input
        ref={sideCvInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUploadCv(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* ── Page Header (Matches Company & Internship Management Layout) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[11px] font-bold text-[#1E3B2F] uppercase tracking-widest mb-1">
            Student Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Student Portfolio &amp; Career Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your academic credentials, technical competencies, and career readiness.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => navigate('/search')}
            variant="secondary"
            size="md"
            className="gap-2 shadow-xs"
          >
            <Search className="w-4 h-4 text-[#1E3B2F]" /> Find Internships
          </Button>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="primary"
            size="md"
            className="gap-2 shadow-md px-5"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* ── Global Alerts ── */}
      {feedback.message && (
        <Alert type={feedback.type === 'success' ? 'success' : 'danger'}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </Alert>
      )}

      {/* ── Tab Navigation (Pill Style Matching Company Layout) ── */}
      <div className="bg-white p-1.5 rounded-xl border border-[#C8B48A]/35 shadow-xs w-fit max-w-full overflow-x-auto">
        <nav className="flex space-x-1" aria-label="Student Portfolio Navigation Tabs">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-3 sm:px-4 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3B2F]/20 select-none whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      isActive ? 'bg-[#1E3B2F]/80 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================
          TAB 1: DASHBOARD & OVERVIEW (MATCHES COMPANY STATS + 2 COLUMNS)
          ======================================================== */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          {/* Executive Hero Banner */}
          <ProfileHeader
            profile={profile}
            user={user}
            strengthData={strengthData}
            onEditClick={() => setIsEditModalOpen(true)}
            onUploadAvatar={handleUploadAvatar}
            onDeleteAvatar={handleDeleteAvatar}
            isUploadingAvatar={isUploadingAvatar}
            cvUrl={profile?.cvUrl}
            onUploadCv={handleUploadCv}
            onDeleteCv={handleDeleteCv}
            isUploadingCv={isUploadingCv}
            isDeletingCv={isDeletingCv}
          />

          {/* Key Overview Header + 5 Single KPI Cards Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1E3B2F]" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Key Overview</h3>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  — A quick snapshot of your academic performance and portfolio strength
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#1E3B2F] bg-[#F5F0E6] px-2.5 py-1 rounded-lg border border-[#C8B48A]/40 shadow-2xs">
                Academic Status: Active
              </span>
            </div>

            {/* 5 KPI Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {kpiCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#C8B48A]/40 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-[#1E3B2F]/40 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {card.title}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                    >
                      {card.icon}
                    </div>
                  </div>

                  <div className="my-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {card.isNumeric ? <AnimatedNumber value={card.value} /> : card.value}
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[100px]">
                      {card.description}
                    </span>
                    <MiniBar color={card.barColor} heights={card.barHeights} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column Responsive Layout Below KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (Wider 8/12): Main Sections in Exact 01-06 Sequence */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION 01: EDUCATION & DEGREE PATHWAY */}
              <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                      01
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Education &amp; Degree Pathway
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Academic Qualifications</span>
                </div>

                <EducationSection
                  education={profile?.education || []}
                  onSaveEducation={(education) => handleUpdateProfile({ education })}
                  isLoading={isSaving}
                />
              </section>

              {/* SECTION 02: TECHNICAL SKILLS & STACK */}
              <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                      02
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Technical Skills &amp; Stack
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Core Capabilities &amp; Expertise</span>
                </div>

                <SkillTagsSection
                  skills={profile?.skills || []}
                  onSaveSkills={(skills) => handleUpdateProfile({ skills })}
                  isLoading={isSaving}
                />
              </section>

              {/* SECTION 03: WORK & INTERNSHIP EXPERIENCE */}
              <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                      03
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Work &amp; Internship Experience
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Industry Roles &amp; Engagements</span>
                </div>

                <ExperienceSection
                  experience={profile?.experience || []}
                  onSaveExperience={(experience) => handleUpdateProfile({ experience })}
                  isLoading={isSaving}
                />
              </section>

              {/* SECTION 04: FEATURED WORK & PROJECTS */}
              <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                      04
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Featured Work &amp; Projects
                    </h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('projects')}
                    className="text-xs font-semibold text-[#1E3B2F] hover:underline flex items-center gap-1"
                  >
                    View All ({projectsCount}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ProjectsSection
                  projects={profile?.projects || []}
                  githubProfileUrl={profile?.links?.github}
                  onSaveProjects={(projects) => handleUpdateProfile({ projects })}
                  isLoading={isSaving}
                />
              </section>

              {/* SECTION 05: CERTIFICATES & DIGITAL BADGES */}
              <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                      05
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Certificates &amp; Digital Badges
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Verified Credentials</span>
                </div>

                <CertificatesBadgesSection
                  certificates={profile?.certificates || []}
                  badges={profile?.badges || []}
                  studentName={user?.name || profile?.user?.name}
                  onSaveCertificates={(certificates) => handleUpdateProfile({ certificates })}
                  onSaveBadges={(badges) => handleUpdateProfile({ badges })}
                  isLoading={isSaving}
                />
              </section>

              {/* SECTION 06: VERIFIED FACULTY EVALUATIONS & ENDORSEMENTS (REVIEWS) */}
              <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                      06
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Verified Faculty Evaluations &amp; Endorsements
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Academic Integrity &amp; Ratings</span>
                </div>

                {studentUserId ? (
                  <ReputationAndReviewsCard
                    targetId={studentUserId}
                    targetType="student"
                    title="Verified Academic Reputation &amp; Faculty Evaluations"
                  />
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    Faculty evaluations and review history will display here.
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT COLUMN (4/12): Quick Actions & Portfolio Readiness Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Actions Card (Exact Match with Company Dashboard Style) */}
              <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#1E3B2F]" />
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Quick Actions
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Shortcuts
                  </span>
                </div>

                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#7F8C6A]/40 hover:bg-[#F5F0E6]/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconBg}`}
                        >
                          {action.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#1E3B2F] transition-colors truncate">
                            {action.label}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {action.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E3B2F] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Portfolio Strength & Readiness Card */}
              <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C8B48A]" />
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Portfolio Readiness
                    </h4>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${strengthData.badgeStyle}`}
                  >
                    {strengthData.tier}
                  </span>
                </div>

                {/* Big Score Header */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-[#1E3B2F] tracking-tight">
                      {strengthData.score}%
                    </span>
                    <span className="text-xs text-slate-400 font-medium ml-1.5">Completeness</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    High Visibility
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7F8C6A] to-[#1E3B2F] h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${strengthData.score}%` }}
                  />
                </div>

                {/* Score Breakdown List */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Featured Projects (3+ required)</span>
                    <span className="font-bold text-slate-900">
                      {strengthData.breakdown.projects}/25 pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Faculty Evaluations</span>
                    <span className="font-bold text-slate-900">
                      {strengthData.breakdown.faculty}/20 pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Academic GPA &amp; Degree</span>
                    <span className="font-bold text-slate-900">
                      {strengthData.breakdown.academic}/20 pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Technical Competencies</span>
                    <span className="font-bold text-slate-900">
                      {strengthData.breakdown.skills}/20 pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Certificates, Badges &amp; CV</span>
                    <span className="font-bold text-slate-900">
                      {strengthData.breakdown.credentials}/15 pts
                    </span>
                  </div>
                </div>

                {/* Dynamic Tip Box */}
                {strengthData.tip && (
                  <div className="p-3 bg-[#F5F0E6]/60 border border-[#C8B48A]/40 rounded-xl text-xs text-[#1E3B2F] leading-relaxed">
                    {strengthData.tip}
                  </div>
                )}
              </div>

              {/* Verified Faculty Ratings & Academic Integrity Preview */}
              {studentUserId && (
                <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        Faculty Endorsements
                      </h4>
                    </div>
                    <button
                      onClick={() => handleTabChange('credentials')}
                      className="text-xs font-semibold text-[#1E3B2F] hover:underline"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-base font-black text-amber-800 leading-none">
                        {profile?.reputationScore ? profile.reputationScore.toFixed(1) : '5.0'}
                      </span>
                      <span className="text-[9px] text-amber-700 font-bold uppercase mt-0.5">Stars</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">
                        {profile?.reviewCount || 0} Verified Faculty Reviews
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Verified by departmental lecturers &amp; academic reviewers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PROJECTS & TECHNICAL SKILLS
          ======================================================== */}
      {currentTab === 'projects' && (
        <div className="space-y-6 animate-slide-up">
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  04
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Featured Work &amp; Projects
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Selected Works &amp; Live Demos</span>
            </div>

            <ProjectsSection
              projects={profile?.projects || []}
              githubProfileUrl={profile?.links?.github}
              onSaveProjects={(projects) => handleUpdateProfile({ projects })}
              isLoading={isSaving}
            />
          </section>

          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  02
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Technical Skills &amp; Stack
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Core Capabilities &amp; Expertise</span>
            </div>

            <SkillTagsSection
              skills={profile?.skills || []}
              onSaveSkills={(skills) => handleUpdateProfile({ skills })}
              isLoading={isSaving}
            />
          </section>
        </div>
      )}

      {/* ========================================================
          TAB 3: EDUCATION & WORK EXPERIENCE
          ======================================================== */}
      {currentTab === 'academics' && (
        <div className="space-y-6 animate-slide-up">
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  01
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Education &amp; Degree Pathway
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Academic Qualifications</span>
            </div>

            <EducationSection
              education={profile?.education || []}
              onSaveEducation={(education) => handleUpdateProfile({ education })}
              isLoading={isSaving}
            />
          </section>

          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  03
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Work &amp; Internship Experience
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Industry Roles &amp; Engagements</span>
            </div>

            <ExperienceSection
              experience={profile?.experience || []}
              onSaveExperience={(experience) => handleUpdateProfile({ experience })}
              isLoading={isSaving}
            />
          </section>
        </div>
      )}

      {/* ========================================================
          TAB 4: CERTIFICATES & FACULTY REVIEWS
          ======================================================== */}
      {currentTab === 'credentials' && (
        <div className="space-y-6 animate-slide-up">
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  05
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Certificates &amp; Digital Badges
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Verified Credentials</span>
            </div>

            <CertificatesBadgesSection
              certificates={profile?.certificates || []}
              badges={profile?.badges || []}
              studentName={user?.name || profile?.user?.name}
              onSaveCertificates={(certificates) => handleUpdateProfile({ certificates })}
              onSaveBadges={(badges) => handleUpdateProfile({ badges })}
              isLoading={isSaving}
            />
          </section>

          {studentUserId && (
            <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                    06
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Verified Faculty Evaluations &amp; Endorsements
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">Academic Integrity &amp; Ratings</span>
              </div>

              <ReputationAndReviewsCard
                targetId={studentUserId}
                targetType="student"
                title="Verified Academic Reputation & Faculty Evaluations"
              />
            </section>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 5: FULL PORTFOLIO (ALL SECTIONS SEQUENTIALLY)
          ======================================================== */}
      {currentTab === 'all' && (
        <div className="space-y-6 animate-slide-up">
          <ProfileHeader
            profile={profile}
            user={user}
            strengthData={strengthData}
            onEditClick={() => setIsEditModalOpen(true)}
            onUploadAvatar={handleUploadAvatar}
            onDeleteAvatar={handleDeleteAvatar}
            isUploadingAvatar={isUploadingAvatar}
            cvUrl={profile?.cvUrl}
            onUploadCv={handleUploadCv}
            onDeleteCv={handleDeleteCv}
            isUploadingCv={isUploadingCv}
            isDeletingCv={isDeletingCv}
          />

          {/* SECTION 01 */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  01
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Education &amp; Degree Pathway
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Academic Qualifications</span>
            </div>
            <EducationSection
              education={profile?.education || []}
              onSaveEducation={(education) => handleUpdateProfile({ education })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 02 */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  02
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Technical Skills &amp; Stack
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Core Capabilities &amp; Expertise</span>
            </div>
            <SkillTagsSection
              skills={profile?.skills || []}
              onSaveSkills={(skills) => handleUpdateProfile({ skills })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 03 */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  03
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Work &amp; Internship Experience
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Industry Roles &amp; Engagements</span>
            </div>
            <ExperienceSection
              experience={profile?.experience || []}
              onSaveExperience={(experience) => handleUpdateProfile({ experience })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 04 */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  04
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Featured Work &amp; Projects
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Selected Works &amp; Live Demos</span>
            </div>
            <ProjectsSection
              projects={profile?.projects || []}
              githubProfileUrl={profile?.links?.github}
              onSaveProjects={(projects) => handleUpdateProfile({ projects })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 05 */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  05
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Certificates &amp; Digital Badges
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Verified Credentials</span>
            </div>
            <CertificatesBadgesSection
              certificates={profile?.certificates || []}
              badges={profile?.badges || []}
              studentName={user?.name || profile?.user?.name}
              onSaveCertificates={(certificates) => handleUpdateProfile({ certificates })}
              onSaveBadges={(badges) => handleUpdateProfile({ badges })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 06 */}
          {studentUserId && (
            <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                    06
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Verified Faculty Evaluations &amp; Endorsements
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">Academic Integrity &amp; Ratings</span>
              </div>
              <ReputationAndReviewsCard
                targetId={studentUserId}
                targetType="student"
                title="Verified Academic Reputation & Faculty Evaluations"
              />
            </section>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        user={user}
        onSave={handleUpdateProfile}
        isLoading={isSaving}
      />
    </div>
  );
};

export default StudentPortfolioPage;
