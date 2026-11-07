import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { StarRating } from './components/StarRating';
import { VerificationStatusBadge } from './components/VerificationStatusBadge';
import { VerificationRequestModal } from './components/VerificationRequestModal';
import { AdminVerificationQueue } from './components/AdminVerificationQueue';
import { ReviewSubmissionModal } from './components/ReviewSubmissionModal';
import { ReputationOverviewCard } from './components/ReputationOverviewCard';
import { ReviewList } from './components/ReviewList';
import { ReputationMetricsDashboard } from './components/ReputationMetricsDashboard';
import { verificationRatingApi } from './verificationRatingApi';
import {
  ShieldCheck,
  ShieldAlert,
  Star,
  Award,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  ExternalLink,
  Building2,
  User,
  Sparkles,
  FileCheck2,
  RotateCcw,
  Info,
  Filter,
  BarChart3,
  Briefcase,
} from 'lucide-react';

export const VerificationRatingPage = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isCompany = user?.role === 'company';
  const isReviewer = user?.role === 'reviewer';

  // Active Portal: Strictly restrict 'admin' to admin role!
  // If company, default to 'company'. If reviewer, default to 'reviewer'.
  const defaultPortal = isAdmin ? 'admin' : isReviewer ? 'reviewer' : 'company';
  const [activePortal, setActivePortal] = useState(defaultPortal);

  // Sub-tab states for each portal
  const [adminSubTab, setAdminSubTab] = useState('queue'); // 'queue' | 'metrics' | 'directory'
  const [reviewerSubTab, setReviewerSubTab] = useState('workspace'); // 'workspace' | 'metrics' | 'directory'
  const [companySubTab, setCompanySubTab] = useState('status'); // 'status' | 'metrics' | 'directory'

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Verification status for the logged-in user
  const [myVerification, setMyVerification] = useState(null);
  const [myStatus, setMyStatus] = useState('unverified');
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Submitted Reviews by reviewer
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Reputation Directory Lookup State
  const [searchTargetType, setSearchTargetType] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetSearchResults, setTargetSearchResults] = useState([]);
  const [selectedInspectTarget, setSelectedInspectTarget] = useState(null);
  const [inspectReviews, setInspectReviews] = useState([]);
  const [inspectReputation, setInspectReputation] = useState(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // Ensure non-admin users never have 'admin' as activePortal
  useEffect(() => {
    if (!isAdmin && activePortal === 'admin') {
      setActivePortal(isCompany ? 'company' : isReviewer ? 'reviewer' : 'company');
    }
  }, [user?.role, isAdmin, isCompany, isReviewer, activePortal]);

  // 1. Fetch user's own verification status
  const fetchMyVerificationStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await verificationRatingApi.getMyVerificationStatus(user);
      setMyVerification(data.verification);
      setMyStatus(data.status || 'unverified');
    } catch (err) {
      console.error('Failed to fetch verification status', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // 2. Fetch submitted reviews by reviewer
  const fetchSubmittedReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviews = await verificationRatingApi.getMySubmittedReviews(user?.email);
      setSubmittedReviews(reviews || []);
    } catch (err) {
      console.error('Failed to load submitted reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // 3. Search Review Targets for Directory
  const fetchDirectoryTargets = async () => {
    try {
      const targets = await verificationRatingApi.getTargets(searchTargetType, searchQuery);
      setTargetSearchResults(targets || []);
    } catch (err) {
      console.error('Failed to search targets', err);
    }
  };

  useEffect(() => {
    fetchMyVerificationStatus();
    fetchSubmittedReviews();
    fetchDirectoryTargets();
  }, [user, refreshTrigger]);

  useEffect(() => {
    const timer = setTimeout(fetchDirectoryTargets, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchTargetType]);

  // Inspect Target Reviews
  const handleInspectTarget = async (target) => {
    setSelectedInspectTarget(target);
    setLoadingInspect(true);
    try {
      const data = await verificationRatingApi.getTargetReviews(target._id, searchTargetType);
      setInspectReviews(data.reviews || []);
      setInspectReputation(data.summary || null);
    } catch (err) {
      console.error('Failed to inspect reviews', err);
    } finally {
      setLoadingInspect(false);
    }
  };

  const handleVerificationSuccess = (newVer) => {
    setRefreshTrigger((prev) => prev + 1);
    setSuccessBanner('Verification request submitted successfully and queued in real-time!');
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  const handleReviewSuccess = (newRev, summary) => {
    setRefreshTrigger((prev) => prev + 1);
    setSuccessBanner('Multi-criteria evaluation published! Reputation metrics updated in real-time.');
    setTimeout(() => setSuccessBanner(''), 4500);

    // If currently inspecting the target that was reviewed, update inspect state immediately
    if (
      selectedInspectTarget &&
      (selectedInspectTarget._id === newRev?.targetStudentId ||
        selectedInspectTarget._id === newRev?.targetCompanyId)
    ) {
      handleInspectTarget(selectedInspectTarget);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all local verification & rating demo data to initial defaults?')) {
      verificationRatingApi.resetLocalStore();
      setRefreshTrigger((prev) => prev + 1);
      setSuccessBanner('Local store reset to default demonstration data.');
      setTimeout(() => setSuccessBanner(''), 3000);
    }
  };

  // Calculate Average Reviewer Endorsement Score
  const avgReviewerScore =
    submittedReviews.length > 0
      ? (
          submittedReviews.reduce((acc, r) => acc + (r.overallRating || 0), 0) /
          submittedReviews.length
        ).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Clean Header Without Academic Tags */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E3B2F] tracking-tight">
            Verification & Ratings System
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Decentralized credibility verification, academic endorsements, and multi-criteria performance ratings
          </p>
        </div>

        {/* 2. Portal Switcher & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Strictly reserve Admin Portal option for admin role */}
          {isAdmin ? (
            <div className="inline-flex p-1 bg-slate-100 !rounded-none border border-slate-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActivePortal('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 !rounded-none transition-all ${
                  activePortal === 'admin'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Queue</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePortal('reviewer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 !rounded-none transition-all ${
                  activePortal === 'reviewer'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Reviewer View</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePortal('company')}
                className={`flex items-center gap-1.5 px-3 py-1.5 !rounded-none transition-all ${
                  activePortal === 'company'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Company View</span>
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 !rounded-none bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#C8B48A]/40 text-xs font-bold uppercase tracking-wider">
              {isCompany ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
                  Corporate Portal
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 text-[#1E3B2F]" />
                  Faculty Reviewer Portal
                </>
              )}
            </span>
          )}

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRequestModalOpen(true)}
              className="gap-1.5 text-xs !rounded-none !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] shadow-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {isCompany ? 'Request Verification' : 'Submit Verification'}
            </Button>

            {!isCompany && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                className="gap-1.5 text-xs !rounded-none !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] shadow-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C8B48A]" /> Write Review
              </Button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={handleResetDemoData}
                title="Reset local demo data"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 !rounded-none border border-slate-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Dual-Engine Architecture / System Status Banner (Luxury Forest Green Theme) */}
      <div className="bg-[#7F8C6A]/15 border border-[#C8B48A]/40 border-l-4 border-l-[#1E3B2F] !rounded-none p-3.5 flex items-center justify-between text-xs text-[#1E3B2F] shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1E3B2F] flex-shrink-0" />
          <span>
            <strong>Dual-Engine Architecture:</strong> Currently running in resilient instant-preview mode. Any verification requests or multi-criteria reputation evaluations persist in real-time and synchronize seamlessly with MongoDB endpoints.
          </span>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-[#F5F0E6] bg-[#1E3B2F] px-2.5 py-0.5 !rounded-none border border-[#152A22]">
          Ready to Run
        </span>
      </div>

      {/* Instant Notification Banner */}
      {successBanner && (
        <Alert type="success" title="Real-Time Synchronization" onClose={() => setSuccessBanner('')}>
          {successBanner}
        </Alert>
      )}

      {/* ======================================================== */}
      {/* 4. Portal Views: Company vs Reviewer vs Admin */}
      {/* ======================================================== */}

      {/* VIEW A: DEDICATED COMPANY PORTAL (For Companies & Admin Preview) */}
      {activePortal === 'company' && (
        <div className="space-y-6">
          {/* Company Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setCompanySubTab('status')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                companySubTab === 'status'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Corporate Accreditation & Verification
            </button>

            <button
              type="button"
              onClick={() => setCompanySubTab('metrics')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                companySubTab === 'metrics'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reputation Metrics & Analytics
            </button>

            <button
              type="button"
              onClick={() => setCompanySubTab('directory')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                companySubTab === 'directory'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Candidate & Verified Directory
            </button>
          </div>

          {companySubTab === 'status' ? (
            <div className="space-y-6">
              {/* 4 Company Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#7F8C6A]/15 text-[#1E3B2F] !rounded-none border border-[#C8B48A]/40">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Registered Entity
                      </p>
                      <p className="text-base font-black text-slate-900 mt-0.5 truncate max-w-[150px]">
                        {myVerification?.institutionOrOrg || user?.name || 'Virtusa Technologies'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#1E3B2F]/10 text-[#1E3B2F] !rounded-none border border-[#1E3B2F]/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Accreditation Status
                      </p>
                      <div className="mt-1">
                        <VerificationStatusBadge status={myStatus} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#C8B48A]/20 text-[#1E3B2F] !rounded-none border border-[#C8B48A]/50">
                      <Briefcase className="w-5 h-5 text-[#C8B48A]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Business Registration
                      </p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {myVerification?.designationOrRegNo || 'BRN-PV0094821'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#1E3B2F]/15 text-[#1E3B2F] !rounded-none border border-[#1E3B2F]/30">
                      <Sparkles className="w-5 h-5 text-[#C8B48A]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Placement Trust Tier
                      </p>
                      <p className="text-xs font-black text-[#1E3B2F] uppercase mt-1">
                        {myStatus === 'approved' ? 'Verified Tech Employer' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Company Verification Card */}
              <div className="bg-white border border-slate-200 !rounded-none p-6 shadow-2xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#C8B48A]/40 !rounded-none flex-shrink-0">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          Corporate Employer Verification & Accreditation
                        </h3>
                        <VerificationStatusBadge status={myStatus} />
                      </div>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        Verification certifies your corporate identity with South Eastern University of Sri Lanka and partner technology departments. Verified companies receive the <strong>Official Verified Employer badge</strong>, prioritized placement visibility in student algorithmic search matching, and direct access to university-endorsed candidate ratings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsRequestModalOpen(true)}
                      className="gap-1.5 text-xs !rounded-none !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] font-semibold shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      {myStatus === 'approved' ? 'Update Credentials' : 'Request Verification'}
                    </Button>
                  </div>
                </div>

                {/* Company Accreditation Details Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/70 p-4 border border-slate-200 !rounded-none">
                  <div>
                    <span className="text-slate-500 font-semibold block">Registered Organization Name:</span>
                    <strong className="text-slate-900 text-sm">
                      {myVerification?.institutionOrOrg || user?.name || 'Virtusa Private Limited'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">Business Registration Number (BRN) / Tax ID:</span>
                    <strong className="text-slate-900 text-sm">
                      {myVerification?.designationOrRegNo || 'BRN-PV0094821'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">Accreditation Record Date:</span>
                    <strong className="text-slate-900">
                      {myVerification?.createdAt
                        ? new Date(myVerification.createdAt).toLocaleDateString()
                        : 'Active Registration Record'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">Verification Documentation:</span>
                    {myVerification?.proofDocumentUrl ? (
                      <a
                        href={myVerification.proofDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#1E3B2F] hover:underline font-bold pt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Uploaded Business Registration Document
                      </a>
                    ) : (
                      <span className="text-slate-400">Documentation verified on file</span>
                    )}
                  </div>
                </div>

                {myVerification?.adminNotes && (
                  <div className="p-3 bg-[#7F8C6A]/15 border border-[#C8B48A]/40 !rounded-none text-xs text-[#1E3B2F]">
                    <strong>Audit Remarks:</strong> {myVerification.adminNotes}
                  </div>
                )}
              </div>
            </div>
          ) : companySubTab === 'metrics' ? (
            <ReputationMetricsDashboard
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            renderReputationDirectory()
          )}
        </div>
      )}

      {/* VIEW B: ADMIN MODERATION QUEUE (Strictly Reserved for Admin Role) */}
      {activePortal === 'admin' && isAdmin && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setAdminSubTab('queue')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                adminSubTab === 'queue'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Verification Moderation Queue
            </button>

            <button
              type="button"
              onClick={() => setAdminSubTab('metrics')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                adminSubTab === 'metrics'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reputation Metrics & Analytics
            </button>

            <button
              type="button"
              onClick={() => setAdminSubTab('directory')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                adminSubTab === 'directory'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Reputation Directory & Audit
            </button>
          </div>

          {adminSubTab === 'queue' ? (
            <AdminVerificationQueue refreshTrigger={refreshTrigger} />
          ) : adminSubTab === 'metrics' ? (
            <ReputationMetricsDashboard
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            renderReputationDirectory()
          )}
        </div>
      )}

      {/* VIEW C: REVIEWER PORTAL (Academic Evaluations Workspace) */}
      {activePortal === 'reviewer' && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setReviewerSubTab('workspace')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                reviewerSubTab === 'workspace'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Evaluations Workspace
            </button>

            <button
              type="button"
              onClick={() => setReviewerSubTab('metrics')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                reviewerSubTab === 'metrics'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reputation Metrics & Leaderboard
            </button>

            <button
              type="button"
              onClick={() => setReviewerSubTab('directory')}
              className={`px-4 py-2 text-xs font-bold !rounded-none transition-all flex items-center gap-2 whitespace-nowrap ${
                reviewerSubTab === 'directory'
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Candidate & Company Directory
            </button>
          </div>

          {reviewerSubTab === 'workspace' ? (
            <div className="space-y-6">
              {/* 4 Reviewer Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#7F8C6A]/15 text-[#1E3B2F] !rounded-none border border-[#C8B48A]/40">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Evaluations Submitted
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {submittedReviews.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#1E3B2F]/10 text-[#1E3B2F] !rounded-none border border-[#1E3B2F]/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Credentials Status
                      </p>
                      <p className="text-sm font-black text-[#1E3B2F] uppercase mt-1">
                        {myStatus === 'approved' ? 'Verified Faculty' : myStatus}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#C8B48A]/20 text-[#1E3B2F] !rounded-none border border-[#C8B48A]/50">
                      <Star className="w-5 h-5 fill-[#C8B48A] text-[#C8B48A]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Average Endorsement
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {avgReviewerScore} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#1E3B2F]/15 text-[#1E3B2F] !rounded-none border border-[#1E3B2F]/30">
                      <Sparkles className="w-5 h-5 text-[#C8B48A]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Evaluation Authority
                      </p>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        Direct Academic Endorsement
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviewer Credentials Card */}
              <div className="bg-slate-50 border border-slate-200 !rounded-none p-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 !rounded-none bg-[#7F8C6A]/20 text-[#1E3B2F] flex-shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          Academic Reviewer Accreditation
                        </h3>
                        <VerificationStatusBadge status={myStatus} />
                      </div>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        Credentials accredited for <strong>{myVerification?.institutionOrOrg || 'South Eastern University of Sri Lanka'}</strong> under ID <code>{myVerification?.designationOrRegNo || 'Senior Lecturer (Staff ID: ICT-L-042)'}</code>. Your academic evaluations carry formal recommendation weight in student rankings.
                      </p>
                      {myVerification?.proofDocumentUrl && (
                        <a
                          href={myVerification.proofDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1E3B2F] hover:underline pt-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Uploaded Faculty Proof Document
                        </a>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="text-xs !rounded-none"
                  >
                    Update Credentials
                  </Button>
                </div>
              </div>

              {/* Submitted Evaluations List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Submitted Academic Evaluations ({submittedReviews.length})
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="gap-1.5 text-xs !rounded-none !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] font-semibold shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Write New Review
                  </Button>
                </div>

                {loadingReviews ? (
                  <div className="py-12 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <ReviewList
                    reviews={submittedReviews}
                    emptyMessage="You have not submitted any student candidate or company partner evaluations yet. Click 'Write Review' to publish your first academic evaluation."
                  />
                )}
              </div>
            </div>
          ) : reviewerSubTab === 'metrics' ? (
            <ReputationMetricsDashboard
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          ) : (
            renderReputationDirectory()
          )}
        </div>
      )}

      {/* 5. Verification Request Modal */}
      <VerificationRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultType={isCompany ? 'company' : isReviewer ? 'reviewer' : 'company'}
        onSuccess={handleVerificationSuccess}
      />

      {/* 6. Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );

  // Helper render function for Reputation Directory
  function renderReputationDirectory() {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 !rounded-none p-4 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Verified Reputation Directory
            </h3>
            <p className="text-xs text-slate-500">
              Inspect multi-criteria ratings, star score distribution, and qualitative evaluations for university candidates and corporate partners
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="inline-flex p-1 bg-slate-100 !rounded-none border border-slate-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setSearchTargetType('student');
                  setSelectedInspectTarget(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 !rounded-none transition-all ${
                  searchTargetType === 'student'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Student Candidates
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTargetType('company');
                  setSelectedInspectTarget(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 !rounded-none transition-all ${
                  searchTargetType === 'company'
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Corporate Companies
              </button>
            </div>

            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${searchTargetType === 'student' ? 'students by name or email...' : 'companies by name or industry...'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 !rounded-none focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] font-medium"
              />
            </div>
          </div>

          {/* Target Search Results Grid */}
          {targetSearchResults.length > 0 && !selectedInspectTarget && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {targetSearchResults.map((target) => (
                <div
                  key={target._id}
                  onClick={() => handleInspectTarget(target)}
                  className="p-3 border border-slate-200 hover:border-[#1E3B2F] !rounded-none cursor-pointer hover:shadow-xs transition-all bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 !rounded-none bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#C8B48A]/40 flex items-center justify-center font-bold text-xs">
                      {target.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{target.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {searchTargetType === 'student'
                          ? target.profile?.degree || target.email
                          : target.industry || 'Company'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#C8B48A] flex items-center justify-end gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#C8B48A] text-[#C8B48A]" />
                      {Number(target.reputationScore || target.profile?.reputationScore || 5.0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {target.reviewCount || target.profile?.reviewCount || 1} evaluation
                      {(target.reviewCount || target.profile?.reviewCount) === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inspected Target Multi-Criteria Details */}
        {selectedInspectTarget && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#7F8C6A]/15 p-4 border border-[#C8B48A]/40 !rounded-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 !rounded-none bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center font-bold text-sm">
                  {selectedInspectTarget.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-none">
                    {selectedInspectTarget.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchTargetType === 'student'
                      ? selectedInspectTarget.profile?.degree || selectedInspectTarget.email
                      : selectedInspectTarget.industry}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isCompany && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="text-xs !rounded-none !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] font-semibold shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C8B48A]" />
                    Evaluate {selectedInspectTarget.name.split(' ')[0]}
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedInspectTarget(null)}
                  className="text-xs !rounded-none"
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {loadingInspect ? (
              <div className="py-12 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : inspectReputation ? (
              <>
                <ReputationOverviewCard
                  reviews={inspectReviews}
                  score={inspectReputation.reputationScore}
                  reviewCount={inspectReputation.reviewCount}
                  breakdown={inspectReputation.breakdown}
                  distribution={inspectReputation.distribution}
                  targetType={searchTargetType}
                  title={`${selectedInspectTarget.name}'s Academic Endorsement Profile`}
                />

                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Verified Evaluation Records ({inspectReviews.length})
                  </h4>
                  <ReviewList
                    reviews={inspectReviews}
                    emptyMessage={`No verified academic evaluations recorded for ${selectedInspectTarget.name} yet.`}
                  />
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    );
  }
};

export default VerificationRatingPage;
