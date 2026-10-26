import React, { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const CvUploader = ({ cvUrl, onUploadCv, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Please select a valid document (PDF, DOC, or DOCX).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be 5MB or less.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setErrorMsg('');
      await onUploadCv(selectedFile);
      setSelectedFile(null);
      setSuccessMsg('Your CV has been successfully uploaded and attached to your profile.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload CV. Please try again.');
    }
  };

  return (
    <Card className="space-y-4 !rounded-[10px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Curriculum Vitae (CV / Resume)</h3>
        </div>
        {cvUrl && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 !rounded-none border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Uploaded & Ready
          </span>
        )}
      </div>

      {errorMsg && (
        <Alert type="danger">
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </Alert>
      )}

      {successMsg && (
        <Alert type="success">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        </Alert>
      )}

      {/* Existing CV Banner */}
      {cvUrl && !selectedFile && (
        <div className="p-4 rounded-[10px] border border-indigo-100 bg-indigo-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white !rounded-none border border-indigo-100 shadow-2xs text-indigo-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Current Resume On File</h4>
              <p className="text-xs text-gray-500 mt-0.5">Stored securely in Supabase Storage</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 !rounded-none text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview / Download
            </a>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs !rounded-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace CV
            </Button>
          </div>
        </div>
      )}

      {/* File Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[10px] p-6 text-center transition-all ${
          selectedFile
            ? 'border-indigo-300 bg-indigo-50/20'
            : dragOver
            ? 'border-indigo-500 bg-indigo-50/50 cursor-pointer'
            : 'border-gray-300 hover:border-indigo-400 bg-gray-50/40 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold text-sm">
              <FileText className="w-5 h-5" />
              <span>{selectedFile.name}</span>
              <span className="text-xs text-gray-400 font-normal">
                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                isLoading={isLoading}
                className="gap-1.5 !rounded-none"
              >
                <UploadCloud className="w-4 h-4" />
                Confirm & Upload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="!rounded-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop your CV file
            </div>
            <p className="text-[11px] text-gray-400">PDF, DOC, or DOCX (Max 5MB)</p>
          </div>
        )}
      </div>
    </Card>
  );
};
