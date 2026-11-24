import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { GraduationCap, Plus, Trash2, Calendar } from 'lucide-react';

export const EducationSection = ({
  education = [],
  onSaveEducation,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.institution || !formData.degree) return;

    const newEdu = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      description: formData.description.trim(),
    };

    onSaveEducation([...education, newEdu]);
    setIsModalOpen(false);
    setFormData({ institution: '', degree: '', startDate: '', endDate: '', description: '' });
  };

  const handleDelete = (index) => {
    if (window.confirm('Delete this education entry?')) {
      const updated = education.filter((_, i) => i !== index);
      onSaveEducation(updated);
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
    <Card className="space-y-4 rounded-2xl shadow-2xs border border-[#C8B48A]/40 p-5 sm:p-6 bg-white">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-[#1E3B2F]" />
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Education & Degree Pathway</h3>
          {education.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7F8C6A]/15 text-[#1E3B2F] font-semibold border border-[#C8B48A]/40">
              {education.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-xl transition-colors focus:outline-none"
          title="Add Education"
          aria-label="Add Education"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        {education.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">
            No education entries added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 sm:gap-4">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/60 flex items-start justify-between gap-3 hover:border-[#7F8C6A] hover:shadow-xs transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{edu.degree}</h4>
                  <p className="text-xs text-[#1E3B2F] font-medium truncate">{edu.institution}</p>
                  {(edu.startDate || edu.endDate) && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                  )}
                  {edu.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{edu.description}</p>
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

      {/* Add Education Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Education"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <Input
            label="Degree / Qualification"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            placeholder="e.g. BSc in Information and Communication Technology"
            required
            className="rounded-xl border border-gray-200"
          />
          <Input
            label="Institution"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            placeholder="e.g. South Eastern University of Sri Lanka"
            required
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
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Achievements (Optional)</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1E3B2F]/20 bg-white"
              placeholder="e.g. Relevant coursework, GPA achievements, Dean's list"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="rounded-xl text-xs bg-[#1E3B2F] hover:bg-[#152A22] text-white font-semibold shadow-xs"
            >
              Save Education
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
