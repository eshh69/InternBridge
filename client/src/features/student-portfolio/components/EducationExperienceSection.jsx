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
    if (window.confirm('Delete this education entry?')) {
      const updated = education.filter((_, i) => i !== index);
      onSaveEducation(updated);
    }
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

  return (
    <Card className="space-y-3.5 rounded-xl shadow-xs border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'education'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Education ({education.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'experience'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Experience ({experience.length})
          </button>
        </div>

        {activeTab === 'education' ? (
          <button
            type="button"
            onClick={() => setIsEduModalOpen(true)}
            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
            title="Add Education"
            aria-label="Add Education"
          >
            <Plus className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsExpModalOpen(true)}
            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
            title="Add Experience"
            aria-label="Add Experience"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'education' && (
        <div className="space-y-2.5">
          {education.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No education added yet.
            </p>
          ) : (
            education.map((edu, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{edu.institution}</p>
                  {(edu.startDate || edu.endDate) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                  )}
                  {edu.description && (
                    <p className="text-xs text-slate-600 mt-1">{edu.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEducation(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="space-y-2.5">
          {experience.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No experience added yet.
            </p>
          ) : (
            experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                  <p className="text-xs text-indigo-600 font-medium">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </p>
                  {(exp.startDate || exp.endDate || exp.isCurrent) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                  )}
                  {exp.description && (
                    <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete"
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
        title="Add Education"
      >
        <form onSubmit={handleAddEducation} className="space-y-3">
          <Input
            label="Degree / Qualification"
            value={eduFormData.degree}
            onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
            placeholder="e.g. BSc in Computer Science"
            required
            className="rounded-xl"
          />
          <Input
            label="Institution"
            value={eduFormData.institution}
            onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
            placeholder="e.g. University of Colombo"
            required
            className="rounded-xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={eduFormData.startDate}
              onChange={(e) => setEduFormData({ ...eduFormData, startDate: e.target.value })}
              className="rounded-xl"
            />
            <Input
              label="End Date"
              type="date"
              value={eduFormData.endDate}
              onChange={(e) => setEduFormData({ ...eduFormData, endDate: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={eduFormData.description}
              onChange={(e) => setEduFormData({ ...eduFormData, description: e.target.value })}
              className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Dean's List, Major coursework"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsEduModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="rounded-xl">
              Save Education
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Experience Modal */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Add Experience"
      >
        <form onSubmit={handleAddExperience} className="space-y-3">
          <Input
            label="Role / Title"
            value={expFormData.title}
            onChange={(e) => setExpFormData({ ...expFormData, title: e.target.value })}
            placeholder="e.g. Frontend Intern"
            required
            className="rounded-xl"
          />
          <Input
            label="Company / Organization"
            value={expFormData.company}
            onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
            placeholder="e.g. WSO2"
            required
            className="rounded-xl"
          />
          <Input
            label="Location (Optional)"
            value={expFormData.location}
            onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
            placeholder="e.g. Colombo, Sri Lanka / Remote"
            className="rounded-xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={expFormData.startDate}
              onChange={(e) => setExpFormData({ ...expFormData, startDate: e.target.value })}
              className="rounded-xl"
            />
            <Input
              label="End Date"
              type="date"
              value={expFormData.endDate}
              disabled={expFormData.isCurrent}
              onChange={(e) => setExpFormData({ ...expFormData, endDate: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={expFormData.isCurrent}
              onChange={(e) => setExpFormData({ ...expFormData, isCurrent: e.target.checked })}
              className="rounded-xl text-indigo-600"
            />
            Currently working here
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsExpModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="rounded-xl">
              Save Experience
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
