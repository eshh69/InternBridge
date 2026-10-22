import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import {
  Award,
  ShieldCheck,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
} from 'lucide-react';

export const CertificatesBadgesSection = ({
  certificates = [],
  badges = [],
  onSaveCertificates,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certFormData, setCertFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
  });

  const handleAddCertificate = (e) => {
    e.preventDefault();
    if (!certFormData.title || !certFormData.issuer) return;

    const newCert = {
      title: certFormData.title.trim(),
      issuer: certFormData.issuer.trim(),
      issueDate: certFormData.issueDate || null,
      credentialUrl: certFormData.credentialUrl.trim(),
    };

    onSaveCertificates([...certificates, newCert]);
    setIsModalOpen(false);
    setCertFormData({ title: '', issuer: '', issueDate: '', credentialUrl: '' });
  };

  const handleDeleteCertificate = (index) => {
    const updated = certificates.filter((_, i) => i !== index);
    onSaveCertificates(updated);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="space-y-4 !rounded-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Certificates & Accreditations</h3>
          <span className="text-xs px-2 py-0.5 !rounded-none bg-indigo-50 text-indigo-700 font-medium">
            {certificates.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-indigo-600 hover:text-indigo-800 gap-1 text-xs !rounded-none"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certificate
        </Button>
      </div>

      {certificates.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2 text-center">
          No external certificates added. Include online course or industry accreditations (AWS, Coursera, Meta, etc.).
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certificates.map((cert, idx) => (
            <div
              key={idx}
              className="p-3 !rounded-none border border-gray-100 bg-gray-50/50 flex items-start justify-between gap-3"
            >
              <div>
                <h4 className="text-xs font-semibold text-gray-900">{cert.title}</h4>
                <p className="text-xs text-indigo-600 font-medium">{cert.issuer}</p>
                {cert.issueDate && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Issued {formatDate(cert.issueDate)}</span>
                  </div>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Credential
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteCertificate(idx)}
                className="p-1 text-gray-400 hover:text-red-500 !rounded-none transition-colors"
                title="Remove certificate"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Badges Earned Strip */}
      {badges && badges.length > 0 && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Platform Badges Earned ({badges.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 !rounded-none text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {b.name || 'Achievement Badge'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Certificate / Accreditation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isLoading} className="!rounded-none">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCertificate} isLoading={isLoading} className="!rounded-none">
              Add Certificate
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCertificate} className="space-y-4">
          <Input
            label="Certificate / Course Title"
            value={certFormData.title}
            onChange={(e) => setCertFormData({ ...certFormData, title: e.target.value })}
            placeholder="e.g. AWS Certified Cloud Practitioner"
            required
            className="!rounded-none"
          />
          <Input
            label="Issuing Organization"
            value={certFormData.issuer}
            onChange={(e) => setCertFormData({ ...certFormData, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services, Coursera, Meta"
            required
            className="!rounded-none"
          />
          <Input
            label="Issue Date"
            type="date"
            value={certFormData.issueDate}
            onChange={(e) => setCertFormData({ ...certFormData, issueDate: e.target.value })}
            className="!rounded-none"
          />
          <Input
            label="Credential Verification URL"
            value={certFormData.credentialUrl}
            onChange={(e) => setCertFormData({ ...certFormData, credentialUrl: e.target.value })}
            placeholder="https://www.credly.com/badges/..."
            className="!rounded-none"
          />
        </form>
      </Modal>
    </Card>
  );
};
