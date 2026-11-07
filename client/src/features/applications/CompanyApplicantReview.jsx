import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  FileText,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import applicationsApi from './applicationsApi';
import apiClient from '../../services/apiClient';

const FALLBACK_INTERNSHIPS = [
  { _id: 'int_01', title: 'Full Stack Engineering Intern' },
  { _id: 'int_02', title: 'Cloud & DevOps Intern' },
  { _id: 'int_03', title: 'Quality Assurance (QA) Automation Intern' },
  { _id: 'int_04', title: 'Associate Mobile Developer Intern' },
];

export const CompanyApplicantReview = ({ onStatusChange }) => {
  const [applicants, setApplicants] = useState([]);
  const [internships, setInternships] = useState(FALLBACK_INTERNSHIPS);
  const [selectedInternshipId, setSelectedInternshipId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Status Modal State
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('under_review');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Load company's internships for dropdown filter (falls back to sample list if backend offline)
  useEffect(() => {
    const fetchCompanyInternships = async () => {
      try {
        const res = await apiClient.get('/internships/my');
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.internships)
          ? res.data.internships
          : [];
        if (list.length > 0) {
          setInternships(list);
        }
      } catch (err) {
        // Expected fallback when backend is offline
        setInternships(FALLBACK_INTERNSHIPS);
      }
    };
    fetchCompanyInternships();
  }, []);

  // Load applicants
  const loadApplicants = async () => {
    setIsLoading(true);
    try {
      const res = await applicationsApi.getCompanyApplications(selectedStatus, selectedInternshipId);
      setApplicants(res?.data || []);
    } catch (err) {
      console.error('Failed to load company applicants:', err);
      setApplicants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [selectedInternshipId, selectedStatus]);

  const handleOpenStatusModal = (applicant) => {
    setSelectedApplicant(applicant);
    setNewStatus(applicant.status || 'under_review');
    setRecruiterNotes(applicant.notes || '');
    setUpdateError('');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    if (e) e.preventDefault();
    if (!selectedApplicant) return;

    setIsUpdating(true);
    setUpdateError('');
    try {
      await applicationsApi.updateApplicationStatus(
        selectedApplicant._id,
        newStatus,
        recruiterNotes.trim()
      );
      setIsStatusModalOpen(false);
      loadApplicants();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      setUpdateError(err.message || 'Failed to update candidate status');
    } finally {
      setIsUpdating(false);
    }
  };

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
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hired
          </Badge>
        );
      case 'rejected':
        return (
          <Badge size="sm" className="gap-1 font-bold rounded-lg uppercase tracking-wider text-[11px] bg-rose-50 text-rose-900 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm" className="rounded-lg uppercase tracking-wider text-[11px]">{status}</Badge>;
    }
  };

  // Filtered by search term (candidate name or email)
  const filteredApplicants = applicants.filter((app) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const studentName = app.student?.name?.toLowerCase() || '';
    const studentEmail = app.student?.email?.toLowerCase() || '';
    const jobTitle = app.internship?.title?.toLowerCase() || '';
    return studentName.includes(term) || studentEmail.includes(term) || jobTitle.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Metrics - Luxury Forest Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-[#1E3B2F] shadow-2xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Candidates</span>
          <div className="text-2xl font-extrabold text-[#1E3B2F] mt-1">{applicants.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 shadow-2xs">
          <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Pending Review</span>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">
            {applicants.filter((a) => a.status === 'applied' || a.status === 'under_review').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-[#C8B48A] shadow-2xs">
          <span className="text-xs text-[#1E3B2F] font-bold uppercase tracking-wider block">Shortlisted</span>
          <div className="text-2xl font-extrabold text-[#1E3B2F] mt-1">
            {applicants.filter((a) => a.status === 'shortlisted').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-t-4 border-t-emerald-600 shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Hired</span>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">
            {applicants.filter((a) => a.status === 'hired').length}
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#1E3B2F]/60 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] focus:border-[#1E3B2F]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Position Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 w-full sm:w-auto">
            <span className="font-bold whitespace-nowrap text-[#1E3B2F]">Position:</span>
            <select
              value={selectedInternshipId}
              onChange={(e) => setSelectedInternshipId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] font-medium max-w-[200px]"
            >
              <option value="all">All Positions</option>
              {internships.map((int) => (
                <option key={int._id} value={int._id}>
                  {int.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 w-full sm:w-auto">
            <span className="font-bold whitespace-nowrap text-[#1E3B2F]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] font-medium"
            >
              <option value="all">All Stages</option>
              <option value="applied">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Candidates List Table */}
      <Card className="overflow-hidden p-0 rounded-xl border border-slate-200 shadow-xs">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredApplicants.length === 0 ? (
          <EmptyState
            title="No Applicants Found"
            description={
              searchTerm || selectedStatus !== 'all' || selectedInternshipId !== 'all'
                ? 'No applicants match the current filter criteria.'
                : 'No candidates have applied to your internship positions yet.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-600">
              <thead className="text-[11px] uppercase bg-[#F5F0E6]/50 text-slate-700 font-bold border-b border-[#C8B48A]/30">
                <tr>
                  <th className="px-5 py-3.5">Candidate Details</th>
                  <th className="px-5 py-3.5">Position Applied</th>
                  <th className="px-5 py-3.5">Match Fit</th>
                  <th className="px-5 py-3.5">Submitted CV</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Recruiter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplicants.map((app) => {
                  const studentName = app.student?.name || 'Applicant';
                  const studentEmail = app.student?.email || '';
                  const university = app.studentProfile?.university || 'South Eastern University';
                  const degree = app.studentProfile?.degree || 'ICT Undergraduate';

                  return (
                    <tr key={app._id} className="hover:bg-[#F5F0E6]/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{studentName}</div>
                        <div className="text-xs text-gray-500">{studentEmail}</div>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                          <GraduationCap className="w-3.5 h-3.5 text-[#1E3B2F]" />
                          <span>{degree} • {university}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{app.internship?.title}</div>
                        <div className="text-xs text-gray-500">{app.internship?.area}</div>
                      </td>

                      <td className="px-5 py-4">
                        {app.matchScore !== undefined ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#7F8C6A]/15 text-[#1E3B2F] border border-[#7F8C6A]/30">
                            <Sparkles className="w-3 h-3 text-[#1E3B2F]" /> {app.matchScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3B2F] hover:text-[#152A22] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#1E3B2F]" />
                            <span>View CV</span>
                            <ExternalLink className="w-3 h-3 text-[#C8B48A]" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">No attachment</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenStatusModal(app)}
                          className="text-xs gap-1 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] border border-[#1E3B2F] font-semibold shadow-xs"
                        >
                          Review & Update
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Recruiter Decision & Notes Modal - Luxury Forest Theme */}
      {selectedApplicant && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Review Candidate: ${selectedApplicant.student?.name || 'Applicant'}`}
          maxWidth="max-w-lg rounded-2xl"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={isUpdating}
                className="rounded-xl border-[#C8B48A]/60 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveStatus}
                isLoading={isUpdating}
                className="bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] border border-[#1E3B2F] font-semibold shadow-xs"
              >
                Save Decision
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            {updateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {updateError}
              </div>
            )}

            {/* Candidate Summary */}
            <div className="p-3.5 bg-[#F5F0E6]/80 rounded-xl border border-[#C8B48A]/40 border-l-4 border-l-[#1E3B2F] space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-[#1E3B2F]">{selectedApplicant.student?.name}</h4>
                  <p className="text-xs text-slate-600">{selectedApplicant.student?.email}</p>
                </div>
                {selectedApplicant.matchScore !== undefined && (
                  <Badge size="sm" className="font-bold bg-[#1E3B2F] text-[#F5F0E6] border border-[#152A22] rounded-lg">
                    {selectedApplicant.matchScore}% Fit
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-600 pt-1 border-t border-[#C8B48A]/30">
                Applied for: <strong className="text-[#1E3B2F]">{selectedApplicant.internship?.title}</strong>
              </div>
            </div>

            {/* Candidate Cover Letter */}
            {selectedApplicant.coverLetter && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Candidate Statement / Cover Letter:
                </label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                  {selectedApplicant.coverLetter}
                </div>
              </div>
            )}

            {/* Recruitment Stage Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Recruitment Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] focus:border-[#1E3B2F]"
              >
                <option value="applied">Submitted (Initial Stage)</option>
                <option value="under_review">Under Review (Screening in Progress)</option>
                <option value="shortlisted">Shortlisted (Proceed to Interview)</option>
                <option value="hired">Hired (Offer Extended & Accepted)</option>
                <option value="rejected">Rejected (Not Selected)</option>
              </select>
            </div>

            {/* Recruiter Feedback / Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Employer Feedback / Candidate Notes
              </label>
              <textarea
                rows={3}
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="Add interview scheduling instructions, technical evaluation notes, or reason for status update..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] focus:border-[#1E3B2F] resize-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Visible to candidate as instructions / evaluation status.
              </p>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CompanyApplicantReview;
