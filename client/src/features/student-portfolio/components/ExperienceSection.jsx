import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Briefcase, Plus, Trash2, Calendar, MapPin } from 'lucide-react';

export const ExperienceSection = ({
  experience = [],
  onSaveExperience,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return;

    const newExp = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      startDate: formData.startDate || null,
      endDate: formData.isCurrent ? null : (formData.endDate || null),
      isCurrent: Boolean(formData.isCurrent),
      description: formData.description.trim(),
    };

    onSaveExperience([...experience, newExp]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
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

  return (
    <Card className="space-y-4 rounded-2xl shadow-xs border border-gray-200/90 p-5 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">Work & Internship Experience</h3>
          {experience.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/80">
              {experience.length}
            </span>
          )}
        </div>

        {/* Minimal Icon Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors focus:outline-none"
          title="Add Experience"
          aria-label="Add Experience"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        {experience.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">
            No work or internship experience added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/60 flex items-start justify-between gap-3 hover:border-blue-400 hover:shadow-xs transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{exp.title}</h4>
                  <p className="text-xs text-blue-600 font-medium truncate">
                    {exp.company}
                    {exp.location && (
                      <span className="text-gray-400 font-normal"> • {exp.location}</span>
                    )}
                  </p>
                  {(exp.startDate || exp.endDate || exp.isCurrent) && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                  )}
                  {exp.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Experience Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Experience"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <Input
            label="Role / Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Software Engineer Intern"
            required
            className="rounded-xl border border-gray-200"
          />
          <Input
            label="Company / Organization"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g. Sysco LABS / MillenniumIT"
            required
            className="rounded-xl border border-gray-200"
          />
          <Input
            label="Location (Optional)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Colombo, Sri Lanka / Remote"
            className="rounded-xl border border-gray-200"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="rounded-xl border border-gray-200"
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              disabled={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="rounded-xl border border-gray-200"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Currently working here</span>
          </label>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Highlight key responsibilities, technologies used, and achievements..."
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isLoading}
              className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {isLoading ? 'Saving...' : 'Save Experience'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
