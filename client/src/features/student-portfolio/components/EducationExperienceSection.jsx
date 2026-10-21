import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import {
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  Building,
} from 'lucide-react';

export const EducationExperienceSection = ({
  education = [],
  experience = [],
  onSaveEducation,
  onSaveExperience,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState('education');

  // Education Modal State
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [eduFormData, setEduFormData] = useState({
    institution: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  // Experience Modal State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expFormData, setExpFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  // Education Handlers
  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!eduFormData.institution || !eduFormData.degree) return;

    const newEdu = {
      institution: eduFormData.institution.trim(),
      degree: eduFormData.degree.trim(),
      startDate: eduFormData.startDate || null,
      endDate: eduFormData.endDate || null,
      description: eduFormData.description.trim(),
    };

    onSaveEducation([...education, newEdu]);
    setIsEduModalOpen(false);
    setEduFormData({ institution: '', degree: '', startDate: '', endDate: '', description: '' });
  };

  const handleDeleteEducation = (index) => {
    const updated = education.filter((_, i) => i !== index);
    onSaveEducation(updated);
  };

  // Experience Handlers
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expFormData.title || !expFormData.company) return;

    const newExp = {
      title: expFormData.title.trim(),
      company: expFormData.company.trim(),
      location: expFormData.location.trim(),
      startDate: expFormData.startDate || null,
      endDate: expFormData.isCurrent ? null : expFormData.endDate || null,
      isCurrent: expFormData.isCurrent,
      description: expFormData.description.trim(),
    };

    onSaveExperience([...experience, newExp]);
    setIsExpModalOpen(false);
    setExpFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
  };

  const handleDeleteExperience = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    onSaveExperience(updated);
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

  return (
    <Card className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'education'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Education ({education.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'experience'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Experience ({experience.length})
          </button>
        </div>

        {activeTab === 'education' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEduModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Education
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 gap-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Experience
          </Button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'education' && (
        <div className="space-y-3">
          {education.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-3 text-center">
              No additional education records added. Click &quot;Add Education&quot; to include diplomas or degrees.
            </p>
          ) : (
            education.map((edu, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{edu.degree}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{edu.institution}</p>
                  {(edu.startDate || edu.endDate) && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                  )}
                  {edu.description && (
                    <p className="text-xs text-gray-500 mt-1.5">{edu.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEducation(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  title="Remove education"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="space-y-3">
          {experience.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-3 text-center">
              No work or volunteer experience added. Click &quot;Add Experience&quot; to showcase internships or part-time roles.
            </p>
          ) : (
            experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{exp.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                    <span className="font-medium text-indigo-600 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {exp.company}
                    </span>
                    {exp.location && <span>• {exp.location}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-500 mt-1.5">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  title="Remove experience"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Education Modal */}
      <Modal
        isOpen={isEduModalOpen}
        onClose={() => setIsEduModalOpen(false)}
        title="Add Education Entry"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEduModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddEducation} isLoading={isLoading}>
              Add Education
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddEducation} className="space-y-3">
          <Input
            label="Degree / Certificate"
            value={eduFormData.degree}
            onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
            placeholder="e.g. Higher Diploma in Computer Science"
            required
          />
          <Input
            label="Institution / University"
            value={eduFormData.institution}
            onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
            placeholder="e.g. South Eastern University"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={eduFormData.startDate}
              onChange={(e) => setEduFormData({ ...eduFormData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={eduFormData.endDate}
              onChange={(e) => setEduFormData({ ...eduFormData, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Activities</label>
            <textarea
              rows="2"
              value={eduFormData.description}
              onChange={(e) => setEduFormData({ ...eduFormData, description: e.target.value })}
              placeholder="Key achievements, honors, or relevant coursework..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </Modal>

      {/* Add Experience Modal */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Add Work Experience"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsExpModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddExperience} isLoading={isLoading}>
              Add Experience
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddExperience} className="space-y-3">
          <Input
            label="Job Title / Role"
            value={expFormData.title}
            onChange={(e) => setExpFormData({ ...expFormData, title: e.target.value })}
            placeholder="e.g. Junior Web Developer Intern"
            required
          />
          <Input
            label="Company / Organization"
            value={expFormData.company}
            onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
            placeholder="e.g. Sysco LABS"
            required
          />
          <Input
            label="Location"
            value={expFormData.location}
            onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
            placeholder="e.g. Colombo, Sri Lanka (or Remote)"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={expFormData.startDate}
              onChange={(e) => setExpFormData({ ...expFormData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={expFormData.endDate}
              disabled={expFormData.isCurrent}
              onChange={(e) => setExpFormData({ ...expFormData, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={expFormData.isCurrent}
              onChange={(e) => setExpFormData({ ...expFormData, isCurrent: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isCurrent" className="text-xs text-gray-700">
              I am currently working in this role
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities & Achievements</label>
            <textarea
              rows="2"
              value={expFormData.description}
              onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
              placeholder="What technologies did you use and what impact did you deliver?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </Modal>
    </Card>
  );
};
