import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  GraduationCap,
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'Java',
  'TypeScript',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Tailwind CSS',
  'Flutter',
  'UI/UX',
  'Git',
];

const POPULAR_AREAS = [
  'All',
  'Software Engineering',
  'Data Science',
  'Web Development',
  'Mobile App Development',
  'Cyber Security',
  'Cloud & DevOps',
  'UI/UX Design',
  'Quality Assurance',
];

export const FilterSidebar = ({
  mode = 'internships', // 'internships' | 'candidates'
  filters,
  onChange,
  onReset,
  isStudent = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleSkillToggle = (skill) => {
    const current = filters.skills
      ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const index = current.findIndex((s) => s.toLowerCase() === skill.toLowerCase());

    let updated;
    if (index >= 0) {
      updated = current.filter((_, i) => i !== index);
    } else {
      updated = [...current, skill];
    }
    onChange('skills', updated.join(','));
  };

  const selectedSkillsList = filters.skills
    ? filters.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* INTERNSHIP-SPECIFIC FILTERS */}
      {mode === 'internships' && (
        <>
          {/* Min Match Score Slider (For Authenticated Students) */}
          {isStudent && (
            <div className="space-y-2 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Minimum Match
                </label>
                <span className="text-xs font-bold text-indigo-600">
                  {filters.minMatch ? `${filters.minMatch}%` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={filters.minMatch || 0}
                onChange={(e) => onChange('minMatch', e.target.value === '0' ? '' : e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-indigo-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-indigo-500 font-medium">
                <span>All</span>
                <span>50%+</span>
                <span>70%+</span>
                <span>90%</span>
              </div>
            </div>
          )}

          {/* Location Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Workplace Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['All', 'Remote', 'Hybrid', 'On-site'].map((type) => {
                const isSelected = (filters.locationType || 'All') === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange('locationType', type)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area / Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Domain / Discipline
            </label>
            <select
              value={filters.area || 'All'}
              onChange={(e) => onChange('area', e.target.value === 'All' ? '' : e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {POPULAR_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Maximum Duration
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Any', value: '' },
                { label: '3 Mo', value: '3' },
                { label: '6 Mo', value: '6' },
                { label: '12 Mo', value: '12' },
              ].map((opt) => {
                const isSelected = (filters.durationMonths || '') === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onChange('durationMonths', opt.value)}
                    className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stipend Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 select-none">
              <input
                type="checkbox"
                checked={filters.isPaid === 'true'}
                onChange={(e) => onChange('isPaid', e.target.checked ? 'true' : '')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="flex items-center gap-1 text-gray-800">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Paid Internships Only
              </span>
            </label>
          </div>
        </>
      )}

      {/* CANDIDATE-SPECIFIC FILTERS */}
      {mode === 'candidates' && (
        <>
          {/* Academic Year */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Academic Year
            </label>
            <select
              value={filters.academicYear || 'All'}
              onChange={(e) => onChange('academicYear', e.target.value === 'All' ? '' : e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {['All', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* University text filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              University
            </label>
            <input
              type="text"
              value={filters.university || ''}
              onChange={(e) => onChange('university', e.target.value)}
              placeholder="e.g. South Eastern, Colombo..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Degree / Program */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Degree / Program
            </label>
            <input
              type="text"
              value={filters.degree || ''}
              onChange={(e) => onChange('degree', e.target.value)}
              placeholder="e.g. BSc ICT, Computer Science..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Min GPA */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Minimum GPA
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Any', value: '' },
                { label: '3.0+', value: '3.0' },
                { label: '3.3+', value: '3.3' },
                { label: '3.5+', value: '3.5' },
              ].map((opt) => {
                const isSelected = (filters.minGpa || '') === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onChange('minGpa', opt.value)}
                    className={`px-1.5 py-1 text-xs font-medium rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* POPULAR SKILL TAGS (SHARED) */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Skills & Technologies
          </label>
          {selectedSkillsList.length > 0 && (
            <span className="text-[11px] font-semibold text-indigo-600">
              {selectedSkillsList.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = selectedSkillsList.includes(skill.toLowerCase());
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/80'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
        <Card className="sticky top-20 p-5">{content}</Card>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 animate-fade-in">
            {content}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="primary"
                className="w-full"
                onClick={onCloseMobile}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
