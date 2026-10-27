import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { apiClient } from '../../../services/apiClient';
import { useAuth } from '../../../hooks/useAuth';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  ExternalLink,
  CheckCircle2,
  Building2,
  GraduationCap,
} from 'lucide-react';

export const VerificationRequestForm = ({ onSuccess, onCancel, standalone = false }) => {
  const { user } = useAuth();

  const isCompanyUser = user?.role === 'company';
  const [verificationType, setVerificationType] = useState(
    isCompanyUser ? 'Company' : 'Reviewer'
  );
  const [institutionOrOrg, setInstitutionOrOrg] = useState('');
  const [designationOrRegNo, setDesignationOrRegNo] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Selected file exceeds the 10MB limit.');
      return;
    }

    setError('');
    setFile(selectedFile);
    // If user selected file, clear documentUrl or keep as fallback
    setDocumentUrl(selectedFile.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!documentUrl && !file) {
      setError('Please provide a document proof URL or upload a proof document.');
      return;
    }

    setLoading(true);

    try {
      let res;

      if (file) {
        // Multipart upload via FormData
        const formData = new FormData();
        formData.append('verificationType', verificationType);
        formData.append('institutionOrOrg', institutionOrOrg.trim());
        formData.append('designationOrRegNo', designationOrRegNo.trim());
        formData.append('description', description.trim());
        formData.append('proofDocument', file);

        res = await apiClient.post('/verifications/request', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Direct JSON submission with documentUrl
        res = await apiClient.post('/verifications/request', {
          verificationType,
          institutionOrOrg: institutionOrOrg.trim(),
          designationOrRegNo: designationOrRegNo.trim(),
          documentUrl: documentUrl.trim(),
          proofDocumentUrl: documentUrl.trim(),
          description: description.trim(),
        });
      }

      setSuccessMsg(
        res.message || 'Verification request submitted successfully! Awaiting administrator approval.'
      );

      // Reset form
      setFile(null);
      setDocumentUrl('');
      setDescription('');
      setInstitutionOrOrg('');
      setDesignationOrRegNo('');

      if (onSuccess) {
        setTimeout(() => onSuccess(res.data), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert type="danger" title="Submission Error">
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert type="success" title="Submitted Successfully">
          {successMsg}
        </Alert>
      )}

      {/* Role Selection Tabs */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Verification Category
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVerificationType('Reviewer')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
              verificationType === 'Reviewer'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Reviewer (Lecturer)</span>
          </button>

          <button
            type="button"
            onClick={() => setVerificationType('Company')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
              verificationType === 'Company'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company / Employer</span>
          </button>
        </div>
      </div>

      {/* Organization / Institution */}
      <Input
        label={
          verificationType === 'Company'
            ? 'Registered Company / Organization Name'
            : 'University / Higher Educational Institution'
        }
        placeholder={
          verificationType === 'Company'
            ? 'e.g. Virtusa Private Limited'
            : 'e.g. South Eastern University of Sri Lanka'
        }
        value={institutionOrOrg}
        onChange={(e) => setInstitutionOrOrg(e.target.value)}
        required
      />

      {/* Designation or BRN */}
      <Input
        label={
          verificationType === 'Company'
            ? 'Business Registration Number (BRN) or Tax ID'
            : 'Academic Designation & Staff ID'
        }
        placeholder={
          verificationType === 'Company'
            ? 'e.g. PV-12345 or C-987654'
            : 'e.g. Senior Lecturer (Staff ID: ICT-L-042)'
        }
        value={designationOrRegNo}
        onChange={(e) => setDesignationOrRegNo(e.target.value)}
        required
      />

      {/* Document Proof URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Proof Document URL (Supabase or Cloud Link)
        </label>
        <div className="relative">
          <Input
            placeholder="https://supabase.../verification_proofs/doc.pdf"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Paste a public Supabase Storage URL, Google Drive link, or upload a file directly below.
        </p>
      </div>

      {/* File Upload Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or Upload Proof Document (PDF, PNG, JPG up to 10MB)
        </label>
        <div className="flex justify-center px-6 pt-4 pb-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-colors bg-gray-50/50">
          <div className="space-y-1 text-center">
            {file ? (
              <div className="flex items-center justify-center gap-2 text-indigo-600">
                <FileText className="w-6 h-6" />
                <span className="text-sm font-semibold">{file.name}</span>
                <span className="text-xs text-gray-400">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setDocumentUrl('');
                  }}
                  className="text-xs text-red-500 hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <UploadCloud className="w-5 h-5 text-gray-400" />
                <label
                  htmlFor="file-upload-input"
                  className="cursor-pointer text-indigo-600 hover:underline font-semibold"
                >
                  Choose File
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
                <span>or drag & drop</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description / Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description / Verification Notes
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide any additional details or background to assist administrators with verifying your credentials..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={loading}>
          <ShieldCheck className="w-4 h-4 mr-1.5 inline" />
          Submit Verification Request
        </Button>
      </div>
    </form>
  );

  if (standalone) {
    return (
      <Card className="max-w-2xl mx-auto shadow-md border-gray-200">
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Verification Request Submission
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Submit your university or corporate credentials to receive a Verified Trust badge and full platform authorization.
          </p>
        </div>
        {content}
      </Card>
    );
  }

  return content;
};

export default VerificationRequestForm;
