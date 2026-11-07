import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const sideCvInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isDeletingCv, setIsDeletingCv] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await studentPortfolioService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Failed to load profile. Please refresh.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 5000);
  };

  const handleUpdateProfile = async (updateData) => {
    try {
      setIsSaving(true);
      const updated = await studentPortfolioService.updateMyProfile(updateData);
      setProfile(updated);
      if (updated?.user?.name && user) {
        user.name = updated.user.name;
        try {
          const stored = localStorage.getItem('internbridge_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              'internbridge_user',
              JSON.stringify({ ...parsed, name: updated.user.name })
            );
          }
        } catch {
          // ignore storage error
        }
      }
      setIsEditModalOpen(false);
      showFeedback('success', 'Profile updated successfully!');
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCv = async (file) => {
    try {
      setIsUploadingCv(true);
      const result = await studentPortfolioService.uploadCv(file);
      if (result?.profile) {
        setProfile(result.profile);
      } else if (result?.cvUrl) {
        setProfile((prev) => ({ ...prev, cvUrl: result.cvUrl }));
      }
      showFeedback('success', 'CV uploaded successfully to your profile!');
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to upload CV.');
      throw err;
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleDeleteCv = async () => {
    try {
      setIsDeletingCv(true);
      const result = await studentPortfolioService.deleteCv();
      if (result?.profile) {
        setProfile(result.profile);
      } else {
        setProfile((prev) => ({ ...prev, cvUrl: null }));
      }
      showFeedback('success', 'CV removed successfully from your profile.');
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to delete CV.');
      throw err;
    } finally {
      setIsDeletingCv(false);
    }
  };

  const handleUploadAvatar = async (file) => {
    try {
      setIsUploadingAvatar(true);
      const result = await studentPortfolioService.uploadAvatar(file);
      if (result?.profile) {
        setProfile(result.profile);
      }
      if (result?.avatarUrl && user) {
        user.avatarUrl = result.avatarUrl;
        try {
          const stored = localStorage.getItem('internbridge_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              'internbridge_user',
              JSON.stringify({ ...parsed, avatarUrl: result.avatarUrl })
            );
          }
        } catch {
          // ignore storage error
        }
      }
      showFeedback('success', 'Profile photo updated successfully!');
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      const result = await studentPortfolioService.deleteAvatar();
      if (result?.profile) {
        setProfile(result.profile);
      }
      if (user) {
        user.avatarUrl = null;
        try {
          const stored = localStorage.getItem('internbridge_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              'internbridge_user',
              JSON.stringify({ ...parsed, avatarUrl: null })
            );
          }
        } catch {
          // ignore storage error
        }
      }
      showFeedback('success', 'Profile photo removed.');
    } catch (err) {
      showFeedback('danger', err.message || 'Failed to remove profile photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 font-medium">Loading your student career portfolio...</p>
      </div>
    );
  }

  // Key Overview Metric definitions
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const experienceCount = profile?.experience?.length || 0;
  const credentialsCount = (profile?.certificates?.length || 0) + (profile?.badges?.length || 0);
  const currentGpa = profile?.gpa ? Number(profile.gpa).toFixed(2) : '3.82';
  const studentUserId =
    user?.id ||
    user?._id ||
    profile?.user?._id ||
    (typeof profile?.user === 'string' ? profile?.user : null);

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

  return (
    <div className="portfolio-scope space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* Top Notification Feedback */}
      {feedback.message && (
        <Alert type={feedback.type}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </Alert>
      )}

      {/* 1. Main Executive Hero Profile Banner */}
      <ProfileHeader
        profile={profile}
        user={user}
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

      {/* 2. Key Overview Section (Matching Screenshot's KPI Metric Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#1E3B2F]" />
            <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">Key Overview</h2>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              — A quick snapshot of your academic performance and portfolio strength
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#1E3B2F] bg-[#F5F0E6] px-2.5 py-1 rounded-lg border border-[#C8B48A]/40 shadow-2xs">
            Academic Status: Active
          </span>
        </div>

        {/* 5 KPI Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {kpiCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#C8B48A]/40 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-[#1E3B2F]/40 transition-all group"
            >
              {/* Card Header: Title + Icon */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  {card.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                >
                  {card.icon}
                </div>
              </div>

              {/* Card Middle: Big Value */}
              <div className="my-2.5">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {card.isNumeric ? <AnimatedNumber value={card.value} /> : card.value}
                </span>
              </div>

              {/* Card Footer: Subtitle + Sparkline MiniBar */}
              <div className="flex items-end justify-between pt-1 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 font-medium truncate max-w-[100px]">
                  {card.description}
                </span>
                <MiniBar color={card.barColor} heights={card.barHeights} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Grid (Two-Column Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Primary Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION 01: EDUCATION & QUALIFICATIONS */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  01
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Education & Degree Pathway
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
                  Technical Skills & Stack
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Core Capabilities & Expertise</span>
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
                  Work & Internship Experience
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Industry Roles & Engagements</span>
            </div>

            <ExperienceSection
              experience={profile?.experience || []}
              onSaveExperience={(experience) => handleUpdateProfile({ experience })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 04: FEATURED PROJECTS */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  04
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Featured Work & Projects
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">Selected Works & Live Demos</span>
            </div>

            <ProjectsSection
              projects={profile?.projects || []}
              githubProfileUrl={profile?.links?.github}
              onSaveProjects={(projects) => handleUpdateProfile({ projects })}
              isLoading={isSaving}
            />
          </section>

          {/* SECTION 05: CERTIFICATES & CREDENTIALS */}
          <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                  05
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Certificates & Digital Badges
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

          {/* SECTION 06: FACULTY REPUTATION & REVIEWS */}
          {studentUserId && (
            <section className="space-y-3 bg-white border border-[#C8B48A]/35 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2 py-0.5 rounded-lg border border-[#7F8C6A]/30">
                    06
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Verified Faculty Evaluations & Endorsements
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">Academic Integrity & Ratings</span>
              </div>

              <ReputationAndReviewsCard
                targetId={studentUserId}
                targetType="student"
                title="Verified Academic Reputation & Faculty Evaluations"
              />
            </section>
          )}
        </div>

        {/* Right Column (4 cols): Quick Actions & Career Tools (Matching Screenshot) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Quick Actions Card */}
          <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#7F8C6A]/15 border border-[#7F8C6A]/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#1E3B2F]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Quick Actions</h3>
                  <p className="text-[11px] text-gray-500">Accelerate your internship search</p>
                </div>
              </div>
            </div>

            {/* Hidden resume input for quick action */}
            <input
              ref={sideCvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUploadCv(e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />

            {/* Action Item 1: Upload / Replace CV */}
            <button
              type="button"
              onClick={() => sideCvInputRef.current?.click()}
              disabled={isUploadingCv}
              className="w-full text-left p-3.5 rounded-xl border border-gray-200/90 hover:border-[#1E3B2F]/40 hover:bg-[#F5F0E6]/30 flex items-center justify-between gap-3 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7F8C6A]/15 text-[#1E3B2F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#1E3B2F] transition-colors">
                    {profile?.cvUrl ? 'Replace Resume (CV)' : 'Upload Resume (CV)'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isUploadingCv ? 'Uploading to cloud...' : 'Reach verified corporate recruiters'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E3B2F] transition-colors" />
            </button>

            {/* Action Item 2: Edit Profile */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="w-full text-left p-3.5 rounded-xl border border-gray-200/90 hover:border-[#1E3B2F]/40 hover:bg-[#F5F0E6]/30 flex items-center justify-between gap-3 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C8B48A]/25 text-[#1E3B2F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#1E3B2F] transition-colors">
                    Update Profile Details
                  </p>
                  <p className="text-[11px] text-gray-500">Keep bio, GPA, and socials updated</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E3B2F] transition-colors" />
            </button>

            {/* Action Item 3: Explore Internships */}
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="w-full text-left p-3.5 rounded-xl border border-gray-200/90 hover:border-[#1E3B2F]/40 hover:bg-[#F5F0E6]/30 flex items-center justify-between gap-3 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1E3B2F]/10 text-[#1E3B2F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#1E3B2F] transition-colors">
                    Search Internships
                  </p>
                  <p className="text-[11px] text-gray-500">Discover top algorithmic matches</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E3B2F] transition-colors" />
            </button>

            {/* Action Item 4: Real-time Messages */}
            <button
              type="button"
              onClick={() => navigate('/chat')}
              className="w-full text-left p-3.5 rounded-xl border border-gray-200/90 hover:border-[#1E3B2F]/40 hover:bg-[#F5F0E6]/30 flex items-center justify-between gap-3 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7F8C6A]/15 text-[#1E3B2F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#1E3B2F] transition-colors">
                    Direct Recruiter Chat
                  </p>
                  <p className="text-[11px] text-gray-500">Connect with hiring managers live</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E3B2F] transition-colors" />
            </button>
          </div>

          {/* Profile Strength Card */}
          <div className="bg-gradient-to-br from-[#F5F0E6] to-[#EAE2D2] border border-[#C8B48A]/40 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3B2F]">
                Portfolio Strength
              </span>
              <span className="text-xs font-bold text-[#1E3B2F] bg-white px-2 py-0.5 rounded-md border border-[#C8B48A]/40">
                {profile?.cvUrl && skillsCount >= 5 && projectsCount >= 1 ? 'Strong (95%)' : 'Good (80%)'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1E3B2F]/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#1E3B2F] h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${profile?.cvUrl && skillsCount >= 5 && projectsCount >= 1 ? 95 : 80}%`,
                }}
              />
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">
              Your profile is verified and prioritized for algorithmic candidate matching by partner companies.
            </p>
          </div>
        </div>
      </div>

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
