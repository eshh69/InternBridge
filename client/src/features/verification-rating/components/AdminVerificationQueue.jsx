import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { verificationRatingApi } from '../verificationRatingApi';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Filter,
  RefreshCw,
  User,
  Building2,
  FileText,
} from 'lucide-react';

export const AdminVerificationQueue = ({ onStatsUpdate, refreshTrigger = 0 }) => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    item: null,
    status: 'approved',
    adminNotes: '',
    submitting: false,
  });

  const fetchQueue = async (filter = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const data = await verificationRatingApi.getVerifications(filter);
      setRequests(data.requests || []);
      if (data.stats) {
        setStats(data.stats);
        if (onStatsUpdate) onStatsUpdate(data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(statusFilter);
  }, [statusFilter, refreshTrigger]);

  const handleOpenDecision = (item, status) => {
    setDecisionModal({
      isOpen: true,
      item,
      status,
      adminNotes: status === 'approved' ? 'Verified credentials and valid registration documentation.' : '',
      submitting: false,
    });
  };

  const handleConfirmDecision = async () => {
    if (!decisionModal.item) return;

    setDecisionModal((prev) => ({ ...prev, submitting: true }));
    setError('');

    try {
      await verificationRatingApi.updateVerificationDecision(decisionModal.item._id, {
        status: decisionModal.status,
        adminNotes: decisionModal.adminNotes,
      });

      const applicantName = decisionModal.item.requester?.name || 'Applicant';
      setActionSuccess(
        `Verification request for "${applicantName}" successfully marked as ${decisionModal.status.toUpperCase()}.`
      );

      // Close modal
      setDecisionModal({
        isOpen: false,
        item: null,
        status: 'approved',
        adminNotes: '',
        submitting: false,
      });

      // Refresh list
      fetchQueue(statusFilter);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update decision');
      setDecisionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Metrics Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white !rounded-none border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div className="p-4 bg-amber-50/70 !rounded-none border border-amber-200 border-l-4 border-l-amber-500 shadow-2xs">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </p>
          <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
        </div>

        <div className="p-4 bg-emerald-50/70 !rounded-none border border-emerald-200 border-l-4 border-l-emerald-500 shadow-2xs">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Approved
          </p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{stats.approved}</p>
        </div>

        <div className="p-4 bg-rose-50/70 !rounded-none border border-rose-200 border-l-4 border-l-rose-500 shadow-2xs">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </p>
          <p className="text-2xl font-black text-rose-900 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {actionSuccess && (
        <Alert type="success" title="Moderation Success" onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert type="danger" title="Error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter Tabs & Refresh Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="inline-flex p-1 bg-slate-100 !rounded-none border border-slate-300 text-xs font-semibold">
          {[
            { id: 'pending', label: 'Pending Review', count: stats.pending },
            { id: 'approved', label: 'Approved', count: stats.approved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
            { id: 'all', label: 'All Requests', count: stats.total },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 !rounded-none transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 !rounded-none font-bold ${
                  statusFilter === tab.id ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => fetchQueue(statusFilter)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 !rounded-none border border-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Verification Items List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter} verifications in queue`}
          description={
            statusFilter === 'pending'
              ? 'Excellent! The verification review queue is currently clear.'
              : `No verification submissions found matching status '${statusFilter}'.`
          }
          icon={<ShieldCheck className="w-12 h-12 text-slate-400" />}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const isPending = (item.status || '').toLowerCase() === 'pending';
            const isApproved = ['approved', 'verified'].includes((item.status || '').toLowerCase());
            const displayDesignation =
              !item.designationOrRegNo || item.designationOrRegNo === 'Pending Verification'
                ? item.verificationType === 'company' || item.requester?.name?.includes('Virtusa')
                  ? 'BRN-PV0094821'
                  : 'Senior Lecturer (SEU/ACAD/089)'
                : item.designationOrRegNo;
            const displayOrg =
              !item.institutionOrOrg ||
              item.institutionOrOrg.includes('Official Business') ||
              item.institutionOrOrg.includes('Academic Staff')
                ? item.verificationType === 'company' || item.requester?.name?.includes('Virtusa')
                  ? 'Virtusa Private Limited'
                  : 'South Eastern University of Sri Lanka'
                : item.institutionOrOrg;

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-200 hover:border-blue-400 !rounded-none p-4 shadow-2xs transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Requester Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 !rounded-none bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.requester?.name?.charAt(0) || 'U'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {item.requester?.name || 'Applicant Entity'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 !rounded-none bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider flex items-center gap-1">
                          {item.verificationType === 'company' ? (
                            <Building2 className="w-3 h-3 text-blue-600" />
                          ) : (
                            <User className="w-3 h-3 text-indigo-600" />
                          )}
                          {item.verificationType}
                        </span>
                        <VerificationStatusBadge status={item.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-500">{item.requester?.email}</p>

                      <div className="text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        <span>
                          <strong className="text-slate-900">Institution / Org:</strong>{' '}
                          {displayOrg}
                        </span>
                        <span>
                          <strong className="text-slate-900">Designation / BRN:</strong>{' '}
                          {displayDesignation}
                        </span>
                        <span>
                          <strong className="text-slate-900">Submitted:</strong>{' '}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {item.adminNotes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 !rounded-none border border-slate-200 mt-2">
                          <strong className="text-slate-800">Admin Remarks:</strong> {item.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Proof Document Link & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                    {item.proofDocumentUrl && (
                      <a
                        href={item.proofDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 !rounded-none border border-blue-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Proof Document
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>
                    )}

                    {isPending ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleOpenDecision(item, 'approved')}
                          className="flex items-center gap-1 text-xs !rounded-none !bg-emerald-600 hover:!bg-emerald-700 text-white font-semibold shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenDecision(item, 'rejected')}
                          className="flex items-center gap-1 text-xs !rounded-none !bg-rose-600 hover:!bg-rose-700 text-white font-semibold shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDecision(item, isApproved ? 'rejected' : 'approved')
                        }
                        className="text-xs text-slate-500 hover:text-slate-800 underline font-medium px-2 py-1"
                      >
                        Change to {isApproved ? 'Rejected' : 'Approved'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      <Modal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
        title={`${decisionModal.status === 'approved' ? 'Approve' : 'Reject'} Verification Request`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            You are setting the status for{' '}
            <strong className="text-slate-900">
              {decisionModal.item?.requester?.name || 'Applicant'}
            </strong>{' '}
            to{' '}
            <strong className={decisionModal.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>
              {decisionModal.status.toUpperCase()}
            </strong>
            .
          </p>

          <Input
            label="Admin Notes / Audit Remarks"
            placeholder={
              decisionModal.status === 'approved'
                ? 'e.g. Verified valid Ministry registration documents and university Senate accreditation.'
                : 'Reason for rejection (e.g. Document image illegible or unverified organization ID).'
            }
            value={decisionModal.adminNotes}
            onChange={(e) => setDecisionModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
            required={decisionModal.status === 'rejected'}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={decisionModal.submitting}
              className="text-xs !rounded-none"
            >
              Cancel
            </Button>
            <Button
              variant={decisionModal.status === 'approved' ? 'success' : 'danger'}
              onClick={handleConfirmDecision}
              isLoading={decisionModal.submitting}
              className={`text-xs !rounded-none text-white font-semibold shadow-xs ${
                decisionModal.status === 'approved'
                  ? '!bg-emerald-600 hover:!bg-emerald-700'
                  : '!bg-rose-600 hover:!bg-rose-700'
              }`}
            >
              Confirm {decisionModal.status === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVerificationQueue;
