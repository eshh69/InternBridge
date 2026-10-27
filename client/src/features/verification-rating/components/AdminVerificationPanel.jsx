import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
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
  Building2,
  GraduationCap,
  Calendar,
  FileText,
} from 'lucide-react';

export const AdminVerificationPanel = ({ standalone = false }) => {
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
    status: 'Approved',
    adminNotes: '',
    submitting: false,
  });

  const fetchVerifications = async (filter = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const queryParam = filter !== 'all' ? `?status=${filter}` : '';
      const res = await apiClient.get(`/verifications${queryParam}`);
      const dataItems = res.data?.verifications || res.data?.requests || [];
      setRequests(dataItems);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load verification requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications(statusFilter);
  }, [statusFilter]);

  const handleOpenDecision = (item, status) => {
    setDecisionModal({
      isOpen: true,
      item,
      status,
      adminNotes: status === 'Approved' ? 'Verified credentials and valid registration documentation.' : '',
      submitting: false,
    });
  };

  const handleConfirmDecision = async () => {
    if (!decisionModal.item) return;

    setDecisionModal((prev) => ({ ...prev, submitting: true }));
    setError('');

    try {
      // Calls PUT /api/verifications/:id/status
      await apiClient.put(`/verifications/${decisionModal.item._id}/status`, {
        status: decisionModal.status,
        adminNotes: decisionModal.adminNotes,
      });

      const targetName =
        decisionModal.item.targetId?.name ||
        decisionModal.item.requester?.name ||
        'User';

      setActionSuccess(
        `Verification request for "${targetName}" successfully marked as ${decisionModal.status}.`
      );

      // Close modal
      setDecisionModal({
        isOpen: false,
        item: null,
        status: 'Approved',
        adminNotes: '',
        submitting: false,
      });

      // Refresh list
      fetchVerifications(statusFilter);

      setTimeout(() => setActionSuccess(''), 4500);
    } catch (err) {
      setError(err.message || 'Failed to update verification status.');
      setDecisionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <Badge variant="success" size="sm" className="inline-flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Approved
        </Badge>
      );
    }
    if (s === 'rejected') {
      return (
        <Badge variant="danger" size="sm" className="inline-flex items-center gap-1 font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="warning" size="sm" className="inline-flex items-center gap-1 font-semibold">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </Badge>
    );
  };

  const panelContent = (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <Alert type="danger" title="Error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {actionSuccess && (
        <Alert type="success" title="Success" onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Submissions</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.total || 0}</p>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </p>
          <p className="text-2xl font-black text-amber-800 mt-1">{stats.pending || 0}</p>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Approved
          </p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{stats.approved || 0}</p>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </p>
          <p className="text-2xl font-black text-rose-800 mt-1">{stats.rejected || 0}</p>
        </div>
      </div>

      {/* Filter Tabs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'approved', label: 'Approved', count: stats.approved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
            { id: 'all', label: 'All Requests', count: stats.total },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.id ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchVerifications(statusFilter)}
          disabled={loading}
          className="self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Table / List View */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Spinner size="lg" />
          <p className="text-xs text-gray-500 font-medium">Loading verification requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter} requests found`}
          description="Verification requests submitted by reviewers or companies will appear here for administrative moderation."
          icon={<ShieldCheck className="w-12 h-12 text-gray-300" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5">Requester / Account</th>
                <th scope="col" className="px-4 py-3.5">Type</th>
                <th scope="col" className="px-4 py-3.5">Organization & ID</th>
                <th scope="col" className="px-4 py-3.5">Proof Document</th>
                <th scope="col" className="px-4 py-3.5">Date</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {requests.map((item) => {
                const requesterUser = item.targetId || item.requester || {};
                const proofUrl = item.documentUrl || item.proofDocumentUrl;
                const isPending = (item.status || '').toLowerCase() === 'pending';

                return (
                  <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Requester details */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {requesterUser.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{requesterUser.name || 'Unnamed'}</p>
                          <p className="text-[11px] text-gray-400">{requesterUser.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Verification Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {item.verificationType?.toLowerCase() === 'company' ? (
                          <>
                            <Building2 className="w-3 h-3 text-indigo-500" /> Company
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3 h-3 text-purple-500" /> Reviewer
                          </>
                        )}
                      </span>
                    </td>

                    {/* Organization & Reg */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.institutionOrOrg || item.description || 'Not specified'}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {item.designationOrRegNo || 'No ID specified'}
                      </p>
                    </td>

                    {/* Proof Document Link */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {proofUrl ? (
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No document</span>
                      )}
                    </td>

                    {/* Submitted Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-400 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Actions: Approve / Reject */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="success"
                          size="sm"
                          className="px-2.5 py-1 text-xs"
                          onClick={() => handleOpenDecision(item, 'Approved')}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          className="px-2.5 py-1 text-xs"
                          onClick={() => handleOpenDecision(item, 'Rejected')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      <Modal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
        title={`${decisionModal.status === 'Approved' ? 'Approve' : 'Reject'} Verification Request`}
      >
        <div className="space-y-4 text-sm">
          <p className="text-gray-600">
            You are about to{' '}
            <strong className={decisionModal.status === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}>
              {decisionModal.status.toLowerCase()}
            </strong>{' '}
            the verification request for{' '}
            <strong>
              {decisionModal.item?.targetId?.name || decisionModal.item?.requester?.name || 'this applicant'}
            </strong>
            .
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Admin Notes / Feedback (Sent in notification)
            </label>
            <textarea
              rows={3}
              value={decisionModal.adminNotes}
              onChange={(e) => setDecisionModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
              placeholder="e.g. Verified official business registration documents or academic faculty ID."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={decisionModal.submitting}
            >
              Cancel
            </Button>

            <Button
              variant={decisionModal.status === 'Approved' ? 'success' : 'danger'}
              onClick={handleConfirmDecision}
              isLoading={decisionModal.submitting}
            >
              Confirm {decisionModal.status}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  if (standalone) {
    return (
      <Card className="max-w-6xl mx-auto shadow-md border-gray-200">
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Admin Verification Moderation Panel
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Review submitted credential proofs, verify academic faculty and corporate employers, and update authorization states.
          </p>
        </div>
        {panelContent}
      </Card>
    );
  }

  return panelContent;
};

export default AdminVerificationPanel;
