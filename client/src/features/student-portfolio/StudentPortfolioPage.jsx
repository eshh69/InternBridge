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

  // Comprehensive Challenging Portfolio Readiness Score Calculation (100-Point Model)
  const calculatePortfolioStrength = (profile, user) => {
    if (!profile) {
      return {
        score: 40,
        tier: 'Developing',
        label: 'Developing (40%)',
        badgeStyle: 'bg-gray-100 text-gray-700 border-gray-300',
        tip: '💡 Complete your core profile information to build strength.',
        breakdown: { projects: 0, faculty: 0, academic: 0, skills: 0, credentials: 0 },
      };
    }

    let score = 0;

    // 1. Demonstrated Projects Portfolio (Max 25 pts) — Min 3 projects required for full volume marks
    const projects = profile.projects || [];
    const pCount = projects.length;
    let projectPts = 0;
    if (pCount >= 3) projectPts += 12;
    else if (pCount === 2) projectPts += 8;
    else if (pCount === 1) projectPts += 4;

    const hasGithubProject = projects.some((p) => Boolean(p?.githubUrl && p.githubUrl.trim()));
    if (hasGithubProject) projectPts += 7;

    const hasLiveOrDemo = projects.some((p) => Boolean(p?.projectUrl && p.projectUrl.trim()));
    if (hasLiveOrDemo) projectPts += 6;
    score += Math.min(25, projectPts);

    // 2. Verified Faculty / Third-Party Review (Max 20 pts)
    const reviewCount = profile.reviewCount || 0;
    const reputationScore = profile.reputationScore || 0;
    let reviewPts = 0;
    if (reviewCount >= 1) reviewPts += 10;
    if (reputationScore >= 80) reviewPts += 10;
    else if (reputationScore >= 60) reviewPts += 6;
    else if (reputationScore > 0) reviewPts += 3;
    score += Math.min(20, reviewPts);

    // 3. Academic Integrity & GPA (Max 20 pts)
    let academicPts = 0;
    if (profile.degree && profile.university) academicPts += 5;
    const parsedGpa = profile.gpa ? parseFloat(profile.gpa) : null;
    if (parsedGpa !== null && !isNaN(parsedGpa)) {
      if (parsedGpa >= 3.7) academicPts += 15;
      else if (parsedGpa >= 3.3) academicPts += 10;
      else if (parsedGpa >= 3.0) academicPts += 6;
      else academicPts += 3;
    } else {
      academicPts += 5;
    }
    score += Math.min(20, academicPts);

    // 4. Technical Skill Breadth & Depth (Max 20 pts)
    const skills = profile.skills || [];
    const sCount = skills.length;
    let skillPts = 0;
    if (sCount >= 8) skillPts += 10;
    else if (sCount >= 5) skillPts += 7;
    else if (sCount >= 1) skillPts += 4;

    const skillStrings = skills.map((s) => (typeof s === 'string' ? s : s?.name || '').toLowerCase());
    const hasWebOrFrontend = skillStrings.some((s) =>
      /react|vue|angular|html|css|tailwind|javascript|typescript|next/.test(s)
    );
    const hasBackendOrDb = skillStrings.some((s) =>
      /node|express|python|java|sql|mongo|postgres|c#|\.net|php|django|spring/.test(s)
    );
    if (hasWebOrFrontend && hasBackendOrDb) {
      skillPts += 10;
    } else if (sCount >= 4) {
      skillPts += 5;
    }
    score += Math.min(20, skillPts);

    // 5. Professional Credentials & Online Presence (Max 15 pts)
    let credPts = 0;
    if (profile.cvUrl) credPts += 5;
    const hasAvatar = Boolean(user?.avatarUrl || profile.user?.avatarUrl);
    if (hasAvatar) credPts += 5;
    const links = profile.links || {};
    if (links.github || links.linkedin || links.portfolio) credPts += 5;
    score += Math.min(15, credPts);

    const finalScore = Math.min(100, Math.max(10, Math.round(score)));

    // Tier definitions & Smart Hint
    let tier = 'Developing';
    let label = `Developing (${finalScore}%)`;
    let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-300';
    let tip = '';

    if (finalScore >= 90) {
      tier = 'Elite';
      label = `Elite (${finalScore}%)`;
      badgeStyle = 'bg-[#1E3B2F] text-[#F5F0E6] border-[#152A22]';
      tip = '🌟 Exceptional standing! Top tier priority in recruiter search algorithms.';
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

      {/* 3. Key Overview Section: 5 Separate Single Metric Cards in a Grid */}
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

        {/* 5 Individual KPI Metric Cards Row */}
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
      
{/* 4. Primary Portfolio Sections 01 through 06 (Full Width) */}
      <div className="w-full space-y-8">
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
