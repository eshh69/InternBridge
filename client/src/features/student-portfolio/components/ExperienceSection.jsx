import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { studentPortfolioService } from '../services/studentPortfolioService';
import {
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  Globe,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Sparkles,
  X,
  Search,
} from 'lucide-react';

const EMPLOYMENT_TYPES = [
  'Internship',
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Self Placed',
  'Apprenticeship',
];

const POPULAR_TECH_SUGGESTIONS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'Solidity',
  'Rust',
  'Smart Contracts',
  'Docker',
  'AWS',
  'MongoDB',
  'SQL',
  'Tailwind CSS',
  'Git',
];

// Helper to extract clean domain from website URL
const extractDomain = (url) => {
  if (!url) return '';
  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
};

// Generate high quality logo URL
const resolveLogoUrl = (exp) => {
  if (exp?.companyLogo) return exp.companyLogo;
  const site = exp?.companyWebsite || (exp?.company?.includes('.') ? exp.company : '');
  if (site) {
    const domain = extractDomain(site);
    if (domain && domain.includes('.')) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
  }
  return null;
};

export const ExperienceSection = ({
  experience = [],
  onSaveExperience,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyId: null,
    companyLogo: '',
    companyWebsite: '',
    employmentType: 'Internship',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    skills: [],
  });

  const [skillInput, setSkillInput] = useState('');

  // Autocomplete / Search platform companies
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for registered companies
  useEffect(() => {
    if (!companySearchQuery || companySearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingCompany(true);
        const companies = await studentPortfolioService.searchCompanies(companySearchQuery.trim());
        setSearchResults(companies);
        setShowCompanyDropdown(true);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearchingCompany(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [companySearchQuery]);

  // Handle selecting a company from autocomplete
  const handleSelectCompany = (comp) => {
    setFormData((prev) => {
      let resolvedLoc = prev.location;
      if (comp.location) {
        resolvedLoc = [comp.location.city, comp.location.country].filter(Boolean).join(', ');
      }
      return {
        ...prev,
        company: comp.name,
        companyId: comp._id,
        companyLogo: comp.logoUrl || prev.companyLogo,
        companyWebsite: comp.website || prev.companyWebsite,
        location: resolvedLoc || prev.location,
      };
    });
    setCompanySearchQuery(comp.name);
    setShowCompanyDropdown(false);
  };

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      company: '',
      companyId: null,
      companyLogo: '',
      companyWebsite: '',
      employmentType: 'Internship',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      skills: [],
    });
    setCompanySearchQuery('');
    setSkillInput('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (index) => {
    const item = experience[index];
    if (!item) return;

    setEditingIndex(index);
    setFormData({
      title: item.title || '',
      company: item.company || '',
      companyId: item.companyId || null,
      companyLogo: item.companyLogo || '',
      companyWebsite: item.companyWebsite || '',
      employmentType: item.employmentType || 'Internship',
      location: item.location || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      isCurrent: Boolean(item.isCurrent),
      description: item.description || '',
      skills: Array.isArray(item.skills) ? [...item.skills] : [],
    });
    setCompanySearchQuery(item.company || '');
    setSkillInput('');
    setIsModalOpen(true);
  };

  // Add / Remove skill tags
  const handleAddSkillTag = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (!formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkillTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== tagToRemove),
    }));
  };

  // Auto-detect and sync logo preview when website link is changed
  const handleWebsiteChange = (url) => {
    setFormData((prev) => {
      const updated = { ...prev, companyWebsite: url };
      if (!prev.companyId) {
        const domain = extractDomain(url);
        if (domain && domain.includes('.')) {
          updated.companyLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        }
      }
      return updated;
    });
  };

  // Form submit
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim()) return;

    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      companyId: formData.companyId || null,
      companyLogo: formData.companyLogo?.trim() || resolveLogoUrl(formData) || '',
      companyWebsite: formData.companyWebsite?.trim() || '',
      employmentType: formData.employmentType || 'Internship',
      location: formData.location.trim(),
      startDate: formData.startDate || null,
      endDate: formData.isCurrent ? null : formData.endDate || null,
      isCurrent: Boolean(formData.isCurrent),
      description: formData.description.trim(),
      skills: formData.skills || [],
    };

    let updated;
    if (editingIndex !== null) {
      updated = [...experience];
      updated[editingIndex] = payload;
    } else {
      updated = [...experience, payload];
    }

    onSaveExperience(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (index) => {
    if (window.confirm('Delete this experience entry?')) {
      const updated = experience.filter((_, i) => i !== index);
      onSaveExperience(updated);
    }
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

  // Calculate duration between dates
  const calculateDuration = (start, end, isCurrent) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = isCurrent || !end ? new Date() : new Date(end);
    const diffMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) + 1;

    if (diffMonths <= 0) return '';
    if (diffMonths < 12) {
      return `· ${diffMonths} ${diffMonths === 1 ? 'mo' : 'mos'}`;
    }
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return `· ${years} ${years === 1 ? 'yr' : 'yrs'}${
      remMonths > 0 ? ` ${remMonths} mos` : ''
    }`;
  };

  // Logo Preview for modal
  const previewLogoUrl = resolveLogoUrl(formData);

  return (
    <Card className="space-y-4 rounded-2xl shadow-xs border border-[#C8B48A]/40 p-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7F8C6A]/15 border border-[#7F8C6A]/30 flex items-center justify-center text-[#1E3B2F]">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                Work & Internship Experience
              </h3>
              {experience.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E3B2F] text-[#F5F0E6] font-bold">
                  {experience.length}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Industry engagements, corporate internships & verified roles
            </p>
          </div>
        </div>

        {/* Minimal Add Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="p-1.5 text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-xl transition-colors focus:outline-none cursor-pointer"
          title="Add Experience"
          aria-label="Add Experience"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Experience Cards Grid */}
      <div>
        {experience.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-2xl p-6 bg-[#FAF7F0]/40">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">No work or internship experience added yet</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Showcase your practical industry background with logos, responsibilities, and verified companies.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Experience</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experience.map((exp, idx) => {
              const logoUrl = resolveLogoUrl(exp);
              const companyInitial = exp.company?.charAt(0).toUpperCase() || 'C';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-gray-200/80 bg-white hover:border-[#1E3B2F]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 group relative"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo Container: 1:1 Square matching subcard height */}
                    <div className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 aspect-square rounded-2xl border border-[#C8B48A]/45 bg-[#FAF7F0] shadow-xs flex-shrink-0 flex items-center justify-center p-2.5 overflow-hidden self-start">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={exp.company}
                          className="w-full h-full aspect-square object-contain rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full aspect-square bg-[#1E3B2F] text-[#C8B48A] rounded-xl flex items-center justify-center font-black text-2xl select-none"
                        style={{ display: logoUrl ? 'none' : 'flex' }}
                      >
                        {companyInitial}
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-gray-900 tracking-tight leading-snug">
                          {exp.title}
                        </h4>

                        {/* Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(idx)}
                            className="p-1 text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-lg transition-colors cursor-pointer"
                            title="Edit Experience"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Company Name & Verification Badge */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="font-bold text-[#1E3B2F]">
                          {exp.company}
                        </span>

                        {exp.companyId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Partner
                          </span>
                        )}

                        {exp.companyWebsite && (
                          <a
                            href={
                              exp.companyWebsite.startsWith('http')
                                ? exp.companyWebsite
                                : `https://${exp.companyWebsite}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#1E3B2F] transition-colors"
                            title="Visit company website"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Meta: Employment Type, Dates & Location */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-gray-500 pt-0.5 font-medium">
                        {exp.employmentType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#7F8C6A]/15 text-[#1E3B2F] font-semibold text-[10px] border border-[#7F8C6A]/30">
                            {exp.employmentType}
                          </span>
                        )}

                        {(exp.startDate || exp.endDate || exp.isCurrent) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>
                              {formatDate(exp.startDate) || 'Start'} –{' '}
                              {exp.isCurrent ? 'Present' : formatDate(exp.endDate) || 'End'}
                            </span>
                            <span className="text-gray-400 font-normal">
                              {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                            </span>
                          </span>
                        )}

                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{exp.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Description (Right beneath the meta text) */}
                      {exp.description && (
                        <p className="text-xs text-gray-600 leading-relaxed font-normal pt-1 border-t border-gray-100">
                          {exp.description}
                        </p>
                      )}

                      {/* Skills / Tech Stack Chips (In this very same text column div) */}
                      {Array.isArray(exp.skills) && exp.skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {exp.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-0.5 rounded-lg bg-[#FAF7F0] border border-[#C8B48A]/45 text-[#1E3B2F] font-bold text-[10px]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Experience Modal (Spacious, Modern LinkedIn Style) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Experience' : 'Add Experience'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-3">
          {/* Row 1: Role / Title */}
          <Input
            label="Role / Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Blockchain Developer, Software Engineer Intern"
            required
            className="rounded-xl border-[#C8B48A]/50 text-sm py-2.5"
          />

          {/* Row 2: Company Name (with Autocomplete) & Company Website (with Logo Preview) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company / Organization Input */}
            <div className="space-y-1 relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-[#1E3B2F]">
                Company / Organization <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      company: val,
                      companyId: null,
                    }));
                    setCompanySearchQuery(val);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowCompanyDropdown(true);
                  }}
                  placeholder="Search partner or enter company..."
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#C8B48A]/50 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] bg-white pr-9 shadow-2xs"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {isSearchingCompany ? (
                    <span className="text-[10px] text-gray-400 animate-pulse font-medium">Searching...</span>
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Autocomplete Dropdown */}
              {showCompanyDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#C8B48A]/40 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-gray-100">
                  <div className="px-3 py-1.5 bg-[#FAF7F0] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    InternBridge Verified Partners
                  </div>
                  {searchResults.map((comp) => (
                    <button
                      key={comp._id}
                      type="button"
                      onClick={() => handleSelectCompany(comp)}
                      className="w-full text-left p-2.5 hover:bg-[#FAF7F0]/80 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {comp.logoUrl ? (
                            <img src={comp.logoUrl} alt={comp.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{comp.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{comp.industry || 'Company'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        Verified
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {formData.companyId && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Linked with verified InternBridge partner</span>
                </div>
              )}
            </div>

            {/* Company Website + Integrated Logo Preview */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1E3B2F]">
                Company Website
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.companyWebsite}
                    onChange={(e) => handleWebsiteChange(e.target.value)}
                    placeholder="e.g. near.org or https://google.com"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 pl-8 rounded-xl border border-[#C8B48A]/50 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] bg-white shadow-2xs"
                  />
                  <Globe className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                {/* Logo Preview thumbnail */}
                <div
                  className="w-10 h-10 rounded-xl border border-[#C8B48A]/40 bg-[#FAF7F0] shadow-2xs flex items-center justify-center p-1 overflow-hidden shrink-0"
                  title="Company Logo Preview"
                >
                  {previewLogoUrl ? (
                    <img
                      src={previewLogoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-[#1E3B2F] text-[#C8B48A] rounded-lg flex items-center justify-center font-bold text-xs select-none"
                    style={{ display: previewLogoUrl ? 'none' : 'flex' }}
                  >
                    {formData.company ? formData.company.charAt(0).toUpperCase() : '?'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Employment Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1E3B2F]">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#C8B48A]/50 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] bg-white font-medium shadow-2xs"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Colombo, Sri Lanka / Remote"
              className="rounded-xl border-[#C8B48A]/50 text-sm py-2.5"
            />
          </div>

          {/* Row 4: Dates & Currently Working Checkbox */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="rounded-xl border-[#C8B48A]/50 text-sm py-2"
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                disabled={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="rounded-xl border-[#C8B48A]/50 text-sm py-2"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none font-medium pt-0.5">
              <input
                type="checkbox"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                className="rounded text-[#1E3B2F] focus:ring-[#1E3B2F]"
              />
              <span>I currently work in this role</span>
            </label>
          </div>

          {/* Row 5: Technologies & Skills Used */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1E3B2F]">
              Skills & Technologies Used
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkillTag();
                  }
                }}
                placeholder="e.g. Rust, Smart Contracts, React (Press Enter or Add)"
                className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#C8B48A]/50 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] bg-white shadow-2xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSkillTag()}
                className="rounded-xl text-xs px-3.5 font-semibold"
              >
                Add
              </Button>
            </div>

            {/* Selected Tag Pills */}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {formData.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#C8B48A]/50 text-[#1E3B2F] font-bold text-xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillTag(skill)}
                      className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick suggestions */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-[#C8B48A]" />
                Suggestions:
              </span>
              {POPULAR_TECH_SUGGESTIONS.filter(
                (s) => !formData.skills.some((fs) => fs.toLowerCase() === s.toLowerCase())
              )
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkillTag(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-600 hover:bg-[#FAF7F0] hover:text-[#1E3B2F] transition-colors cursor-pointer"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          {/* Row 6: Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1E3B2F]">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline your key responsibilities, projects delivered, and accomplishments..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#C8B48A]/50 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] bg-white leading-relaxed shadow-2xs"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isLoading}
              className="rounded-xl text-xs px-5 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] font-bold shadow-xs cursor-pointer"
            >
              {isLoading ? 'Saving...' : editingIndex !== null ? 'Save Changes' : 'Add Experience'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default ExperienceSection;
