import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Building2,
  CheckCircle,
  FileText,
  AlertCircle,
  Edit3,
} from 'lucide-react';

export const InternshipDetailsModal = ({
  isOpen,
  onClose,
  internship,
  onEdit,
  onStatusChange,
}) => {
  if (!internship) return null;

  const statusVariant =
    internship.status === 'published'
      ? 'success'
      : internship.status === 'draft'
      ? 'neutral'
      : 'warning';

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Not set';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const formatted = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (diffDays < 0) return `${formatted} (Expired)`;
    if (diffDays === 0) return `${formatted} (Today)`;
    return `${formatted} (${diffDays} days left)`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Internship Listing Details"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex gap-2">
            {internship.status === 'published' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onStatusChange(internship._id, 'closed');
                  onClose();
                }}
              >
                Close Listing
              </Button>
            )}

            {internship.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onStatusChange(internship._id, 'published');
                  onClose();
                }}
              >
                Publish Now
              </Button>
            )}

            {internship.status === 'closed' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onStatusChange(internship._id, 'published');
                  onClose();
                }}
              >
                Reopen Listing
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onClose();
                onEdit(internship);
              }}
            >
              <Edit3 className="w-4 h-4" /> Edit Listing
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                {internship.title}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {internship.area}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {internship.location} ({internship.locationType})
                </span>
              </p>
            </div>
            <Badge variant={statusVariant} size="md" className="capitalize">
              {internship.status}
            </Badge>
          </div>
        </div>

        {/* Quick KPI Spec Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
              Duration
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {internship.durationMonths} Months
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
              Positions
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              {internship.openPositions} {internship.openPositions === 1 ? 'Slot' : 'Slots'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
              Compensation
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5">
              {internship.stipend?.isPaid
                ? `${internship.stipend.currency || 'LKR'} ${internship.stipend.amount?.toLocaleString()}/mo`
                : 'Unpaid'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
              Applications
            </span>
            <span className="text-sm font-bold text-indigo-700 mt-0.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {internship.applicantCount || 0} Received
            </span>
          </div>
        </div>

        {/* Deadline Notice */}
        <div className="flex items-center gap-2.5 p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 font-medium">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong className="font-bold text-indigo-950">Application Deadline:</strong> {formatDeadline(internship.deadline)}
          </span>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Description & Responsibilities
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {internship.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Required Technical Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {internship.requiredSkills?.map((skill) => (
              <Badge key={skill} variant="neutral" size="md" className="capitalize">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Qualifications */}
        {internship.qualifications && internship.qualifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Qualifications & Requirements
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-sm text-slate-700">
              {internship.qualifications.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};
