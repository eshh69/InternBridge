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
  Briefcase,
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

  // Helper for Status Badge styling (Luxury Forest Theme)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return (
          <Badge size="sm" className="gap-1 font-bold rounded-lg uppercase tracking-wider text-[11px] bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/40">
            <Clock className="w-3 h-3 text-[#1E3B2F]" /> Submitted
          </Badge>
        );
      case 'under_review':
        return (
          <Badge size="sm" className="gap-1 font-bold rounded-lg uppercase tracking-wider text-[11px] bg-amber-50 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" /> Under Review
          </Badge>
        );
      case 'shortlisted':
        return (
          <Badge size="sm" className="gap-1 font-bold rounded-lg uppercase tracking-wider text-[11px] bg-[#C8B48A]/25 text-[#1E3B2F] border border-[#C8B48A]/50">
            <Sparkles className="w-3 h-3 text-[#1E3B2F]" /> Shortlisted
          </Badge>
        );
      case 'hired':
        return (
          <Badge size="sm" className="gap-1 font-bold rounded-lg uppercase tracking-wider text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Offer / Hired
          </Badge>
        );
      case 'rejected':
        return (
          <Badge size="sm" className="gap-1 font-bold rounded-lg uppercase tracking-wider text-[11px] bg-rose-50 text-rose-900 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" /> Not Selected
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm" className="rounded-lg uppercase tracking-wider text-[11px]">{status}</Badge>;
    }
  };

  // Compute stat counts
  const totalCount = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const hiredCount = applications.filter((a) => a.status === 'hired').length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Header - Luxury Forest Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-[#1E3B2F] shadow-2xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Submissions</span>
          <div className="text-2xl font-extrabold text-[#1E3B2F] mt-1">{totalCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 shadow-2xs">
          <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Under Review</span>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">{underReviewCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-[#C8B48A] shadow-2xs">
          <span className="text-xs text-[#1E3B2F] font-bold uppercase tracking-wider block">Shortlisted</span>
          <div className="text-2xl font-extrabold text-[#1E3B2F] mt-1">{shortlistedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-emerald-600 shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Accepted / Hired</span>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">{hiredCount}</div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C8B48A]/30 pb-3">
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isActive
                    ? 'bg-[#1E3B2F] text-[#F5F0E6] border-[#1E3B2F] shadow-xs font-bold'
                    : 'bg-white hover:bg-[#F5F0E6] text-slate-700 border-slate-300'
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
            className="gap-1.5 text-xs rounded-xl border-[#1E3B2F] text-[#1E3B2F] hover:bg-[#F5F0E6] font-semibold"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#1E3B2F]" />
            Find More Internships
          </Button>
        )}
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {actionError}
        </div>
      )}

      {/* 3. Applications Table / List */}
      <Card className="overflow-hidden p-0 rounded-xl border border-slate-200 shadow-xs">
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
              <thead className="text-[11px] uppercase bg-[#F5F0E6]/50 text-slate-700 font-bold border-b border-[#C8B48A]/30">
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
                    <tr key={app._id} className="hover:bg-[#F5F0E6]/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{title}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
                            {companyName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {app.internship?.location || 'Colombo'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {app.matchScore !== undefined ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30">
                            <Sparkles className="w-3 h-3 text-[#1E3B2F]" /> {app.matchScore}%
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
                            className="rounded-xl text-xs border-slate-300 hover:border-[#1E3B2F] hover:text-[#1E3B2F] font-semibold"
                          >
                            Details
                          </Button>

                          {app.status === 'applied' && (
                            <button
                              onClick={() => handleWithdraw(app._id)}
                              disabled={isWithdrawing}
                              title="Withdraw Application"
                              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
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

      {/* 4. Application Details Modal - Luxury Forest Theme */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Application Status & Details"
          maxWidth="max-w-xl rounded-2xl"
          footer={
            <div className="flex justify-between items-center w-full">
              {selectedApp.status === 'applied' ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleWithdraw(selectedApp._id)}
                  disabled={isWithdrawing}
                  className="gap-1 text-xs rounded-xl font-semibold"
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
                className="rounded-xl border-[#C8B48A]/60 font-semibold"
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Target Job Info */}
            <div className="bg-[#F5F0E6]/80 p-4 rounded-xl border border-[#C8B48A]/40 border-l-4 border-l-[#1E3B2F]">
              <h4 className="text-base font-bold text-[#1E3B2F]">{selectedApp.internship?.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="font-semibold text-[#1E3B2F] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
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
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
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
              <div className="p-3.5 bg-[#F5F0E6]/90 border border-[#C8B48A]/50 border-l-4 border-l-[#1E3B2F] rounded-xl space-y-1">
                <span className="text-xs font-bold text-[#1E3B2F] uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#1E3B2F]" /> Employer Notes & Instructions:
                </span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
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
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F5F0E6] hover:bg-[#EBE2D1] border border-[#C8B48A]/50 rounded-xl text-xs font-semibold text-[#1E3B2F] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#1E3B2F]" />
                  <span>View Attached Resume</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C8B48A]" />
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
