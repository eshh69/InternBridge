import React, { useState, useEffect, useCallback } from 'react';
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
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ReputationAndReviewsCard } from '../verification-rating';

export const StudentPortfolioPage = () => {
  const { user } = useAuth();
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

  return (
    <div className="portfolio-scope space-y-8 w-full mx-auto pb-16">
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

      {/* Main Profile Header Showcase */}
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

      {/* SECTION 01: EDUCATION & CERTIFICATIONS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              01
            </span>
            <h2 className="text-sm font-black text-gray-900 tracking-tight">
              Education & Certifications
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">Academic Qualifications & Professional Credentials</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <EducationSection
            education={profile?.education || []}
            onSaveEducation={(education) => handleUpdateProfile({ education })}
            isLoading={isSaving}
          />

          <CertificatesBadgesSection
            certificates={profile?.certificates || []}
            badges={profile?.badges || []}
            studentName={user?.name || profile?.user?.name}
            onSaveCertificates={(certificates) => handleUpdateProfile({ certificates })}
            onSaveBadges={(badges) => handleUpdateProfile({ badges })}
            isLoading={isSaving}
          />
        </div>
      </section>

      {/* SECTION 02: TECHNICAL SKILLS & STACK */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              02
            </span>
            <h2 className="text-sm font-black text-gray-900 tracking-tight">
              Technical Skills & Stack
            </h2>
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
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              03
            </span>
            <h2 className="text-sm font-black text-gray-900 tracking-tight">
              Work & Internship Experience
            </h2>
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
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              04
            </span>
            <h2 className="text-sm font-black text-gray-900 tracking-tight">
              Featured Work & Projects
            </h2>
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

      {/* SECTION 05: FACULTY REPUTATION & REVIEWS */}
      {user?._id && (
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                05
              </span>
              <h2 className="text-sm font-black text-gray-900 tracking-tight">
                Verified Faculty Evaluations & Endorsements
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Academic Integrity & Ratings</span>
          </div>

          <ReputationAndReviewsCard
            targetId={user._id}
            targetType="student"
            title="Verified Academic Reputation & Faculty Evaluations"
          />
        </section>
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
