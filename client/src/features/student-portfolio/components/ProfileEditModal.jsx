import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

export const ProfileEditModal = ({ isOpen, onClose, profile, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    university: '',
    degree: '',
    fieldOfStudy: '',
    academicYear: '3rd Year',
    gpa: '',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        university: profile.university || '',
        degree: profile.degree || '',
        fieldOfStudy: profile.fieldOfStudy || '',
        academicYear: profile.academicYear || '3rd Year',
        gpa: profile.gpa !== null && profile.gpa !== undefined ? String(profile.gpa) : '',
        bio: profile.bio || '',
        github: profile.links?.github || '',
        linkedin: profile.links?.linkedin || '',
        portfolio: profile.links?.portfolio || '',
      });
      setErrors({});
    }
  }, [profile, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = 'Field of study is required';

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

    onSave({
      university: formData.university,
      degree: formData.degree,
      fieldOfStudy: formData.fieldOfStudy,
      academicYear: formData.academicYear,
      gpa: formData.gpa === '' ? null : parseFloat(formData.gpa),
      bio: formData.bio,
      links: {
        github: formData.github,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student Profile"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="University / Higher Education"
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
            placeholder="e.g. BSc in Information & Communication Technology"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
            Professional Bio
          </label>
          <textarea
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Briefly describe your career objectives, technical passions, and internship goals..."
            className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
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

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Online Presence & Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="GitHub URL"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
            <Input
              label="LinkedIn URL"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
            <Input
              label="Portfolio / Website"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://yourportfolio.dev"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
