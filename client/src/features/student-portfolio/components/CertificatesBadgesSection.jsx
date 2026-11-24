import React, { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import studentPortfolioService from '../services/studentPortfolioService';
import {
  Award,
  ShieldCheck,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
  Copy,
  Check,
  UploadCloud,
  FileText,
  FileCheck2,
  Eye,
  Building2,
  Hash,
  Sparkles,
} from 'lucide-react';

export const CertificatesBadgesSection = ({
  certificates = [],
  badges = [],
  studentName = 'Student',
  onSaveCertificates,
  onSaveBadges,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'certificates' | 'badges'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // for sub-window detail modal
  const [copiedId, setCopiedId] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Form State
  const [itemType, setItemType] = useState('certificate'); // 'certificate' | 'badge'
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: '',
    certificateFileUrl: '',
    description: '',
  });

  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [uploadFilePreview, setUploadFilePreview] = useState('');
  const fileInputRef = useRef(null);

  // Normalize all items (merging certificates and badges if stored separately)
  const normalizedCertificates = (certificates || []).map((c, idx) => ({
    ...c,
    _source: 'certificate',
    _index: idx,
    type: c.type || 'certificate',
    title: c.title || c.name || '',
    issuer: c.issuer || c.issuedBy || '',
    issueDate: c.issueDate || c.earnedAt || null,
    credentialId: c.credentialId || '',
    credentialUrl: c.credentialUrl || '',
    certificateFileUrl: c.certificateFileUrl || c.imageUrl || '',
    description: c.description || '',
  }));

  const normalizedBadges = (badges || []).map((b, idx) => ({
    ...b,
    _source: 'badge',
    _index: idx,
    type: 'badge',
    title: b.name || b.title || '',
    issuer: b.issuedBy || b.issuer || '',
    issueDate: b.earnedAt || b.issueDate || null,
    credentialId: b.credentialId || '',
    credentialUrl: b.credentialUrl || '',
    certificateFileUrl: b.imageUrl || b.certificateFileUrl || '',
    description: b.description || '',
  }));

  // Unified items list
  const allItems = [...normalizedCertificates, ...normalizedBadges];

  const displayedItems = allItems.filter((item) => {
    if (activeTab === 'certificates') return item.type !== 'badge';
    if (activeTab === 'badges') return item.type === 'badge';
    return true;
  });

  const certCount = allItems.filter((i) => i.type !== 'badge').length;
  const badgeCount = allItems.filter((i) => i.type === 'badge').length;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedUploadFile(file);
      if (file.type.startsWith('image/')) {
        setUploadFilePreview(URL.createObjectURL(file));
      } else {
        setUploadFilePreview('');
      }
    }
  };

  const handleOpenAddModal = () => {
    setItemType('certificate');
    setFormData({
      title: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
      credentialUrl: '',
      certificateFileUrl: '',
      description: '',
    });
    setSelectedUploadFile(null);
    setUploadFilePreview('');
    setIsAddModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) return;

    let finalFileUrl = formData.certificateFileUrl.trim();

    // If a manual file was chosen, upload to Supabase storage
    if (selectedUploadFile) {
      try {
        setIsUploadingFile(true);
        const uploadedUrl = await studentPortfolioService.uploadCertificateFile(selectedUploadFile);
        if (uploadedUrl) {
          finalFileUrl = uploadedUrl;
        }
      } catch (err) {
        console.error('File upload failed, falling back:', err);
        // Fallback to local data URL if available
        if (uploadFilePreview) finalFileUrl = uploadFilePreview;
      } finally {
        setIsUploadingFile(false);
      }
    }

    const newItem = {
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      issueDate: formData.issueDate || null,
      credentialId: formData.credentialId.trim(),
      credentialUrl: formData.credentialUrl.trim(),
      certificateFileUrl: finalFileUrl,
      type: itemType,
      description: formData.description.trim(),
    };

    if (itemType === 'badge' && onSaveBadges) {
      const badgeData = {
        name: newItem.title,
        issuedBy: newItem.issuer,
        earnedAt: newItem.issueDate || new Date().toISOString(),
        credentialId: newItem.credentialId,
        credentialUrl: newItem.credentialUrl,
        imageUrl: finalFileUrl,
        description: newItem.description,
      };
      onSaveBadges([...badges, badgeData]);
    } else {
      // Store in certificates array
      onSaveCertificates([...certificates, newItem]);
    }

    setIsAddModalOpen(false);
    setSelectedUploadFile(null);
    setUploadFilePreview('');
  };

  const handleDeleteItem = (item, e) => {
    e.stopPropagation();
    const typeLabel = item.type === 'badge' ? 'badge' : 'certificate';
    if (window.confirm(`Delete this ${typeLabel}: "${item.title}"?`)) {
      if (item._source === 'badge' && onSaveBadges) {
        const updated = badges.filter((_, i) => i !== item._index);
        onSaveBadges(updated);
      } else {
        const updated = certificates.filter((_, i) => i !== item._index);
        onSaveCertificates(updated);
      }
      if (selectedItem?.title === item.title) {
        setSelectedItem(null);
      }
    }
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
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

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  return (
    <Card className="space-y-4 rounded-2xl shadow-2xs border border-[#C8B48A]/40 p-5 sm:p-6 bg-white w-full">
      {/* Header with Title, Tabs, and Minimal '+' Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#1E3B2F]" />
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Certificates & Digital Badges</h3>
          {allItems.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7F8C6A]/15 text-[#1E3B2F] font-semibold border border-[#C8B48A]/40">
              {allItems.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs bg-gray-100/80 p-0.5 rounded-full border border-gray-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 font-medium transition-colors rounded-full ${
                activeTab === 'all'
                  ? 'bg-[#1E3B2F] text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className={`px-3 py-1 font-medium transition-colors rounded-full ${
                activeTab === 'certificates'
                  ? 'bg-[#1E3B2F] text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Certs ({certCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1 font-medium transition-colors rounded-full ${
                activeTab === 'badges'
                  ? 'bg-[#1E3B2F] text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Badges ({badgeCount})
            </button>
          </div>

          {/* Minimal + Icon Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="p-1.5 text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-xl transition-colors focus:outline-none"
            title="Add Certificate or Badge"
            aria-label="Add Certificate or Badge"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Certificates & Badges */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <Award className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
          <p className="text-xs text-gray-500 font-medium">
            {activeTab === 'badges'
              ? 'No badges added yet.'
              : activeTab === 'certificates'
              ? 'No certificates added yet.'
              : 'No certificates or badges added yet.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-2 text-xs font-semibold text-[#1E3B2F] hover:text-[#1E3B2F] underline focus:outline-none"
          >
            + Add your first {activeTab === 'badges' ? 'badge' : 'certificate'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((item, idx) => {
            const hasPreview = Boolean(item.certificateFileUrl);
            const isBadge = item.type === 'badge';

            return (
              <div
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="bg-white border border-[#C8B48A]/40 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1E3B2F]/40 transition-all duration-200 flex flex-col justify-between group select-none cursor-pointer"
                title="Click to view details and certificate preview"
              >
                {/* Certificate / Badge Overview Preview Banner (Matches Project Preview style) */}
                <div className="relative w-full h-36 sm:h-40 bg-slate-50 border-b border-gray-100 overflow-hidden flex items-center justify-center group/preview">
                  {hasPreview && !isPdf(item.certificateFileUrl) ? (
                    <img
                      src={item.certificateFileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : hasPreview && isPdf(item.certificateFileUrl) ? (
                    /* PDF Document Preview Banner */
                    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-rose-50/20 to-slate-100 flex flex-col items-center justify-center p-3 text-center relative">
                      <div className="w-11 h-11 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center justify-center text-rose-600 shadow-2xs mb-1.5 group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black tracking-widest text-rose-700 uppercase bg-rose-100/70 px-2 py-0.5 rounded-full">
                        PDF Certificate
                      </span>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-1 max-w-[200px]">
                        {item.title}
                      </p>
                    </div>
                  ) : (
                    /* Elegant Certificate / Badge Plaque Mockup (when no image file was uploaded) */
                    <div className="w-full h-full bg-gradient-to-br from-[#FAF7F0] via-white to-[#F5F0E6] p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#C8B48A]/15 rounded-full blur-xl pointer-events-none" />
                      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#7F8C6A]/10 rounded-full blur-xl pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-10 h-10 bg-[#7F8C6A]/15 border border-[#C8B48A]/40 text-[#1E3B2F] flex items-center justify-center rounded-xl shadow-2xs mb-1.5 group-hover:scale-110 transition-transform">
                          {isBadge ? <ShieldCheck className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                        </div>
                        <p className="text-[9px] font-extrabold text-[#1E3B2F] uppercase tracking-widest">
                          {isBadge ? 'Official Badge Award' : 'Certificate of Achievement'}
                        </p>
                        <h5 className="text-xs font-black text-slate-900 tracking-tight line-clamp-1 mt-0.5 max-w-[210px]">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] mt-0.5">
                          Issued by <span className="font-semibold text-slate-700">{item.issuer}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Top Right Type Tag Pill */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-wider rounded-full shadow-2xs backdrop-blur-xs ${
                        isBadge
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-[#1E3B2F]/90 text-[#F5F0E6]'
                      }`}
                    >
                      {isBadge ? 'Badge' : 'Certificate'}
                    </span>
                  </div>

                  {/* Interactive Hover Overlay with "View Credential" (Matches Project Preview style) */}
                  <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3B2F] hover:bg-[#152A22] text-white text-xs font-semibold rounded-xl shadow-lg transition-transform transform group-hover:scale-105">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Credential</span>
                    </span>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.issueDate ? formatDate(item.issueDate) : 'Date unlisted'}
                      </span>
                      {item.credentialId && (
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          ID: {item.credentialId}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#1E3B2F] transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 font-medium truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.issuer}</span>
                    </p>

                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 pt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Action Links and Delete Button */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-xs font-semibold text-[#1E3B2F] hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <Eye className="w-3 h-3" />
                      </button>

                      {item.credentialUrl && (
                        <a
                          href={
                            item.credentialUrl.startsWith('http')
                              ? item.credentialUrl
                              : `https://${item.credentialUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          title="Verify link"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item, e);
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          SUB TEMPORARILY WINDOW (DETAIL MODAL ON CLICK)
          - Closes when clicking outside window (backdrop)
          - Closes when clicking Close / X button
          - Shows high-res certificate / badge preview + full details
         ========================================================================= */}
      {selectedItem && (
        <Modal
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          maxWidth="max-w-2xl"
          footer={
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedItem.credentialUrl && (
                  <a
                    href={
                      selectedItem.credentialUrl.startsWith('http')
                        ? selectedItem.credentialUrl
                        : `https://${selectedItem.credentialUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1E3B2F] hover:bg-[#152A22] text-white rounded-xl shadow-xs transition-colors"
                  >
                    <span>Verify on Official Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedItem.certificateFileUrl && (
                  <a
                    href={selectedItem.certificateFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl transition-colors"
                  >
                    <span>Open Raw Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* 1. VISUAL PREVIEW OF CERTIFICATE / BADGE */}
            <div className="border border-gray-200 bg-gray-50 rounded-xl overflow-hidden relative">
              {selectedItem.certificateFileUrl && !isPdf(selectedItem.certificateFileUrl) ? (
                <div className="w-full max-h-[380px] bg-slate-900/5 flex items-center justify-center p-3">
                  <img
                    src={selectedItem.certificateFileUrl}
                    alt={selectedItem.title}
                    className="max-h-[340px] max-w-full object-contain shadow-xs rounded-lg border border-gray-200"
                  />
                </div>
              ) : selectedItem.certificateFileUrl && isPdf(selectedItem.certificateFileUrl) ? (
                <div className="w-full h-80 bg-gray-100 flex flex-col items-center justify-center relative">
                  <iframe
                    src={`${selectedItem.certificateFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Certificate Document Preview"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* Elegant Plaque Mockup when no custom image was uploaded */
                <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border border-gray-200 text-center relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8B48A]/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-[#7F8C6A]/15 border border-[#C8B48A]/40 text-[#1E3B2F] flex items-center justify-center rounded-xl shadow-xs">
                      {selectedItem.type === 'badge' ? (
                        <ShieldCheck className="w-8 h-8" />
                      ) : (
                        <Award className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#1E3B2F] uppercase tracking-widest">
                        {selectedItem.type === 'badge' ? 'Official Badge Award' : 'Certificate of Achievement'}
                      </p>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight mt-1">
                        {selectedItem.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Awarded to <span className="text-gray-800 font-semibold">{studentName}</span>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                      <span>Issued by: <strong>{selectedItem.issuer}</strong></span>
                      {selectedItem.issueDate && (
                        <span>• Date: <strong>{formatDate(selectedItem.issueDate)}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. CREDENTIAL ATTRIBUTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/80 p-3.5 border border-gray-200/80 rounded-xl">
              <div>
                <span className="text-gray-400 font-medium block">Credential Type</span>
                <span className="font-semibold text-gray-800 capitalize flex items-center gap-1 mt-0.5">
                  {selectedItem.type === 'badge' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E3B2F]" />
                  ) : (
                    <Award className="w-3.5 h-3.5 text-[#1E3B2F]" />
                  )}
                  {selectedItem.type === 'badge' ? 'Digital Badge' : 'Official Certificate'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 font-medium block">Issuing Organization</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {selectedItem.issuer}
                </span>
              </div>

              {selectedItem.issueDate && (
                <div>
                  <span className="text-gray-400 font-medium block">Issue Date</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(selectedItem.issueDate)}
                  </span>
                </div>
              )}

              {selectedItem.credentialId && (
                <div>
                  <span className="text-gray-400 font-medium block">Credential ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="font-mono text-xs font-bold text-gray-800 bg-white px-2 py-0.5 border border-gray-200 rounded-md">
                      {selectedItem.credentialId}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedItem.credentialId)}
                      className="p-1 text-gray-400 hover:text-[#1E3B2F] transition-colors focus:outline-none"
                      title="Copy Credential ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {copiedId && (
                      <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. OPTIONAL DESCRIPTION */}
            {selectedItem.description && (
              <div className="text-xs space-y-1">
                <span className="font-semibold text-gray-700">Description / Skills:</span>
                <p className="text-gray-600 leading-relaxed bg-white p-2.5 border border-gray-200 rounded-xl">
                  {selectedItem.description}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* =========================================================================
          ADD CERTIFICATE / BADGE MODAL
         ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Certificate or Badge"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-3.5">
          {/* Item Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Select Item Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemType('certificate')}
                className={`py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 border rounded-xl transition-all ${
                  itemType === 'certificate'
                    ? 'border-[#1E3B2F] bg-[#7F8C6A]/15 text-[#1E3B2F] font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Award className="w-4 h-4" />
                Certificate
              </button>
              <button
                type="button"
                onClick={() => setItemType('badge')}
                className={`py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 border rounded-xl transition-all ${
                  itemType === 'badge'
                    ? 'border-[#1E3B2F] bg-[#7F8C6A]/15 text-[#1E3B2F] font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Badge
              </button>
            </div>
          </div>

          <Input
            label={itemType === 'badge' ? 'Badge Name' : 'Certificate Title'}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={
              itemType === 'badge'
                ? 'e.g. AWS Certified Solutions Architect Associate'
                : 'e.g. Full-Stack Web Development Professional Certificate'
            }
            required
            className="rounded-xl text-xs"
          />

          <Input
            label="Issuing Organization / Authority"
            value={formData.issuer}
            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services, Google, Coursera, Meta, HackerRank"
            required
            className="rounded-xl text-xs"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Date"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="rounded-xl text-xs"
            />
            <Input
              label="Credential ID (Optional)"
              value={formData.credentialId}
              onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
              placeholder="e.g. AWS-12345678"
              className="rounded-xl text-xs"
            />
          </div>

          <Input
            label="Credential Verification Link (URL)"
            value={formData.credentialUrl}
            onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
            placeholder="https://credly.com/badges/... or https://coursera.org/verify/..."
            className="rounded-xl text-xs"
          />

          {/* Certificate / Badge Preview & Upload Section */}
          <div className="space-y-1.5 pt-1 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-700">
              Certificate / Badge Visual Preview
            </label>

            {/* Option A: Manual Upload */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {!selectedUploadFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-gray-300 hover:border-[#7F8C6A] rounded-xl p-3.5 text-center cursor-pointer bg-gray-50/50 hover:bg-[#7F8C6A]/15/20 transition-all"
                >
                  <UploadCloud className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">
                    <span className="font-semibold text-[#1E3B2F]">Click to upload</span> certificate image or PDF
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP, or PDF (Max 10MB)</p>
                </div>
              ) : (
                <div className="p-2.5 border border-[#C8B48A]/40 bg-[#7F8C6A]/10 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {uploadFilePreview ? (
                      <img
                        src={uploadFilePreview}
                        alt="Preview"
                        className="w-9 h-9 object-cover border border-gray-300 rounded-lg shrink-0"
                      />
                    ) : (
                      <FileCheck2 className="w-5 h-5 text-[#1E3B2F] shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {selectedUploadFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUploadFile(null);
                      setUploadFilePreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 text-gray-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Option B: Direct Preview Image URL */}
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">
                  Or enter direct Image Preview URL:
                </span>
                <Input
                  value={formData.certificateFileUrl}
                  onChange={(e) => setFormData({ ...formData, certificateFileUrl: e.target.value })}
                  placeholder="https://.../badge.png or image link"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key skills demonstrated, exam topics, or honors..."
              className="w-full text-xs p-2.5 border border-gray-200 focus:border-[#1E3B2F] focus:outline-none rounded-xl bg-white transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || isUploadingFile}
              className="rounded-xl text-xs font-semibold px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-white shadow-xs"
            >
              {isUploadingFile ? 'Uploading File...' : isLoading ? 'Saving...' : `Save ${itemType === 'badge' ? 'Badge' : 'Certificate'}`}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
