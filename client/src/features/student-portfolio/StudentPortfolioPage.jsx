import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import studentPortfolioService from './services/studentPortfolioService';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SkillTagsSection } from './components/SkillTagsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CvUploader } from './components/CvUploader';
import { EducationExperienceSection } from './components/EducationExperienceSection';
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 font-medium">Loading your student career portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
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

      {/* Main Profile Header Card */}
      <ProfileHeader
        profile={profile}
        user={user}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Grid Layout: Left / Right Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Skills & CV Uploader) */}
        <div className="space-y-6">
          <CvUploader
            cvUrl={profile?.cvUrl}
            onUploadCv={handleUploadCv}
            isLoading={isUploadingCv}
          />

          <SkillTagsSection
            skills={profile?.skills || []}
            onSaveSkills={(skills) => handleUpdateProfile({ skills })}
            isLoading={isSaving}
          />

          <CertificatesBadgesSection
            certificates={profile?.certificates || []}
            badges={profile?.badges || []}
            onSaveCertificates={(certificates) => handleUpdateProfile({ certificates })}
            isLoading={isSaving}
          />
        </div>

        {/* Right Column (Featured Projects & Education / Experience) */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectsSection
            projects={profile?.projects || []}
            onSaveProjects={(projects) => handleUpdateProfile({ projects })}
            isLoading={isSaving}
          />

          <EducationExperienceSection
            education={profile?.education || []}
            experience={profile?.experience || []}
            onSaveEducation={(education) => handleUpdateProfile({ education })}
            onSaveExperience={(experience) => handleUpdateProfile({ experience })}
            isLoading={isSaving}
          />
        </div>
      </div>

      {/* Verified Academic Reputation & Reviews Card */}
      {user?._id && (
        <div className="mt-8">
          <ReputationAndReviewsCard
            targetId={user._id}
            targetType="student"
            title="Verified Academic Reputation & Faculty Evaluations"
          />
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
