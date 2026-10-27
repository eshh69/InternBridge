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
import { apiClient } from '../../services/apiClient';
import {
  ShieldCheck,
  ShieldAlert,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  ExternalLink,
  Building2,
  User,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export const VerificationRatingPage = () => {
  const { user } = useAuth();

  // Verification status for the logged-in user
  const [myVerification, setMyVerification] = useState(null);
  const [myStatus, setMyStatus] = useState('unverified');
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Reviews & Reputation for the logged-in user or active target
  const [myReviews, setMyReviews] = useState([]);
  const [myReputation, setMyReputation] = useState({
    reputationScore: 0,
    reviewCount: 0,
    breakdown: {},
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Reviewer specific: Reviews submitted by this reviewer
  const [submittedReviews, setSubmittedReviews] = useState([]);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState(
    user?.role === 'admin' ? 'admin-queue' : 'overview'
  );

  // Public Search Target state
  const [searchTargetType, setSearchTargetType] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetSearchResults, setTargetSearchResults] = useState([]);
  const [selectedInspectTarget, setSelectedInspectTarget] = useState(null);
  const [inspectReviews, setInspectReviews] = useState([]);
  const [inspectReputation, setInspectReputation] = useState(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // 1. Fetch user's own verification status
  const fetchMyVerificationStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await apiClient.get('/verifications/my-status');
      setMyVerification(res.data?.verification || null);
      setMyStatus(res.data?.status || 'unverified');
    } catch (err) {
      console.error('Failed to fetch verification status', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // 2. Fetch reviews and reputation score for current user (if student or company)
  const fetchMyReviewsAndReputation = async () => {
    if (!user?._id) return;
    setLoadingReviews(true);
    try {
      const res = await apiClient.get(`/reviews/target/${user._id}`);
      setMyReviews(res.data?.reviews || []);
      if (res.data?.summary) {
        setMyReputation(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load entity reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // 3. Fetch reviews submitted by this reviewer
  const fetchSubmittedReviews = async () => {
    if (user?.role !== 'reviewer') return;
    try {
      const res = await apiClient.get('/reviews/my-reviews');
      setSubmittedReviews(res.data?.reviews || []);
    } catch (err) {
      console.error('Failed to load submitted reviews', err);
    }
  };

  useEffect(() => {
    fetchMyVerificationStatus();
    if (user?.role === 'student' || user?.role === 'company') {
      fetchMyReviewsAndReputation();
    }
    if (user?.role === 'reviewer') {
      fetchSubmittedReviews();
    }
  }, [user]);

  // Handle Target Search for Lookup Tab
  useEffect(() => {
    if (activeTab !== 'lookup' || !searchQuery.trim()) {
      setTargetSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get(
          `/reviews/targets?type=${searchTargetType}&q=${encodeURIComponent(searchQuery)}`
        );
        setTargetSearchResults(res.data?.targets || []);
      } catch (err) {
        console.error('Failed to search targets', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, searchTargetType]);

  // Inspect Target Reviews
  const handleInspectTarget = async (target) => {
    setSelectedInspectTarget(target);
    setLoadingInspect(true);
    try {
      const res = await apiClient.get(`/reviews/target/${target._id}`);
      setInspectReviews(res.data?.reviews || []);
      setInspectReputation(res.data?.summary || null);
    } catch (err) {
      console.error('Failed to inspect reviews', err);
    } finally {
      setLoadingInspect(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Verification & Ratings System
            <Badge variant="purple" size="sm">
              Module 5
            </Badge>
          </h1>
          <p className="text-sm text-gray-500">
            Official academic evaluations, institutional verifications, and multi-criteria reputation metrics
          </p>
        </div>

        {/* Action Buttons based on Role */}
        <div className="flex items-center gap-3">
          {user?.role === 'reviewer' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Write Evaluation
            </Button>
          )}

          {(user?.role === 'reviewer' || user?.role === 'company') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {myStatus === 'approved' ? 'Update Credentials' : 'Request Verification'}
            </Button>
          )}
        </div>
      </div>

      {/* Verification Status Banner for Reviewer / Company */}
      {(user?.role === 'reviewer' || user?.role === 'company') && !loadingStatus && (
        <Card className="bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-blue-50/60 border-indigo-100 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  myStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : myStatus === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : myStatus === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {myStatus === 'approved' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : myStatus === 'pending' ? (
                  <Clock className="w-6 h-6" />
                ) : myStatus === 'rejected' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <FileCheck2 className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">
                    {user?.role === 'company' ? 'Company Accreditation Status' : 'Academic Reviewer Credentials'}
                  </h3>
                  <VerificationStatusBadge status={myStatus} />
                </div>

                <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                  {myStatus === 'approved'
                    ? `Your credentials (${myVerification?.institutionOrOrg || 'Registered'}) are formally verified by the InternBridge academic moderation committee.`
                    : myStatus === 'pending'
                    ? `Your credentials proof for ${myVerification?.institutionOrOrg || 'your entity'} has been received and is currently under review.`
                    : myStatus === 'rejected'
                    ? `Your verification submission was rejected: "${myVerification?.adminNotes || 'Credentials could not be verified.'}". Please re-submit valid documentation.`
                    : `Please submit your ${
                        user?.role === 'company'
                          ? 'business registration certificate (BRN)'
                          : 'university appointment letter / staff ID'
                      } to gain official verified status.`}
                </p>

                {myVerification?.proofDocumentUrl && (
                  <div className="pt-1">
                    <a
                      href={myVerification.proofDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Uploaded Document ({myVerification.designationOrRegNo})
                    </a>
                  </div>
                )}
              </div>
            </div>

            {myStatus !== 'approved' && (
              <Button
                variant={myStatus === 'pending' ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setIsRequestModalOpen(true)}
                className="self-start md:self-auto flex-shrink-0"
              >
                {myStatus === 'pending' ? 'Re-upload Proof' : 'Verify Now'}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin-queue')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'admin-queue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Verification Queue
          </button>
        )}

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          {user?.role === 'admin'
            ? 'Reputation Metrics'
            : user?.role === 'reviewer'
            ? 'Evaluations Workspace'
            : 'My Ratings & Reviews'}
        </button>

        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lookup'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Search className="w-4 h-4" />
          Reputation Directory
        </button>
      </div>

      {/* Tab 1: Admin Verification Queue */}
      {activeTab === 'admin-queue' && user?.role === 'admin' && <AdminVerificationQueue />}

      {/* Tab 2: Overview / Workspace */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Reviewer Workspace View */}
          {user?.role === 'reviewer' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Evaluations Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">{submittedReviews.length}</p>
                  </div>
                </Card>

                <Card className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Reviewer Credentials</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{myStatus}</p>
                  </div>
                </Card>

                <Card className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Reputation Impact</p>
                    <p className="text-sm font-bold text-gray-900">Direct Academic Endorsement</p>
                  </div>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Your Submitted Academic Evaluations</h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    New Evaluation
                  </Button>
                </div>
                <ReviewList
                  reviews={submittedReviews}
                  emptyMessage="You have not submitted any student or company evaluations yet. Click 'Write Evaluation' to get started."
                />
              </div>
            </div>
          ) : user?.role === 'student' || user?.role === 'company' ? (
            /* Student or Company View: Aggregate Reputation Card + Verified Reviews */
            <div className="space-y-6">
              <ReputationOverviewCard
                score={myReputation.reputationScore}
                reviewCount={myReputation.reviewCount}
                breakdown={myReputation.breakdown}
                distribution={myReputation.distribution}
                targetType={user.role}
                title={
                  user.role === 'student'
                    ? 'Student Academic Endorsement & Reputation'
                    : 'Company Reputation & Intern Feedback'
                }
              />

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Verified Academic Reviews ({myReviews.length})
                </h3>
                {loadingReviews ? (
                  <div className="py-8 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <ReviewList
                    reviews={myReviews}
                    emptyMessage={
                      user.role === 'student'
                        ? 'No academic supervisor evaluations posted for your profile yet.'
                        : 'No reviewer feedback has been submitted for this company yet.'
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            /* Admin view of general reputation directory */
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Browse student and company reputation scores and multi-criteria evaluations across the platform.
              </p>
              <Button onClick={() => setActiveTab('lookup')} variant="primary" size="sm">
                Explore Reputation Directory
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Public Reputation Directory / Lookup */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Verified Reputation Directory</h3>
              <p className="text-xs text-gray-500">
                Inspect academic ratings, endorsement breakdowns, and reviews for any student or partner company
              </p>
            </div>

            {/* Target Type Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  onClick={() => {
                    setSearchTargetType('student');
                    setSelectedInspectTarget(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    searchTargetType === 'student'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Students
                </button>
                <button
                  onClick={() => {
                    setSearchTargetType('company');
                    setSelectedInspectTarget(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    searchTargetType === 'company'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Companies
                </button>
              </div>

              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${searchTargetType === 'student' ? 'students by name or email...' : 'companies by name or industry...'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Target Search Results */}
            {targetSearchResults.length > 0 && !selectedInspectTarget && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {targetSearchResults.map((target) => (
                  <div
                    key={target._id}
                    onClick={() => handleInspectTarget(target)}
                    className="p-3 border border-gray-200 hover:border-indigo-500 rounded-xl cursor-pointer hover:shadow-sm transition-all bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {target.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{target.name}</p>
                        <p className="text-xs text-gray-400">
                          {searchTargetType === 'student'
                            ? target.profile?.degree || target.email
                            : target.industry || 'Company'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-500 flex items-center justify-end gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(target.reputationScore || target.profile?.reputationScore || 0).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {target.reviewCount || target.profile?.reviewCount || 0} reviews
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Inspected Target Details */}
          {selectedInspectTarget && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {selectedInspectTarget.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedInspectTarget.name}</h3>
                    <p className="text-xs text-gray-500">
                      {searchTargetType === 'student'
                        ? selectedInspectTarget.profile?.degree || selectedInspectTarget.email
                        : selectedInspectTarget.industry}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedInspectTarget(null)}
                >
                  Clear Selection
                </Button>
              </div>

              {loadingInspect ? (
                <div className="py-12 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : inspectReputation ? (
                <>
                  <ReputationOverviewCard
                    score={inspectReputation.reputationScore}
                    reviewCount={inspectReputation.reviewCount}
                    breakdown={inspectReputation.breakdown}
                    distribution={inspectReputation.distribution}
                    targetType={searchTargetType}
                    title={`${selectedInspectTarget.name}'s Verified Score`}
                  />

                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-gray-900">
                      Evaluations List ({inspectReviews.length})
                    </h4>
                    <ReviewList
                      reviews={inspectReviews}
                      emptyMessage={`No verified evaluations recorded for ${selectedInspectTarget.name}.`}
                    />
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Verification Request Modal */}
      <VerificationRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        userRole={user?.role}
        onSuccess={() => {
          fetchMyVerificationStatus();
        }}
      />

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          fetchSubmittedReviews();
          if (user?.role === 'student' || user?.role === 'company') {
            fetchMyReviewsAndReputation();
          }
        }}
      />
    </div>
  );
};
