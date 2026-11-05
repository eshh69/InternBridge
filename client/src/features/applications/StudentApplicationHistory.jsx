import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  MapPin,
  ExternalLink,
  Trash2,
  Sparkles,
  Award,
  ChevronRight,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import applicationsApi from './applicationsApi';

export const StudentApplicationHistory = ({ refreshTrigger, onBrowseInternships }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadApplications = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await applicationsApi.getStudentApplications(activeFilter);
      setApplications(res?.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      // Fallback empty
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [refreshTrigger, activeFilter]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setIsWithdrawing(true);
    setActionError('');
    try {
      await applicationsApi.withdrawApplication(appId);
      if (selectedApp?._id === appId) {
        setIsDetailModalOpen(false);
      }
      loadApplications();
    } catch (err) {
      setActionError(err.message || 'Failed to withdraw application');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Helper for Status Badge styling (Sharp Corners & Crisp Blue Theme)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return (
          <Badge variant="info" size="sm" className="gap-1 font-bold !rounded-none uppercase tracking-wider text-[11px] !border-blue-300 !bg-blue-50 !text-blue-800">
            <Clock className="w-3 h-3 text-blue-600" /> Submitted
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="warning" size="sm" className="gap-1 font-bold !rounded-none uppercase tracking-wider text-[11px] !border-amber-300 !bg-amber-50 !text-amber-900">
            <Clock className="w-3 h-3 text-amber-600" /> Under Review
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge variant="info" size="sm" className="gap-1 font-bold !rounded-none uppercase tracking-wider text-[11px] !border-sky-300 !bg-sky-50 !text-sky-800">
            <Sparkles className="w-3 h-3 text-sky-600" /> Shortlisted
          </Badge>
        );
      case 'hired':
        return (
          <Badge variant="success" size="sm" className="gap-1 font-bold !rounded-none uppercase tracking-wider text-[11px] !border-emerald-300 !bg-emerald-50 !text-emerald-900">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Offer / Hired
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm" className="gap-1 font-bold !rounded-none uppercase tracking-wider text-[11px] !border-rose-300 !bg-rose-50 !text-rose-900">
            <XCircle className="w-3 h-3 text-rose-600" /> Not Selected
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm" className="!rounded-none uppercase tracking-wider text-[11px]">{status}</Badge>;
    }
  };

  // Compute stat counts
  const totalCount = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const hiredCount = applications.filter((a) => a.status === 'hired').length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Header - Sharp Corners & Blue Accent Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 !rounded-none border border-slate-200 border-t-4 border-t-blue-600 shadow-2xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Submissions</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div className="bg-white p-4 !rounded-none border border-slate-200 border-t-4 border-t-amber-500 shadow-2xs">
          <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Under Review</span>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">{underReviewCount}</div>
        </div>

        <div className="bg-white p-4 !rounded-none border border-slate-200 border-t-4 border-t-sky-500 shadow-2xs">
          <span className="text-xs text-sky-800 font-bold uppercase tracking-wider block">Shortlisted</span>
          <div className="text-2xl font-extrabold text-sky-950 mt-1">{shortlistedCount}</div>
        </div>

        <div className="bg-white p-4 !rounded-none border border-slate-200 border-t-4 border-t-emerald-600 shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Accepted / Hired</span>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">{hiredCount}</div>
        </div>
      </div>

      {/* 2. Filter Bar - Sharp Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'applied', 'under_review', 'shortlisted', 'hired', 'rejected'].map((statusKey) => {
            const labels = {
              all: 'All',
              applied: 'Submitted',
              under_review: 'Under Review',
              shortlisted: 'Shortlisted',
              hired: 'Hired',
              rejected: 'Archived',
            };
            const isActive = activeFilter === statusKey;
            return (
              <button
                key={statusKey}
                onClick={() => setActiveFilter(statusKey)}
                className={`px-3.5 py-1.5 !rounded-none text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                {labels[statusKey]}
              </button>
            );
          })}
        </div>

        {onBrowseInternships && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onBrowseInternships}
            className="gap-1.5 text-xs !rounded-none border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            Find More Internships
          </Button>
        )}
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 !rounded-none text-xs text-red-700">
          {actionError}
        </div>
      )}

      {/* 3. Applications Table / List - Sharp Corners */}
      <Card className="overflow-hidden p-0 !rounded-none border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No Applications Found"
            description={
              activeFilter === 'all'
                ? 'You have not submitted any internship applications yet. Explore openings and apply today!'
                : `No applications matching filter '${activeFilter}'.`
            }
            actionLabel={onBrowseInternships ? 'Browse Available Internships' : undefined}
            onAction={onBrowseInternships}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-600">
              <thead className="text-[11px] uppercase bg-slate-50 text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Position & Company</th>
                  <th className="px-5 py-3.5">Match Fit</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const companyName = app.company?.name || app.internship?.company?.name || 'Company Partner';
                  const title = app.internship?.title || 'Internship Position';
                  const appliedDate = app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{title}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Building2 className="w-3 h-3 text-blue-600" />
                            {companyName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {app.internship?.location || 'Colombo'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {app.matchScore !== undefined ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 !rounded-none text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Sparkles className="w-3 h-3 text-blue-600" /> {app.matchScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-gray-700">
                        {appliedDate}
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setIsDetailModalOpen(true);
                            }}
                            className="!rounded-none text-xs border-slate-300 hover:border-blue-600 hover:text-blue-600 font-semibold"
                          >
                            Details
                          </Button>

                          {app.status === 'applied' && (
                            <button
                              onClick={() => handleWithdraw(app._id)}
                              disabled={isWithdrawing}
                              title="Withdraw Application"
                              className="text-gray-400 hover:text-red-600 p-1.5 !rounded-none hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Application Details Modal (Sharp Corners & Blue Theme) */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Application Status & Details"
          maxWidth="max-w-xl !rounded-none"
          footer={
            <div className="flex justify-between items-center w-full">
              {selectedApp.status === 'applied' ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleWithdraw(selectedApp._id)}
                  disabled={isWithdrawing}
                  className="gap-1 text-xs !rounded-none font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Withdraw Application
                </Button>
              ) : (
                <div />
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
                className="!rounded-none border-slate-300 font-semibold"
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Target Job Info */}
            <div className="bg-slate-50 p-4 !rounded-none border border-slate-200 border-l-4 border-l-blue-600">
              <h4 className="text-base font-bold text-gray-900">{selectedApp.internship?.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {selectedApp.company?.name || selectedApp.internship?.company?.name}
                </span>
                <span>•</span>
                <span>{selectedApp.internship?.location || 'Colombo'}</span>
              </div>
            </div>

            {/* Status Progress Track */}
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Current Status
              </span>
              <div className="flex items-center justify-between p-3 bg-white !rounded-none border border-gray-200">
                <div className="flex items-center gap-2.5">
                  {getStatusBadge(selectedApp.status)}
                  <span className="text-xs text-gray-500">
                    Updated {new Date(selectedApp.updatedAt || selectedApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Recruiter Notes / Feedback */}
            {selectedApp.notes && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 border-l-4 border-l-blue-600 !rounded-none space-y-1">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-600" /> Employer Notes & Instructions:
                </span>
                <p className="text-xs text-blue-950 font-medium whitespace-pre-line leading-relaxed">
                  {selectedApp.notes}
                </p>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApp.coverLetter && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Cover Letter / Statement:
                </span>
                <div className="p-3 bg-gray-50 !rounded-none border border-gray-200 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Resume Link */}
            {selectedApp.resumeUrl && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Submitted Resume / CV:
                </span>
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 !rounded-none text-xs font-semibold text-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>View Attached Resume</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentApplicationHistory;
