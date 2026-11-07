import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { StudentApplicationHistory } from './StudentApplicationHistory';
import { CompanyApplicantReview } from './CompanyApplicantReview';
import { ApplyModal } from './ApplyModal';
import applicationsApi from './applicationsApi';
import {
  User,
  Building2,
  PlusCircle,
  RotateCcw,
  Info,
} from 'lucide-react';

export const ApplicationsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCompany = user?.role === 'company';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const canSwitchPortal = !user || isAdmin;

  // Active view: Strictly role-adaptive
  const [activeTab, setActiveTab] = useState(() => {
    if (isCompany) return 'company';
    return 'student';
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [applyModalInternship, setApplyModalInternship] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Keep activeTab strictly locked to role when authenticated
  useEffect(() => {
    if (isCompany) {
      setActiveTab('company');
    } else if (isStudent) {
      setActiveTab('student');
    }
  }, [isCompany, isStudent]);

  // Auto-detect preselected internship passed from Search & Matching (/search)
  // Strictly prevent company recruiter from opening student apply modal
  useEffect(() => {
    if (location.state?.preselectedInternship) {
      if (user?.role === 'student' || (!user && !isCompany)) {
        setApplyModalInternship(location.state.preselectedInternship);
        setIsApplyModalOpen(true);
        setActiveTab('student');
      }
    }
  }, [location.state, user, isCompany]);

  const handleApplicationSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all local application demo data to initial defaults?')) {
      applicationsApi.resetLocalStore();
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#C8B48A]/30">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-[#1E3B2F] tracking-tight">
              Application & Recruitment Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isCompany
              ? 'Review candidate applications and manage recruitment stages for your posted internships'
              : 'Track submitted internship applications, review statuses, and discover new placements'}
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Switcher: Only visible for unauthenticated guests or admins */}
          {canSwitchPortal && (
            <div className="inline-flex p-1 bg-[#F5F0E6] rounded-xl border border-[#C8B48A]/40 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'student'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-[#1E3B2F] hover:bg-[#EBE2D1]/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'company'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-[#1E3B2F] hover:bg-[#EBE2D1]/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Recruiter Portal</span>
              </button>
            </div>
          )}

          {activeTab === 'student' && !isCompany && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsApplyModalOpen(true)}
                className="gap-1.5 text-xs bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] border border-[#1E3B2F] shadow-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Apply for Internship
              </Button>

              <button
                type="button"
                onClick={handleResetDemoData}
                title="Reset local demo data"
                className="p-1.5 text-slate-500 hover:text-[#1E3B2F] hover:bg-[#F5F0E6] rounded-lg border border-[#C8B48A]/40 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Seamless Backend / Demo Status Hint Banner (Luxury Forest Theme) */}
      <div className="bg-[#F5F0E6]/90 border border-[#C8B48A]/50 border-l-4 border-l-[#1E3B2F] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#1E3B2F] shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1E3B2F] flex-shrink-0" />
          <span>
            <strong>Dual-Engine Architecture:</strong> Real-time recruitment pipeline synchronized with backend REST APIs and resilient local-preview store.
          </span>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-[#F5F0E6] bg-[#1E3B2F] px-2.5 py-0.5 rounded-lg border border-[#152A22]">
          Ready to Run
        </span>
      </div>

      {/* 3. Main Tab View */}
      {activeTab === 'company' ? (
        <CompanyApplicantReview onStatusChange={handleApplicationSuccess} />
      ) : (
        <StudentApplicationHistory
          refreshTrigger={refreshTrigger}
          onBrowseInternships={() => navigate('/search')}
        />
      )}

      {/* 4. Apply Modal (Only available for students or unauthenticated users) */}
      {!isCompany && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setApplyModalInternship(null);
          }}
          internship={applyModalInternship}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;
