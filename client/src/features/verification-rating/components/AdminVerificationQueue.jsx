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
import { apiClient } from '../../../services/apiClient';
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
} from 'lucide-react';

export const AdminVerificationQueue = () => {
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
      const res = await apiClient.get(`/verifications/pending?status=${filter}`);
      setRequests(res.data?.requests || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(statusFilter);
  }, [statusFilter]);

  const handleOpenDecision = (item, status) => {
    setDecisionModal({
      isOpen: true,
      item,
      status,
      adminNotes: status === 'approved' ? 'Verified by academic administration.' : '',
      submitting: false,
    });
  };

  const handleConfirmDecision = async () => {
    if (!decisionModal.item) return;

    setDecisionModal((prev) => ({ ...prev, submitting: true }));
    setError('');

    try {
      await apiClient.patch(`/verifications/${decisionModal.item._id}/decision`, {
        status: decisionModal.status,
        adminNotes: decisionModal.adminNotes,
      });

      setActionSuccess(
        `Verification request for ${decisionModal.item.requester?.name || 'user'} marked as ${decisionModal.status}.`
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
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 border-l-4 border-l-amber-500 py-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500 py-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-red-500 py-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-4 border-l-indigo-500 py-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
      </div>

      {actionSuccess && (
        <Alert type="success" title="Success">
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert type="danger" title="Error">
          {error}
        </Alert>
      )}

      {/* Filter Tabs & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'All Requests' : filter}
              {filter === 'pending' && stats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-white text-indigo-600 rounded-full font-bold">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchQueue(statusFilter)}
          className="flex items-center gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {/* Verification Items List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter} verifications`}
          description={
            statusFilter === 'pending'
              ? 'Great work! The verification review queue is currently clear.'
              : `No verification submissions found matching status '${statusFilter}'.`
          }
          icon={<ShieldCheck className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((item) => (
            <Card key={item._id} className="hover:border-indigo-200 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Requester Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.requester?.name?.charAt(0) || 'U'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-base">
                        {item.requester?.name || 'Unknown User'}
                      </h4>
                      <Badge
                        variant={item.verificationType === 'company' ? 'purple' : 'info'}
                        size="sm"
                        className="capitalize"
                      >
                        {item.verificationType === 'company' ? (
                          <Building2 className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {item.verificationType}
                      </Badge>
                      <VerificationStatusBadge status={item.status} size="sm" />
                    </div>

                    <p className="text-xs text-gray-500">{item.requester?.email}</p>

                    <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      <span>
                        <strong className="text-gray-700">Institution/Org:</strong> {item.institutionOrOrg}
                      </span>
                      <span>
                        <strong className="text-gray-700">Designation / BRN:</strong> {item.designationOrRegNo}
                      </span>
                      <span>
                        <strong className="text-gray-700">Submitted:</strong>{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.adminNotes && (
                      <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                        <strong className="text-gray-700">Admin Note:</strong> {item.adminNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Proof Document Link & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                  <a
                    href={item.proofDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Proof Document
                  </a>

                  {item.status === 'pending' ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleOpenDecision(item, 'approved')}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenDecision(item, 'rejected')}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleOpenDecision(item, item.status === 'approved' ? 'rejected' : 'approved')
                      }
                      className="text-xs text-gray-500"
                    >
                      Change Decision
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
        title={`${decisionModal.status === 'approved' ? 'Approve' : 'Reject'} Verification Request`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {decisionModal.status === 'approved'
              ? `You are approving verification for ${decisionModal.item?.requester?.name}. This will grant official verified status.`
              : `You are rejecting verification for ${decisionModal.item?.requester?.name}. Please specify the reason so they may re-submit.`}
          </p>

          <Input
            label="Admin Notes / Reason"
            placeholder={
              decisionModal.status === 'approved'
                ? 'Optional remarks (e.g. Verified via university faculty list)'
                : 'Reason for rejection (e.g. Unclear scan of certificate / BRN could not be validated)'
            }
            value={decisionModal.adminNotes}
            onChange={(e) => setDecisionModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
            required={decisionModal.status === 'rejected'}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={decisionModal.submitting}
            >
              Cancel
            </Button>
            <Button
              variant={decisionModal.status === 'approved' ? 'success' : 'danger'}
              onClick={handleConfirmDecision}
              isLoading={decisionModal.submitting}
            >
              Confirm {decisionModal.status === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
