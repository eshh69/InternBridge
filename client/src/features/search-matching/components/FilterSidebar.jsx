import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  Banknote,
  Code2,
  Filter,
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'Linux',
  'Docker',
  'TypeScript',
  'Network Security',
  'Next.js',
  'MongoDB',
  'MySQL',
  'Tailwind CSS',
  'Wireshark',
  'Selenium',
  'OWASP',
  'SIEM',
  'Go',
  'Git',
  'AWS',
];

export const FilterSidebar = ({
  mode = 'internships', // 'internships' | 'candidates'
  filters,
  onChange,
  onReset,
  isStudent = false,
  isMobileOpen = false,
  onCloseMobile,
  totalCounts = {},
}) => {
  const [showAllSkills, setShowAllSkills] = useState(false);

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

  const visibleSkills = showAllSkills ? POPULAR_SKILLS : POPULAR_SKILLS.slice(0, 9);

  const content = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-700" />
          <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Clear All
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

      {/* 1. MATCH SCORE SLIDER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Match Score
          </label>
          <span className="text-xs font-bold text-blue-600">
            {filters.minMatch ? `${filters.minMatch}%` : '0%'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="10"
          value={filters.minMatch || 0}
          onChange={(e) => onChange('minMatch', e.target.value === '0' ? '' : e.target.value)}
          className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[11px] text-gray-400 font-medium px-0.5">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 2. OPPORTUNITY TYPE (WORKPLACE / EMPLOYMENT) */}
      {mode === 'internships' && (
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-gray-500" /> Opportunity Type
          </label>
          <div className="space-y-1.5">
            {[
              { label: 'All', value: 'All', count: totalCounts.all ?? 0 },
              { label: 'Internship', value: 'All', count: totalCounts.internships ?? 0 },
              { label: 'Remote', value: 'Remote', count: totalCounts.remote ?? 0 },
              { label: 'Hybrid', value: 'Hybrid', count: totalCounts.hybrid ?? 0 },
              { label: 'On-site', value: 'On-site', count: totalCounts.onsite ?? 0 },
            ].map((item, idx) => {
              const isChecked =
                item.value === 'All'
                  ? (!filters.locationType || filters.locationType === 'All') && idx === 0
                  : filters.locationType === item.value;
              return (
                <label
                  key={idx}
                  className="flex items-center justify-between text-xs text-gray-700 hover:text-gray-900 cursor-pointer select-none py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onChange('locationType', isChecked ? 'All' : item.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {item.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LOCATION DROPDOWN */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-500" /> Location
        </label>
        <div className="relative">
          <select
            value={filters.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
          >
            <option value="">All Locations</option>
            <option value="Colombo">Colombo, Sri Lanka</option>
            <option value="Malabe">Malabe, Sri Lanka</option>
            <option value="Nawala">Nawala, Sri Lanka</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Singapore">Singapore / Global</option>
            <option value="Japan">Japan (Tokyo)</option>
            <option value="Europe">Europe (Ireland, Germany, France, Sweden)</option>
            <option value="Remote">Remote</option>
          </select>
          <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* 4. STIPEND / SALARY RANGE */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-gray-500" /> Stipend / Salary Range
        </label>
        <select
          value={filters.isPaid || ''}
          onChange={(e) => onChange('isPaid', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="">All (Paid & Unpaid)</option>
          <option value="true">Paid Internships Only</option>
        </select>
      </div>

      {/* 5. DURATION PILL BUTTONS */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" /> Duration
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Any', value: '' },
            { label: '1-3 Months', value: '3' },
            { label: '3-6 Months', value: '6' },
            { label: '6+ Months', value: '12' },
          ].map((opt) => {
            const isSelected = (filters.durationMonths || '') === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange('durationMonths', opt.value)}
                className={`py-2 px-3 text-xs font-semibold rounded-full border text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. SKILLS & TECHNOLOGIES */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-gray-500" /> Skills & Technologies
          </label>
          {selectedSkillsList.length > 0 && (
            <span className="text-[11px] font-bold text-blue-600">
              {selectedSkillsList.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((skill) => {
            const isSelected = selectedSkillsList.includes(skill.toLowerCase());
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {skill}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {showAllSkills ? 'Less' : '+ More'}
          </button>
        </div>
      </div>

      {/* 7. RESET FILTERS BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" /> Reset Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Panel */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
