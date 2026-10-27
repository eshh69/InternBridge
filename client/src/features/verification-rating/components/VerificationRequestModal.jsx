import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { apiClient } from '../../../services/apiClient';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const VerificationRequestModal = ({
  isOpen,
  onClose,
  userRole = 'reviewer',
  onSuccess,
}) => {
  const isCompany = userRole === 'company';

  const [institutionOrOrg, setInstitutionOrOrg] = useState('');
  const [designationOrRegNo, setDesignationOrRegNo] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionOrOrg.trim()) {
      setError(`Please enter your ${isCompany ? 'Company Name' : 'University / Institution'}.`);
      return;
    }

    if (!designationOrRegNo.trim()) {
      setError(
        `Please enter your ${isCompany ? 'Business Registration Number (BRN)' : 'Academic Designation / Staff ID'}.`
      );
      return;
    }

    if (!file) {
      setError('Please attach a proof document (PDF or image).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('verificationType', isCompany ? 'company' : 'reviewer');
      formData.append('institutionOrOrg', institutionOrOrg.trim());
      formData.append('designationOrRegNo', designationOrRegNo.trim());
      formData.append('proofDocument', file);

      const res = await apiClient.post('/verifications/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg(res.message || 'Verification submitted successfully! Our administrative team will review it.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCompany ? 'Submit Company Verification' : 'Academic Reviewer Verification'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert type="danger" title="Submission Error">
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert type="success" title="Success">
            {successMsg}
          </Alert>
        )}

        <p className="text-sm text-gray-600">
          {isCompany
            ? 'Verify your corporate identity to gain the Verified Business badge and publish trusted internship opportunities.'
            : 'Verify your academic credentials as a university lecturer or supervisor to submit verified endorsements and ratings for students and companies.'}
        </p>

        <Input
          label={isCompany ? 'Registered Company Name' : 'University / Academic Institution'}
          placeholder={isCompany ? 'e.g. Virtusa Private Limited' : 'e.g. South Eastern University of Sri Lanka'}
          value={institutionOrOrg}
          onChange={(e) => setInstitutionOrOrg(e.target.value)}
          required
        />

        <Input
          label={isCompany ? 'Business Registration Number (BRN) / Tax ID' : 'Academic Designation & Staff ID'}
          placeholder={isCompany ? 'e.g. PV-12345' : 'e.g. Senior Lecturer (Staff ID: ICT-L-042)'}
          value={designationOrRegNo}
          onChange={(e) => setDesignationOrRegNo(e.target.value)}
          required
        />

        {/* File Upload Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proof Document (Certificate of Incorporation, Staff ID, or Official Letter) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-gray-50/50">
            <div className="space-y-2 text-center">
              {file ? (
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                  <FileText className="w-8 h-8" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="proof-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="proof-upload"
                        name="proofDocument"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              Remove file
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Submit for Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
};
