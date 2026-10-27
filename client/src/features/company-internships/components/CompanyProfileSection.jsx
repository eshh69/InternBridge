import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Star,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

const PREDEFINED_INDUSTRIES = [
  'Software & IT Services',
  'Telecommunications',
  'Financial Services & Fintech',
  'E-Commerce & Retail Tech',
  'Healthcare & Biotechnology',
  'Digital Media & Entertainment',
  'Consulting & Professional Services',
  'Education & EdTech',
  'Cybersecurity & Cloud',
  'Artificial Intelligence & Robotics',
  'Other',
];

export const CompanyProfileSection = ({
  company,
  onSaveProfile,
  isLoading = false,
  isInitialSetup = false,
}) => {
  const [isEditing, setIsEditing] = useState(isInitialSetup || !company);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: 'Software & IT Services',
    address: 'Headquarters',
    city: 'Colombo',
    country: 'Sri Lanka',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logoUrl: '',
  });

  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        industry: company.industry || 'Software & IT Services',
        address: company.location?.address || '',
        city: company.location?.city || 'Colombo',
        country: company.location?.country || 'Sri Lanka',
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
        website: company.website || '',
        logoUrl: company.logoUrl || '',
      });
      if (!isInitialSetup) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  }, [company, isInitialSetup]);

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Employer
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-full text-xs font-semibold">
            Verification Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-medium">
            Unverified Account
          </span>
        );
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaveSuccess(false);

    if (!formData.name.trim()) {
      setFormError('Please enter your company or organization name.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please enter a brief company description.');
      return;
    }
    if (!formData.industry.trim()) {
      setFormError('Please select or specify your industry area.');
      return;
    }
    if (!formData.contactEmail.trim()) {
      setFormError('Please provide a contact email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      industry: formData.industry.trim(),
      location: {
        address: formData.address.trim() || 'Headquarters',
        city: formData.city.trim() || 'Colombo',
        country: formData.country.trim() || 'Sri Lanka',
      },
      contactEmail: formData.contactEmail.trim().toLowerCase(),
      contactPhone: formData.contactPhone.trim(),
      website: formData.website.trim(),
      logoUrl: formData.logoUrl.trim() || null,
    };

    try {
      await onSaveProfile(payload);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to update company profile.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      {saveSuccess && (
        <Alert type="success" title="Profile Saved">
          Your company profile details have been successfully updated.
        </Alert>
      )}

      {/* Profile Setup Notice for uninitialized company */}
      {!company && (
        <Alert type="warning" title="Company Profile Required">
          Please complete your company profile details below to activate your recruiter account and start posting internships.
        </Alert>
      )}

      <Card className="p-6 sm:p-8">
        {!isEditing && company ? (
          /* =========================================
             VIEW MODE
             ========================================= */
          <div className="space-y-8">
            {/* Top Brand Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center font-extrabold text-3xl shadow-sm select-none">
                    {company.name ? company.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {company.name}
                    </h2>
                    {getVerificationBadge(company.verificationStatus)}
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {company.industry}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {company.location?.city || 'Colombo'}, {company.location?.country || 'Sri Lanka'}
                    </span>
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                variant="primary"
                size="sm"
                className="gap-2 shrink-0 shadow-xs"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Button>
            </div>

            {/* Reputation & Trust Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100/90 flex items-center gap-3.5">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                    Reputation Score
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {company.reputationScore ? company.reputationScore.toFixed(1) : '0.0'} / 5.0
                  </span>
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-100/90 flex items-center gap-3.5">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                    Verified Reviews
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {company.reviewCount || 0} Endorsements
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100/90 flex items-center gap-3.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                    Account Status
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 capitalize">
                    {company.verificationStatus || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* About / Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                About the Company
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {company.description || 'No description provided yet.'}
              </p>
            </div>

            {/* Contact Details Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contact & Headquarters Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-white">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-600" /> Recruitment Contact Email
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{company.contactEmail}</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-white">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-indigo-600" /> Telephone / Hot-line
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {company.contactPhone || 'Not provided'}
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-white">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" /> Official Website
                  </span>
                  {company.website ? (
                    <a
                      href={
                        company.website.startsWith('http')
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                    >
                      {company.website} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 font-medium">Not provided</p>
                  )}
                </div>

                <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-white">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" /> Office Address
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {company.location?.address || 'Headquarters'}, {company.location?.city || 'Colombo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================
             EDIT / CREATE FORM MODE
             ========================================= */
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {company ? 'Edit Company Profile' : 'Set Up Your Company Profile'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide accurate information to build trust with student applicants and university reviewers.
              </p>
            </div>

            {formError && <Alert type="danger">{formError}</Alert>}

            <div className="space-y-4">
              <Input
                label="Company / Organization Name"
                required
                placeholder="e.g. Virtusa Corporation, Dialog Axiata, Sysco LABS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industry Sector <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {PREDEFINED_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Official Website"
                  placeholder="https://company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Overview & Mission <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your organization, engineering culture, technologies used, and what interns will learn..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact / Recruitment Email"
                  type="email"
                  required
                  placeholder="careers@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />

                <Input
                  label="Contact Phone"
                  placeholder="+94 11 234 5678"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>

              {/* Location Fields */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-sm font-bold text-slate-900 block">
                  Headquarters & Office Location
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Street Address / Building"
                      placeholder="e.g. 752 Dr C.W.W. Kannangara Mawatha"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="City"
                      required
                      placeholder="e.g. Colombo"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Company Logo URL (Optional)"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                helperText="Provide a public URL to your company logo image"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {company && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="primary" isLoading={isLoading} className="gap-2">
                <CheckCircle2 className="w-4 h-4" /> Save Company Profile
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
