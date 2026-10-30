import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import applicationsApi from './applicationsApi';
import apiClient from '../../services/apiClient';

const DEFAULT_SAMPLE_INTERNSHIPS = [
  {
    _id: 'int_01',
    title: 'Full Stack Engineering Intern',
    company: { name: 'IFS Sri Lanka', _id: 'comp_01' },
    location: 'Colombo (Hybrid)',
    locationType: 'Hybrid',
    stipend: 'LKR 55,000 / month',
    matchScore: 94,
  },
  {
    _id: 'int_02',
    title: 'Cloud & DevOps Intern',
    company: { name: 'Sysco LABS', _id: 'comp_02' },
    location: 'Colombo / Remote',
    locationType: 'Remote',
    stipend: 'LKR 50,000 / month',
    matchScore: 82,
  },
  {
    _id: 'int_03',
    title: 'Quality Assurance (QA) Automation Intern',
    company: { name: 'WSO2 Sri Lanka', _id: 'comp_03' },
    location: 'Colombo (On-site)',
    locationType: 'On-site',
    stipend: 'LKR 45,000 / month',
    matchScore: 89,
  },
  {
    _id: 'int_04',
    title: 'Associate Mobile Developer Intern',
    company: { name: 'Virtusa Corp', _id: 'comp_04' },
    location: 'Colombo (Hybrid)',
    locationType: 'Hybrid',
    stipend: 'LKR 48,000 / month',
    matchScore: 91,
  },
];

export const ApplyModal = ({
  isOpen,
  onClose,
  internship: propInternship,
  onSuccess,
}) => {
  const [selectedInternship, setSelectedInternship] = useState(propInternship || DEFAULT_SAMPLE_INTERNSHIPS[0]);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedInternship(propInternship || DEFAULT_SAMPLE_INTERNSHIPS[0]);
      setErrorMessage('');
      setIsSuccess(false);

      // Pre-fill student profile CV if available
      apiClient
        .get('/students/me')
        .then((res) => {
          if (res?.data?.cvUrl) {
            setResumeUrl(res.data.cvUrl);
          } else if (!resumeUrl) {
            setResumeUrl('https://internbridge.storage/resumes/bandara_portfolio_cv.pdf');
          }
        })
        .catch(() => {
          if (!resumeUrl) {
            setResumeUrl('https://internbridge.storage/resumes/bandara_portfolio_cv.pdf');
          }
        });
    }
  }, [isOpen, propInternship]);

  if (!isOpen) return null;

  const currentInternship = selectedInternship || DEFAULT_SAMPLE_INTERNSHIPS[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResumeUrl(`https://internbridge.storage/resumes/${encodeURIComponent(file.name)}`);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!resumeUrl.trim()) {
      setErrorMessage('Please provide a valid resume link or upload a CV document.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await applicationsApi.submitApplication({
        internshipId: currentInternship._id || currentInternship.id,
        internshipTitle: currentInternship.title,
        companyName: currentInternship.company?.name || currentInternship.companyName,
        companyId: currentInternship.company?._id || currentInternship.companyId,
        resumeUrl: resumeUrl.trim(),
        coverLetter: coverLetter.trim(),
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(response?.data || response);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCoverLetter('');
    setResumeUrl('');
    setFileName('');
    setErrorMessage('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Internship Application"
      maxWidth="max-w-xl !rounded-none"
      footer={
        isSuccess ? (
          <Button
            variant="primary"
            onClick={handleClose}
            className="!rounded-none !bg-blue-600 hover:!bg-blue-700 !border-blue-600 text-white font-semibold"
          >
            Done
          </Button>
        ) : (
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              className="!rounded-none border-slate-300 font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="!rounded-none !bg-blue-600 hover:!bg-blue-700 !border-blue-600 text-white font-semibold shadow-xs"
            >
              Submit Application
            </Button>
          </div>
        )
      }
    >
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 !rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Application Submitted Successfully!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your application for <strong className="text-gray-900">{currentInternship.title}</strong> at <strong className="text-gray-900">{currentInternship.company?.name || currentInternship.companyName}</strong> has been transmitted.
            </p>
          </div>
          <Alert type="success" className="text-left mt-3 !rounded-none border-l-4 border-l-blue-600">
            Your application is now visible in the Application & Recruitment Tracker. Both you and the company recruiter can track progress.
          </Alert>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* If no specific internship passed, allow selecting which listing to apply for */}
          {!propInternship && (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Select Opportunity to Apply For
              </label>
              <select
                value={currentInternship._id}
                onChange={(e) => {
                  const found = DEFAULT_SAMPLE_INTERNSHIPS.find((i) => i._id === e.target.value);
                  if (found) setSelectedInternship(found);
                }}
                className="w-full px-3 py-2 border border-slate-300 !rounded-none text-xs bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {DEFAULT_SAMPLE_INTERNSHIPS.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title} — {item.company?.name} ({item.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Internship Target Summary - Sharp Corners & Blue Theme */}
          <div className="bg-slate-50 !rounded-none p-3.5 border border-slate-200 border-l-4 border-l-blue-600 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-gray-900">{currentInternship.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    {currentInternship.company?.name || currentInternship.companyName || 'Company Partner'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {currentInternship.location || 'Colombo'} ({currentInternship.locationType || 'Full-time'})
                  </span>
                </div>
              </div>
              {currentInternship.matchScore !== undefined && (
                <Badge variant="info" size="sm" className="font-bold flex-shrink-0 !rounded-none !bg-blue-600 text-white !border-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {currentInternship.matchScore}% Match
                </Badge>
              )}
            </div>
          </div>

          {errorMessage && (
            <Alert type="danger" title="Application Notice" className="!rounded-none">
              {errorMessage}
            </Alert>
          )}

          {/* Resume Upload / Link */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Resume / CV Attachment <span className="text-red-500">*</span>
            </label>

            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 !rounded-none p-4 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="resume-file-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resume-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <div className="w-8 h-8 !rounded-none bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-blue-600 hover:underline">
                  Click to attach CV from computer
                </span>
                <span className="text-[11px] text-gray-400">PDF, DOC, DOCX up to 5MB</span>
              </label>

              {fileName && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 !rounded-none text-xs font-medium text-gray-800">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Selected: {fileName}</span>
                </div>
              )}
            </div>

            <div className="relative mt-2">
              <Input
                label="Or Direct Resume URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://internbridge.storage/resumes/..."
                helperText="Link to your hosted CV or portfolio document"
                className="!rounded-none"
                required
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="cover-letter" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Cover Letter / Statement <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-xs text-gray-400">{coverLetter.length}/800</span>
            </div>
            <textarea
              id="cover-letter"
              rows={3}
              maxLength={800}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Briefly state your passion, key projects, or why you are excited to join this internship..."
              className="w-full px-3 py-2 border border-slate-300 !rounded-none text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ApplyModal;
