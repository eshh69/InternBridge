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
  Briefcase,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export const ApplicationsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active view: Defaults to user's real role if logged in ('student' | 'company'), else 'student'
  const [activeTab, setActiveTab] = useState(
    user?.role === 'company' ? 'company' : 'student'
  );

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [applyModalInternship, setApplyModalInternship] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Auto-detect preselected internship passed from Search & Matching (/search)
  useEffect(() => {
    if (location.state?.preselectedInternship) {
      setApplyModalInternship(location.state.preselectedInternship);
      setIsApplyModalOpen(true);
      setActiveTab('student');
    }
  }, [location.state]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Application & Recruitment Tracker
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 !rounded-none bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              Module 4 (SEU/IS/22/ICT/030)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete student application management and company recruiter evaluation portal
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Switcher allowing testing of both Student and Recruiter views with sharp corners & blue theme */}
          <div className="inline-flex p-1 bg-slate-100 !rounded-none border border-slate-300 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 !rounded-none transition-all ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 !rounded-none transition-all ${
                activeTab === 'company'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Recruiter Portal</span>
            </button>
          </div>

          {activeTab === 'student' && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsApplyModalOpen(true)}
                className="gap-1.5 text-xs !rounded-none !bg-blue-600 hover:!bg-blue-700 !border-blue-600 text-white shadow-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Apply for Internship
              </Button>

              <button
                type="button"
                onClick={handleResetDemoData}
                title="Reset local demo data"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 !rounded-none border border-slate-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Seamless Backend / Demo Status Hint Banner (Sharp Blue Theme) */}
      <div className="bg-blue-50/90 border border-blue-200 border-l-4 border-l-blue-600 !rounded-none p-3.5 flex items-center justify-between text-xs text-blue-950 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>Dual-Engine Architecture:</strong> Currently running in resilient instant-preview mode. Any application submissions or recruiter evaluations persist in real-time. When the backend server is booted, it automatically connects to MongoDB endpoints.
          </span>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-white bg-blue-600 px-2.5 py-0.5 !rounded-none border border-blue-700">
          Ready to Run
        </span>
      </div>

      {/* 3. Main Tab View */}
      {activeTab === 'student' ? (
        <StudentApplicationHistory
          refreshTrigger={refreshTrigger}
          onBrowseInternships={() => navigate('/search')}
        />
      ) : (
        <CompanyApplicantReview onStatusChange={handleApplicationSuccess} />
      )}

      {/* 4. Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setApplyModalInternship(null);
        }}
        internship={applyModalInternship}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
};

export default ApplicationsPage;
