import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

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
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold !rounded-none border transition-all ${
                verificationType === 'reviewer'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Academic Reviewer
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('company')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold !rounded-none border transition-all ${
                verificationType === 'company'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
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
          <div className="mt-1 flex justify-center px-6 pt-4 pb-5 border-2 border-gray-300 border-dashed !rounded-none hover:border-blue-500 transition-colors bg-gray-50/50">
            <div className="space-y-1.5 text-center">
              {file ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <FileText className="w-7 h-7" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900">{file.name}</p>
                    <p className="text-[11px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-8 w-8 text-blue-500" />
                  <div className="flex text-xs text-gray-600 justify-center">
                    <label
                      htmlFor="proof-upload"
                      className="relative cursor-pointer !rounded-none font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload Proof Document</span>
                      <input
                        id="proof-upload"
                        name="proofDocument"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag & drop</p>
                  </div>
                  <p className="text-[11px] text-gray-400">PDF, PNG, JPG up to 10MB (Simulated cloud upload)</p>
                </>
              )}
            </div>
          </div>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="mt-1 text-xs text-rose-600 hover:underline"
            >
              Remove selected file
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="text-xs !rounded-none">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="text-xs !rounded-none !bg-blue-600 hover:!bg-blue-700 !border-blue-600 text-white font-semibold shadow-xs"
          >
            Submit for Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VerificationRequestModal;
