import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Plus, X, Sparkles, Calendar, DollarSign, MapPin, Briefcase } from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'MongoDB',
  'SQL',
  'PostgreSQL',
  'Docker',
  'Git',
  'AWS',
  'Tailwind CSS',
  'Figma',
  'REST APIs',
];

const PREDEFINED_AREAS = [
  'Software Engineering',
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Mobile App Development',
  'Data Science & Analytics',
  'DevOps & Cloud Engineering',
  'Quality Assurance & Testing',
  'Cyber Security',
  'UI/UX Design',
  'Business Analysis',
  'Artificial Intelligence / ML',
];

export const InternshipFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData?._id);

  const [formData, setFormData] = useState({
    title: '',
    area: 'Software Engineering',
    locationType: 'On-site',
    location: '',
    durationMonths: 6,
    openPositions: 1,
    stipendPaid: true,
    stipendAmount: 40000,
    stipendCurrency: 'LKR',
    deadline: '',
    description: '',
    qualificationsText: '',
    status: 'published',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  // Reset or initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialData) {
        // Formatting deadline for date input (YYYY-MM-DD)
        let deadlineString = '';
        if (initialData.deadline) {
          const d = new Date(initialData.deadline);
          if (!isNaN(d.getTime())) {
            deadlineString = d.toISOString().split('T')[0];
          }
        }

        setFormData({
          title: initialData.title || '',
          area: initialData.area || 'Software Engineering',
          locationType: initialData.locationType || 'On-site',
          location: initialData.location || '',
          durationMonths: initialData.durationMonths || 6,
          openPositions: initialData.openPositions || 1,
          stipendPaid: Boolean(initialData.stipend?.isPaid),
          stipendAmount: initialData.stipend?.amount ?? 0,
          stipendCurrency: initialData.stipend?.currency || 'LKR',
          deadline: deadlineString,
          description: initialData.description || '',
          qualificationsText: Array.isArray(initialData.qualifications)
            ? initialData.qualifications.join('\n')
            : '',
          status: initialData.status || 'published',
        });
        setSkills(Array.isArray(initialData.requiredSkills) ? initialData.requiredSkills : []);
      } else {
        // Default new posting (default deadline 30 days from now)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        const defaultDeadline = defaultDate.toISOString().split('T')[0];

        setFormData({
          title: '',
          area: 'Software Engineering',
          locationType: 'On-site',
          location: 'Colombo, Sri Lanka',
          durationMonths: 6,
          openPositions: 1,
          stipendPaid: true,
          stipendAmount: 40000,
          stipendCurrency: 'LKR',
          deadline: defaultDeadline,
          description: '',
          qualificationsText: 'Undergraduate in ICT, Computer Science, or related field\nGood understanding of modern software principles',
          status: 'published',
        });
        setSkills(['React', 'Node.js', 'MongoDB']);
      }
      setSkillInput('');
    }
  }, [isOpen, initialData]);

  const handleAddSkill = (skillToAdd) => {
    const raw = typeof skillToAdd === 'string' ? skillToAdd : skillInput;
    if (!raw || !raw.trim()) return;
    const splitSkills = raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (splitSkills.length === 0) return;
    setSkills((prev) => {
      const existing = new Set(prev.map((s) => s.toLowerCase()));
      const toAdd = splitSkills.filter((s) => !existing.has(s));
      return [...prev, ...toAdd];
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (statusToSave) => {
    if (isLoading) return;
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide an internship title.');
      return;
    }
    if (!formData.area.trim()) {
      setError('Please provide an area or discipline.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please provide a job location.');
      return;
    }
    if (skills.length === 0) {
      setError('Please specify at least one required skill for matching candidates.');
      return;
    }
    if (!formData.deadline) {
      setError('Please set an application deadline.');
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      setError('Invalid deadline date format.');
      return;
    }

    // When creating or updating to a new deadline, verify future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      setError('Application deadline must be a future date.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a job description.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      area: formData.area.trim(),
      locationType: formData.locationType,
      location: formData.location.trim(),
      durationMonths: Math.max(1, Number(formData.durationMonths) || 6),
      openPositions: Math.max(1, Number(formData.openPositions) || 1),
      stipend: {
        isPaid: formData.stipendPaid,
        amount: formData.stipendPaid ? Math.max(0, Number(formData.stipendAmount) || 0) : 0,
        currency: formData.stipendCurrency || 'LKR',
      },
      deadline: deadlineDate.toISOString(),
      requiredSkills: skills,
      qualifications: formData.qualificationsText
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
      description: formData.description.trim(),
      status: statusToSave || formData.status,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Internship Listing' : 'Post New Internship Opportunity'}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          <div className="flex gap-2">
            {!isEditing && (
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={() => handleSubmit('draft')}
              >
                Save as Draft
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              isLoading={isLoading}
              onClick={() => handleSubmit(isEditing ? formData.status : 'published')}
            >
              {isEditing ? 'Save Changes' : 'Publish Internship'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {error && <Alert type="danger">{error}</Alert>}

        {/* Basic Info */}
        <div className="space-y-4">
          <Input
            label="Internship Title"
            required
            placeholder="e.g. Full-Stack Web Development Intern"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Area / Discipline <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-2xs"
              >
                {PREDEFINED_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Work Arrangement <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['On-site', 'Hybrid', 'Remote'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, locationType: type })}
                    className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      formData.locationType === type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="City / Office Location"
                required
                placeholder="e.g. Colombo 03, Sri Lanka"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Open Positions"
                type="number"
                min="1"
                required
                value={formData.openPositions}
                onChange={(e) => setFormData({ ...formData, openPositions: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Required Skills Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Required Technical Skills <span className="text-rose-500">*</span>
            <span className="text-xs text-slate-500 font-normal ml-1.5">
              (Used by matching engine to score student profiles)
            </span>
          </label>

          <div className="flex gap-2">
            <Input
              placeholder="Type skill & press Enter (e.g. React, Python, Docker)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDownSkill}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleAddSkill()}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {/* Active Skills Pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 rounded-xl border border-slate-200">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400 italic py-0.5">No skills added yet.</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Add Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Suggestions:
            </span>
            {COMMON_SKILLS.filter(
              (s) => !skills.map((k) => k.toLowerCase()).includes(s.toLowerCase())
            )
              .slice(0, 8)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddSkill(suggestion)}
                  className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors shadow-2xs"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>

        {/* Duration, Deadline, Stipend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Duration (Months)"
              type="number"
              min="1"
              required
              value={formData.durationMonths}
              onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Application Deadline"
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </div>

        {/* Stipend Details */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-900">Internship Compensation</span>
              <p className="text-xs text-slate-500">Provide monthly allowance or stipend details</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.stipendPaid}
                onChange={(e) => setFormData({ ...formData, stipendPaid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-2.5 text-xs font-semibold text-slate-800">
                {formData.stipendPaid ? 'Paid' : 'Unpaid'}
              </span>
            </label>
          </div>

          {formData.stipendPaid && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Input
                label="Monthly Amount"
                type="number"
                min="0"
                step="500"
                placeholder="40000"
                value={formData.stipendAmount}
                onChange={(e) => setFormData({ ...formData, stipendAmount: e.target.value })}
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={formData.stipendCurrency}
                  onChange={(e) => setFormData({ ...formData, stipendCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800 shadow-2xs"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Description & Qualifications */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Job Description & Responsibilities <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="4"
              required
              placeholder="Outline the day-to-day work, projects, mentoring, and technologies the intern will use..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Candidate Qualifications & Requirements
              <span className="text-xs text-slate-500 font-normal ml-1.5">(One requirement per line)</span>
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Currently pursuing BSc in Software Engineering&#10;Familiarity with Agile practices&#10;Problem solving attitude"
              value={formData.qualificationsText}
              onChange={(e) => setFormData({ ...formData, qualificationsText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-colors"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
