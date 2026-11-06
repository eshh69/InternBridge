import React, { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Trash2,
  FileCheck2,
} from 'lucide-react';

export const CvUploader = ({ cvUrl, onUploadCv, onDeleteCv, isLoading, isDeletingCv }) => {
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
      setSuccessMsg('CV updated successfully.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload CV.');
    }
  };

  const handleDelete = async () => {
    if (!onDeleteCv) return;
    if (window.confirm('Remove uploaded CV?')) {
      try {
        setErrorMsg('');
        setSuccessMsg('');
        await onDeleteCv();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSuccessMsg('CV removed.');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to remove CV.');
      }
    }
  };

  return (
    <Card className="space-y-4 rounded-2xl shadow-xs border border-gray-200/90 p-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Resume</h3>
        </div>
      </div>

      {errorMsg && (
        <Alert type="danger">
          <div className="flex items-center gap-1.5 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </Alert>
      )}

      {successMsg && (
        <Alert type="success">
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When CV Exists */}
      {cvUrl && !selectedFile && (
        <div className="space-y-3">
          {/* Subtle Document Preview Frame */}
          <div className="relative w-full h-44 sm:h-52 bg-gray-50 border border-gray-200/90 rounded-xl overflow-hidden group select-none">
            {/* Elegant Document Paper Mockup Silhouette (Faint Background) */}
            <div className="absolute inset-0 p-4 bg-white flex flex-col justify-between">
              <div className="space-y-2.5 opacity-30">
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-32 bg-gray-400 rounded-md" />
                  <div className="h-2 w-16 bg-gray-300 rounded-md" />
                </div>
                <div className="h-1.5 w-44 bg-gray-300 rounded-md" />
                <div className="border-b border-gray-200 pt-1" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-md" />
                  <div className="h-1.5 w-11/12 bg-gray-200 rounded-md" />
                  <div className="h-1.5 w-4/5 bg-gray-200 rounded-md" />
                </div>
                <div className="space-y-1.5 pt-1.5">
                  <div className="h-2 w-20 bg-gray-300 rounded-md" />
                  <div className="h-1.5 w-full bg-gray-200 rounded-md" />
                  <div className="h-1.5 w-3/4 bg-gray-200 rounded-md" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                <span>Resume</span>
                <span>Page 1</span>
              </div>
            </div>

            {/* Live PDF Embed if available - faint subtle opacity */}
            {Boolean(
              cvUrl &&
                (cvUrl.toLowerCase().includes('.pdf') ||
                  !cvUrl.toLowerCase().includes('.doc'))
            ) && (
              <iframe
                src={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                title="Resume Preview"
                className="absolute inset-0 w-full h-[520px] -mt-1 border-0 pointer-events-none opacity-80 group-hover:opacity-95 transition-opacity"
                loading="lazy"
              />
            )}

            {/* Subtle Gradient Shadow & Hover Overlay */}
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 cursor-pointer"
              title="Click to view full CV in new tab"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-gray-800 shadow-sm rounded-xl hover:bg-gray-50">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Preview Full Document
              </span>
            </a>
          </div>

          {/* Action Row */}
          <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-800 truncate">Resume Document</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3 h-3 text-gray-500" />
                <span>View</span>
              </a>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isDeletingCv}
                className="gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                Replace
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading || isDeletingCv}
                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                title="Delete CV"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected for replace/upload */}
      {selectedFile && (
        <div className="p-3.5 border border-blue-200 bg-blue-50/30 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs font-semibold text-gray-900 truncate flex-1">{selectedFile.name}</p>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              isLoading={isLoading}
              className="text-xs rounded-xl font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-xs rounded-xl text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Empty Dropzone */}
      {!cvUrl && !selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/20'
          }`}
        >
          <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-gray-700">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop CV
          </p>
        </div>
      )}
    </Card>
  );
};
