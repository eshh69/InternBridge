import React, { useState, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { verificationRatingApi } from '../verificationRatingApi';
import { useAuth } from '../../../hooks/useAuth';
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, Building2, GraduationCap } from 'lucide-react';

export const VerificationRequestModal = ({
  isOpen,
  onClose,
  defaultType = 'reviewer',
  onSuccess,
}) => {
  const { user } = useAuth();
  const [verificationType, setVerificationType] = useState(defaultType);
  const isCompany = verificationType === 'company';

  const [institutionOrOrg, setInstitutionOrOrg] = useState(
    isCompany ? 'Virtusa Private Limited' : 'South Eastern University of Sri Lanka'
  );
  const [designationOrRegNo, setDesignationOrRegNo] = useState(
    isCompany ? 'PV-12489' : 'Senior Lecturer (Staff ID: ICT-L-042)'
  );
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleTypeChange = (type) => {
    setVerificationType(type);
    if (type === 'company') {
      setInstitutionOrOrg('Virtusa Private Limited');
      setDesignationOrRegNo('PV-12489');
    } else {
      setInstitutionOrOrg('South Eastern University of Sri Lanka');
      setDesignationOrRegNo('Senior Lecturer (Staff ID: ICT-L-042)');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError('');
    setFile(droppedFile);
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

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await verificationRatingApi.submitVerification({
        verificationType,
        institutionOrOrg: institutionOrOrg.trim(),
        designationOrRegNo: designationOrRegNo.trim(),
        proofDocument: file,
        file,
        user: user || {
          name: isCompany ? institutionOrOrg : 'Academic Reviewer',
          email: isCompany ? 'company@internbridge.lk' : 'reviewer@internbridge.lk',
          role: verificationType,
        },
      });

      setSuccessMsg(res.message || 'Verification submitted successfully! Queued for administrative moderation.');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.verification);
        onClose();
        setSuccessMsg('');
      }, 1200);
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
      title={isCompany ? 'Submit Company Verification' : 'Submit Academic Reviewer Verification'}
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

        {/* Verification Type Switcher */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Applicant Verification Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('reviewer')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                verificationType === 'reviewer'
                  ? 'bg-[#7F8C6A]/15 border-[#1E3B2F] text-[#1E3B2F] font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#1E3B2F]" />
              Academic Reviewer
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('company')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                verificationType === 'company'
                  ? 'bg-[#7F8C6A]/15 border-[#1E3B2F] text-[#1E3B2F] font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#1E3B2F]" />
              Corporate Company
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600">
          {isCompany
            ? 'Verify your corporate legal identity to receive the Verified Business accreditation and post authentic internship offers.'
            : 'Verify your university faculty credentials to submit certified academic reviews, skill ratings, and official student recommendations.'}
        </p>

        <Input
          label={isCompany ? 'Registered Corporate Entity' : 'University / Academic Institution'}
          placeholder={isCompany ? 'e.g. Virtusa Private Limited' : 'e.g. South Eastern University of Sri Lanka'}
          value={institutionOrOrg}
          onChange={(e) => setInstitutionOrOrg(e.target.value)}
          required
        />

        <Input
          label={isCompany ? 'Business Registration Number (BRN) / Tax ID' : 'Academic Designation & Staff ID'}
          placeholder={isCompany ? 'e.g. PV-12489' : 'e.g. Senior Lecturer (Staff ID: ICT-L-042)'}
          value={designationOrRegNo}
          onChange={(e) => setDesignationOrRegNo(e.target.value)}
          required
        />

        {/* File Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Proof Document (Certificate of Incorporation, Faculty ID, or Appointment Letter)
          </label>

          {/* Hidden File Input always ready to trigger */}
          <input
            ref={fileInputRef}
            id="proof-upload"
            name="proofDocument"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragging
                ? 'border-[#1E3B2F] bg-[#7F8C6A]/20 scale-[1.01]'
                : file
                ? 'border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-[#C8B48A]/70 hover:border-[#1E3B2F] bg-[#F5F0E6]/30 hover:bg-[#F5F0E6]/60'
            }`}
          >
            {file ? (
              <div className="flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-2.5 text-[#1E3B2F]">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 truncate max-w-[220px]">{file.name}</p>
                    <p className="text-[11px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBoxClick();
                    }}
                    className="text-xs font-bold text-[#1E3B2F] hover:underline px-2 py-1"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-center select-none">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#7F8C6A]/15 text-[#1E3B2F] flex items-center justify-center">
                  <UploadCloud className="w-5 h-5 text-[#1E3B2F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E3B2F]">
                    Click to browse file <span className="font-normal text-gray-500">or drag & drop</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Supports PDF, PNG, JPG, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="text-xs rounded-lg">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="text-xs rounded-lg !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] font-semibold shadow-xs"
          >
            Submit for Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VerificationRequestModal;
