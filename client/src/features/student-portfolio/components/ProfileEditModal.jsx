import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { User, Phone, GraduationCap, Globe, Plus, Trash2 } from 'lucide-react';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

export const ProfileEditModal = ({ isOpen, onClose, profile, user, onSave, isLoading }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    phone: '',
    whatsapp: '',
    university: '',
    degree: '',
    fieldOfStudy: '',
    academicYear: '3rd Year',
    gpa: '',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
    behance: '',
    other: '',
  });

  const [customLinks, setCustomLinks] = useState([{ label: '', url: '' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile || user) {
      setFormData({
        name: user?.name || profile?.user?.name || '',
        age: profile?.age !== null && profile?.age !== undefined ? String(profile.age) : '',
        address: profile?.address || '',
        phone: profile?.phone || '',
        whatsapp: profile?.whatsapp || '',
        university: profile?.university || '',
        degree: profile?.degree || '',
        fieldOfStudy: profile?.fieldOfStudy || '',
        academicYear: profile?.academicYear || '3rd Year',
        gpa: profile?.gpa !== null && profile?.gpa !== undefined ? String(profile.gpa) : '',
        bio: profile?.bio || '',
        github: profile?.links?.github || '',
        linkedin: profile?.links?.linkedin || '',
        portfolio: profile?.links?.portfolio || '',
        behance: profile?.links?.behance || '',
        other: profile?.links?.other || '',
      });

      let existingCustom = [];
      if (Array.isArray(profile?.links?.customLinks) && profile.links.customLinks.length > 0) {
        existingCustom = profile.links.customLinks;
      } else if (profile?.links?.other) {
        existingCustom = [{ label: 'Other', url: profile.links.other }];
      } else {
        existingCustom = [{ label: '', url: '' }];
      }
      setCustomLinks(existingCustom);

      setErrors({});
      setActiveTab('personal');
    }
  }, [profile, user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddCustomLink = () => {
    setCustomLinks((prev) => [...prev, { label: '', url: '' }]);
  };

  const handleRemoveCustomLink = (index) => {
    setCustomLinks((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [{ label: '', url: '' }];
    });
  };

  const handleCustomLinkChange = (index, field, value) => {
    setCustomLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = 'Field of study is required';

    if (formData.age !== '') {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        newErrors.age = 'Please enter a valid age (16–100)';
      }
    }

    if (formData.gpa !== '') {
      const gpaNum = parseFloat(formData.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
        newErrors.gpa = 'GPA must be between 0.00 and 4.00';
      }
    }

    if (formData.bio.length > 1000) {
      newErrors.bio = 'Bio cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const filteredCustomLinks = customLinks
      .filter((item) => item && (item.url?.trim() || item.label?.trim()))
      .map((item) => ({
        label: item.label?.trim() || 'Link',
        url: item.url?.trim() || '',
      }));

    onSave({
      name: formData.name.trim(),
      age: formData.age === '' ? null : parseInt(formData.age, 10),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      university: formData.university.trim(),
      degree: formData.degree.trim(),
      fieldOfStudy: formData.fieldOfStudy.trim(),
      academicYear: formData.academicYear,
      gpa: formData.gpa === '' ? null : parseFloat(formData.gpa),
      bio: formData.bio.trim(),
      links: {
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        portfolio: formData.portfolio.trim(),
        behance: formData.behance.trim(),
        other: formData.other.trim(),
        customLinks: filteredCustomLinks,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student Profile"
      maxWidth="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Save All Changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Personal & Contact
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Academic Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Social & Creative Platforms
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* TAB 1: Personal & Contact Details */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. S.A.I.C. Kumara"
                  error={errors.name}
                  required
                />

                <Input
                  label="Age"
                  name="age"
                  type="number"
                  min="16"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 23"
                  error={errors.age}
                  helperText="Optional"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Current Address / Location"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Colombo, Sri Lanka (or Kandy / Oluvil)"
                    helperText="Visible to recruiters for location compatibility"
                  />
                </div>

                <Input
                  label="Primary Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +94 77 123 4567"
                  helperText="Direct contact number"
                />

                <Input
                  label="WhatsApp Number"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g. +94 77 123 4567"
                  helperText="For quick recruiter communications"
                />
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-800">
                💡 <strong>Tip:</strong> Your contact email is linked to your account ({user?.email || profile?.user?.email}).
              </div>
            </div>
          )}

          {/* TAB 2: Academic Details */}
          {activeTab === 'academic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="University / Institution"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. South Eastern University of Sri Lanka"
                  error={errors.university}
                  required
                />

                <Input
                  label="Degree Program"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. BSc in Information and Communication Technology"
                  error={errors.degree}
                  required
                />

                <Input
                  label="Field of Study / Major"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineering / ICT"
                  error={errors.fieldOfStudy}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-2xs text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {ACADEMIC_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Cumulative GPA (out of 4.0)"
                  name="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="e.g. 3.75"
                  error={errors.gpa}
                  helperText="Optional, leave blank if not applicable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Bio & Career Objective
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your technical background, areas of passion, and internship aspirations..."
                  className={`w-full px-3 py-2 border rounded-lg shadow-2xs text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio ? (
                    <p className="text-xs text-red-600">{errors.bio}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-gray-400">
                    {formData.bio.length} / 1000 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Social & Creative Platforms */}
          {activeTab === 'links' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-gray-500">
                Showcase your code repositories, design portfolios, and online creative profiles to recruiters.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GitHub Profile URL"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />

                <Input
                  label="LinkedIn Profile URL"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />

                <Input
                  label="Personal Portfolio / Website"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.dev"
                />

                <Input
                  label="Behance / Dribbble / Creative URL"
                  name="behance"
                  value={formData.behance}
                  onChange={handleChange}
                  placeholder="https://behance.net/username"
                  helperText="UI/UX, 3D, Design, or Media portfolio"
                />
              </div>

              {/* Dynamic Multiple Custom Platforms Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-800">
                      Additional Creative & Social Platform URLs
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Add links for Medium, YouTube, Kaggle, ArtStation, Twitter / X, etc.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomLink}
                    className="p-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 !rounded-none"
                    title="Add Link Row"
                    aria-label="Add Link Row"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {customLinks.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
                    <p className="text-xs text-gray-400">
                      No additional platform links added. Click{' '}
                      <span className="font-semibold text-indigo-600">&quot;+ Add Link Row&quot;</span>{' '}
                      above to add custom platforms.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-lg border border-gray-200/80 transition-all hover:border-indigo-200"
                      >
                        <div className="w-1/3">
                          <input
                            type="text"
                            placeholder="Platform (e.g. Kaggle)"
                            value={link.label}
                            onChange={(e) => handleCustomLinkChange(idx, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => handleCustomLinkChange(idx, 'url', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomLink(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove this link row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
