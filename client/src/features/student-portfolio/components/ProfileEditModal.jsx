import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { User, GraduationCap, Globe, Plus, Trash2 } from 'lucide-react';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

export const ProfileEditModal = ({ isOpen, onClose, profile, user, onSave, isLoading }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [sameAsPhone, setSameAsPhone] = useState(false);

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
      const userPhone = profile?.phone || '';
      const userWhatsapp = profile?.whatsapp || '';

      setFormData({
        name: user?.name || profile?.user?.name || '',
        age: profile?.age !== null && profile?.age !== undefined ? String(profile.age) : '',
        address: profile?.address || '',
        phone: userPhone,
        whatsapp: userWhatsapp,
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

      setSameAsPhone(Boolean(userPhone && userPhone === userWhatsapp));

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
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'phone' && sameAsPhone) {
        updated.whatsapp = value;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSameAsPhoneToggle = (e) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
      if (errors.whatsapp) {
        setErrors((prev) => ({ ...prev, whatsapp: null }));
      }
    }
  };

  const handleWhatsappChange = (e) => {
    const { value } = e.target;
    if (sameAsPhone && value !== formData.phone) {
      setSameAsPhone(false);
    }
    setFormData((prev) => ({ ...prev, whatsapp: value }));
    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: null }));
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
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="rounded-xl text-xs">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} className="rounded-xl text-xs font-semibold px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-white shadow-xs">
            Save All Changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'personal'
                ? 'bg-white text-[#1E3B2F] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Personal & Contact
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'academic'
                ? 'bg-white text-[#1E3B2F] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Academic Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'links'
                ? 'bg-white text-[#1E3B2F] shadow-xs border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-900'
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
                  className="rounded-xl text-xs"
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
                  className="rounded-xl text-xs"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Current Address / Location"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Colombo, Sri Lanka (or Kandy / Oluvil)"
                    className="rounded-xl text-xs"
                  />
                </div>

                <Input
                  label="Primary Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +94 77 123 4567"
                  className="rounded-xl text-xs"
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="whatsapp-input" className="block text-xs font-semibold text-gray-700">
                      WhatsApp Number
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-[#1E3B2F] font-medium cursor-pointer select-none hover:text-[#1E3B2F]">
                      <input
                        type="checkbox"
                        id="same-as-phone-checkbox"
                        checked={sameAsPhone}
                        onChange={handleSameAsPhoneToggle}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#1E3B2F] focus:ring-[#1E3B2F]/20 cursor-pointer"
                      />
                      <span>Same as phone</span>
                    </label>
                  </div>
                  <input
                    id="whatsapp-input"
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1E3B2F] transition-colors"
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>
                  )}
                </div>
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
                  className="rounded-xl text-xs"
                  required
                />

                <Input
                  label="Degree Program"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. BSc in Information and Communication Technology"
                  error={errors.degree}
                  className="rounded-xl text-xs"
                  required
                />

                <Input
                  label="Field of Study / Major"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineering / ICT"
                  error={errors.fieldOfStudy}
                  className="rounded-xl text-xs"
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1E3B2F] transition-colors cursor-pointer"
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
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Professional Bio & Career Objective
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your technical background, areas of passion, and internship aspirations..."
                  className={`w-full px-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-[#1E3B2F] transition-colors ${
                    errors.bio ? 'border-red-500' : 'border-gray-200'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GitHub Profile URL"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="rounded-xl text-xs"
                />

                <Input
                  label="LinkedIn Profile URL"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="rounded-xl text-xs"
                />

                <Input
                  label="Personal Portfolio / Website"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.dev"
                  className="rounded-xl text-xs"
                />

                <Input
                  label="Behance / Dribbble / Creative URL"
                  name="behance"
                  value={formData.behance}
                  onChange={handleChange}
                  placeholder="https://behance.net/username"
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Dynamic Multiple Custom Platforms Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-800">
                    Additional Platform URLs
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddCustomLink}
                    className="p-1.5 text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-lg transition-colors focus:outline-none"
                    title="Add Link Row"
                    aria-label="Add Link Row"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {customLinks.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
                    <p className="text-xs text-gray-400">
                      No additional platform links added. Click{' '}
                      <span className="font-semibold text-[#1E3B2F]">&quot;+ Add Link Row&quot;</span>{' '}
                      above to add custom platforms.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl border border-gray-200/80 transition-all hover:border-[#C8B48A]/40"
                      >
                        <div className="w-1/3">
                          <input
                            type="text"
                            placeholder="Platform (e.g. Kaggle)"
                            value={link.label}
                            onChange={(e) => handleCustomLinkChange(idx, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1E3B2F] bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => handleCustomLinkChange(idx, 'url', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1E3B2F] bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomLink(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
