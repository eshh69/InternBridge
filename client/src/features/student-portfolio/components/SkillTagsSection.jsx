import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Code2,
  CheckCircle2,
  Sparkles,
  Zap,
  ListPlus,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'react',
  'node.js',
  'express',
  'mongodb',
  'javascript',
  'typescript',
  'python',
  'tailwind css',
  'solidity',
  'docker',
  'rest apis',
  'sql',
  'figma',
  'git',
];

// Smart presets for popular tech stacks to enable 1-click rich bullet point addition
const SKILL_CAPABILITY_PRESETS = {
  react: [
    'Component-driven UI architecture & Custom React Hooks',
    'State management with Redux Toolkit / Zustand / Context API',
    'Responsive mobile-first layout with Tailwind CSS',
    'REST & GraphQL integration with Axios and async state caching',
  ],
  'node.js': [
    'RESTful API design and modular MVC architecture',
    'Asynchronous event-driven programming & stream processing',
    'JWT authentication, bcrypt password hashing & security middleware',
    'Socket.IO real-time bi-directional messaging',
  ],
  express: [
    'Modular Express router architecture and custom controller layers',
    'Robust error-handling middleware & request body validation',
    'CORS, Helmet security headers, and API rate limiting',
  ],
  mongodb: [
    'Mongoose schema modeling, compound indexes & validation hooks',
    'Complex aggregation pipelines ($lookup, $group, $match)',
    'MongoDB Atlas cloud cluster management & optimization',
  ],
  javascript: [
    'Modern ES6+ syntax (Promises, Async/Await, Destructuring, Closures)',
    'DOM manipulation, event delegation & modular code architecture',
    'Functional programming patterns and algorithmic problem solving',
  ],
  typescript: [
    'Type-safe interfaces, generics, union types & enums',
    'Strict type contract enforcement between frontend and backend APIs',
    'Refactoring legacy JavaScript projects to robust TypeScript codebases',
  ],
  python: [
    'Data processing and analytical modeling with Pandas and NumPy',
    'Backend API microservices development with FastAPI / Flask / Django',
    'Automated scripting, web scraping and testing workflows',
  ],
  'tailwind css': [
    'Utility-first responsive design systems and custom color palettes',
    'Interactive micro-animations, transitions & dark mode layouts',
    'Component abstraction with reusable design tokens',
  ],
  solidity: [
    'Smart contract architecture & ERC standard tokens (ERC-20, ERC-721)',
    'Hardhat / Foundry contract testing & EVM gas optimization',
    'Decentralized application (dApp) Web3.js / Ethers.js integration',
  ],
  sql: [
    'Relational schema design, normalization & primary/foreign keys',
    'Complex JOIN queries, indexing, subqueries & stored procedures',
    'PostgreSQL / MySQL transaction management & data integrity',
  ],
  docker: [
    'Containerizing full-stack web applications with multi-stage Dockerfiles',
    'Docker Compose orchestration for multi-container services',
  ],
  git: [
    'Branching strategies, pull request code reviews & conflict resolution',
    'Semantic commit conventions, rebase & Git workflows',
  ],
  figma: [
    'High-fidelity UI/UX wireframing, design systems & component variants',
    'Interactive user-journey prototypes and design-to-code translation',
  ],
  'rest apis': [
    'Standard RESTful HTTP methods (GET, POST, PUT, DELETE, PATCH)',
    'Structured JSON response envelopes, pagination & HTTP status codes',
  ],
};

export const SkillTagsSection = ({ skills = [], onSaveSkills, isLoading }) => {
  const [currentSkills, setCurrentSkills] = useState(skills);
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Compact layout & expansion states
  const [expandedSkills, setExpandedSkills] = useState({});
  const [showAllSkills, setShowAllSkills] = useState(false);
  const VISIBLE_SKILLS_LIMIT = 6;

  // Modal form states
  const [modalSkillName, setModalSkillName] = useState('');
  const [modalSkillDetails, setModalSkillDetails] = useState('');
  const [modalSkillPoints, setModalSkillPoints] = useState(['']);
  const [modalError, setModalError] = useState('');

  const toggleExpandSkill = (index) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  React.useEffect(() => {
    setCurrentSkills(skills);
  }, [skills]);

  // Helpers to handle both string and object skills seamlessly
  const getSkillName = (s) => (typeof s === 'string' ? s : s?.name || '');
  const getSkillDetails = (s) => (typeof s === 'object' ? s?.details || '' : '');
  const getSkillPoints = (s) => (Array.isArray(s?.points) ? s.points : []);
  const hasDetails = (s) => Boolean(getSkillDetails(s) || getSkillPoints(s).length > 0);

  // Opens the rich modal directly with a skill name and suggested presets
  const handleOpenAddModal = (initialName = '') => {
    setEditingIndex(null);
    const cleanName = (initialName || inputValue || '').trim();
    setModalSkillName(cleanName);

    // If preset exists for this skill, pre-fill initial placeholder or role
    const presetKey = cleanName.toLowerCase();
    const presets = SKILL_CAPABILITY_PRESETS[presetKey];
    if (presets && presets.length > 0) {
      setModalSkillDetails(`Specialized in ${cleanName} development`);
      setModalSkillPoints([presets[0]]);
    } else {
      setModalSkillDetails('');
      setModalSkillPoints(['']);
    }

    setModalError('');
    setIsModalOpen(true);
    setInputValue('');
  };

  const handleOpenEditModal = (s, index) => {
    setEditingIndex(index);
    setModalSkillName(getSkillName(s));
    setModalSkillDetails(getSkillDetails(s));
    const pts = getSkillPoints(s);
    setModalSkillPoints(pts.length > 0 ? pts : ['']);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleRemoveSkill = (indexToRemove) => {
    const updated = currentSkills.filter((_, idx) => idx !== indexToRemove);
    setCurrentSkills(updated);
    onSaveSkills(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all skills and capabilities?')) {
      setCurrentSkills([]);
      onSaveSkills([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleOpenAddModal(inputValue.trim());
      }
    }
  };

  const handleAddModalPoint = (customText = '') => {
    setModalSkillPoints((prev) => [...prev, customText || '']);
  };

  const handlePointChange = (idx, val) => {
    setModalSkillPoints((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const handleRemoveModalPoint = (idx) => {
    setModalSkillPoints((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.length > 0 ? updated : [''];
    });
  };

  const handleSelectPresetPoint = (pointText) => {
    setModalSkillPoints((prev) => {
      const cleaned = prev.filter((p) => p.trim().length > 0);
      if (!cleaned.includes(pointText)) {
        return [...cleaned, pointText];
      }
      return prev;
    });
  };

  const handleSaveModal = (e) => {
    e?.preventDefault();
    setModalError('');
    const trimmedName = modalSkillName.trim();
    if (!trimmedName) {
      setModalError('Skill name is required');
      return;
    }

    const filteredPoints = modalSkillPoints
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const skillObj = {
      name: trimmedName,
      details: modalSkillDetails.trim(),
      points: filteredPoints,
    };

    let updated;
    if (editingIndex !== null) {
      updated = [...currentSkills];
      updated[editingIndex] = skillObj;
    } else {
      const existingIdx = currentSkills.findIndex(
        (s) => getSkillName(s).toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingIdx >= 0) {
        updated = [...currentSkills];
        updated[existingIdx] = skillObj;
      } else {
        updated = [...currentSkills, skillObj];
      }
    }

    setCurrentSkills(updated);
    setIsModalOpen(false);
    onSaveSkills(updated);
  };

  // Find presets matching current modal skill name
  const currentPresets =
    SKILL_CAPABILITY_PRESETS[modalSkillName.trim().toLowerCase()] || [];

  return (
    <Card className="space-y-5 rounded-2xl shadow-xs border border-[#C8B48A]/40 p-5 sm:p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7F8C6A]/15 border border-[#7F8C6A]/30 flex items-center justify-center text-[#1E3B2F]">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                Skills & Technical Capabilities
              </h3>
              {currentSkills.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E3B2F] text-[#F5F0E6] font-bold">
                  {currentSkills.length}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Detailed technical competencies with verified capability points
            </p>
          </div>
        </div>

        {currentSkills.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs text-gray-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Interactive Quick Add Bar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Quick add skill (e.g. React, Node.js)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-xs rounded-xl border border-gray-200/90 focus:border-[#1E3B2F] pr-10"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => handleOpenAddModal(inputValue)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 hover:bg-[#7F8C6A]/25 px-2 py-0.5 rounded-md transition-colors"
              >
                Add Details &rarr;
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => handleOpenAddModal(inputValue)}
            disabled={isLoading}
            className="rounded-xl px-4 text-xs font-bold bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] shrink-0 cursor-pointer flex items-center justify-center"
            title="Add Skill"
          >
            Add
          </Button>
        </div>

        {/* Quick Clickable Suggestions */}
        {SUGGESTED_SKILLS.filter(
          (s) => !currentSkills.some((cs) => getSkillName(cs).toLowerCase() === s)
        ).length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#C8B48A]" />
              Popular Capabilities:
            </span>
            {SUGGESTED_SKILLS.filter(
              (s) => !currentSkills.some((cs) => getSkillName(cs).toLowerCase() === s)
            )
              .slice(0, 8)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleOpenAddModal(skill)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-[#F5F0E6]/60 hover:bg-[#F5F0E6] text-[#1E3B2F] hover:text-[#12261E] border border-[#C8B48A]/40 font-semibold transition-all hover:scale-102 cursor-pointer shadow-2xs"
                  title={`Add ${skill} with capability points`}
                >
                  <Plus className="w-3 h-3 text-[#7F8C6A]" />
                  <span className="capitalize">{skill}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* SKILLS LIST: Responsive 2-Column Grid with Accordion Capability Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 items-start">
        {currentSkills.length === 0 ? (
          <div className="col-span-full text-center py-8 px-4 border-2 border-dashed border-[#C8B48A]/40 rounded-2xl bg-[#F5F0E6]/20 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#7F8C6A]/15 text-[#1E3B2F] flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-800">No technical skills added yet</h4>
            <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
              Add your technical competencies with bullet points of what you can build to showcase your practical skills to recruiters.
            </p>
          </div>
        ) : (
          (currentSkills.length > VISIBLE_SKILLS_LIMIT && !showAllSkills
            ? currentSkills.slice(0, VISIBLE_SKILLS_LIMIT)
            : currentSkills
          ).map((skill, index) => {
            const name = getSkillName(skill);
            const details = getSkillDetails(skill);
            const points = getSkillPoints(skill);
            const hasAnyPoints = points.length > 0;
            const isExpanded = Boolean(expandedSkills[index]);
            const visiblePoints = isExpanded ? points : points.slice(0, 2);
            const hiddenCount = points.length - 2;

            return (
              <div
                key={index}
                className="p-4 sm:p-5 bg-white border border-[#C8B48A]/60 rounded-2xl shadow-xs hover:border-[#1E3B2F] hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Skill Name + Role + Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-[15px] font-black text-[#1E3B2F] capitalize tracking-tight">
                          {name}
                        </h4>
                        {hasAnyPoints && (
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-[#7F8C6A]/20 text-[#1E3B2F] border border-[#7F8C6A]/40 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#C8B48A]" />
                            {points.length} {points.length === 1 ? 'Capability' : 'Capabilities'}
                          </span>
                        )}
                      </div>
                      {details ? (
                        <p className="text-xs text-gray-800 font-bold mt-1 leading-snug">
                          {details}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(skill, index)}
                        className="p-1.5 text-gray-500 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/20 transition-colors rounded-lg cursor-pointer"
                        title="Edit capability points"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg cursor-pointer"
                        title="Remove skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* High-Contrast Pointwise Capabilities List */}
                  {hasAnyPoints ? (
                    <div className="mt-3 pt-2.5 border-t border-[#C8B48A]/35 space-y-2">
                      <ul className="space-y-2">
                        {visiblePoints.map((pt, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-900 font-semibold flex items-start gap-2.5 leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#1E3B2F] mt-0.5 shrink-0" />
                            <span className="flex-1">{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandSkill(index)}
                          className="pt-1.5 text-xs font-black text-[#1E3B2F] hover:text-[#7F8C6A] flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                        >
                          <span>
                            {isExpanded
                              ? 'Show fewer capabilities'
                              : `+${hiddenCount} more ${hiddenCount === 1 ? 'capability' : 'capabilities'}`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 pt-2.5 border-t border-[#C8B48A]/35 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">No capability points added yet</span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(skill, index)}
                        className="font-extrabold text-[#1E3B2F] hover:text-[#7F8C6A] hover:underline transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#7F8C6A]" />
                        Add capabilities
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Global Show More Skills Toggle (if skills exceed VISIBLE_SKILLS_LIMIT) */}
        {currentSkills.length > VISIBLE_SKILLS_LIMIT && (
          <div className="col-span-full text-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F5F0E6] hover:bg-[#EAE2D2] text-[#1E3B2F] border border-[#C8B48A]/50 transition-all cursor-pointer shadow-2xs"
            >
              <span>
                {showAllSkills
                  ? `Show Top ${VISIBLE_SKILLS_LIMIT} Skills`
                  : `View All ${currentSkills.length} Technical Skills`}
              </span>
              {showAllSkills ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Skill with Details & Pointwise Capabilities */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingIndex !== null
            ? `Edit Capabilities: ${modalSkillName || 'Skill'}`
            : `Add Skill & Technical Capabilities`
        }
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveModal}
              isLoading={isLoading}
              className="rounded-xl text-xs font-bold px-4 bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] shadow-xs cursor-pointer"
            >
              Save Capabilities
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          {modalError && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl font-medium">
              {modalError}
            </div>
          )}

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Skill Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. React, Node.js, Python, Solidity, Docker"
              value={modalSkillName}
              onChange={(e) => setModalSkillName(e.target.value)}
              className="text-xs rounded-xl"
              required
            />
          </div>

          {/* Role / Summary */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Specialization / Role <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend UI Designer & Web Architecture"
              value={modalSkillDetails}
              onChange={(e) => setModalSkillDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1E3B2F] font-medium"
            />
          </div>

          {/* Clickable Preset Suggestions if available */}
          {currentPresets.length > 0 && (
            <div className="p-3 rounded-xl bg-[#F5F0E6]/60 border border-[#C8B48A]/40 space-y-2">
              <span className="text-[11px] font-bold text-[#1E3B2F] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#C8B48A]" />
                Recommended Capabilities for {modalSkillName} (Click to add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPresets.map((preset, idx) => {
                  const alreadyAdded = modalSkillPoints.includes(preset);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetPoint(preset)}
                      disabled={alreadyAdded}
                      className={`text-left text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        alreadyAdded
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-60 cursor-not-allowed'
                          : 'bg-white hover:bg-[#1E3B2F] text-gray-800 hover:text-white border-gray-200 hover:border-[#1E3B2F] cursor-pointer shadow-2xs'
                      }`}
                    >
                      {alreadyAdded ? '✓ ' : '+ '}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pointwise Capabilities */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  What can you do / What have you built?
                </label>
                <p className="text-[11px] text-gray-400">
                  Pointwise capabilities, key achievements, or specific workflows
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddModalPoint('')}
                className="px-2 py-1 text-[#1E3B2F] bg-[#7F8C6A]/15 hover:bg-[#7F8C6A]/25 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Point
              </button>
            </div>

            <div className="space-y-2">
              {modalSkillPoints.map((point, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <span className="text-xs text-[#1E3B2F] font-black select-none">•</span>
                  <input
                    type="text"
                    placeholder={`e.g. ${
                      pIdx === 0
                        ? 'Developed responsive web applications using React & Tailwind'
                        : pIdx === 1
                        ? 'Implemented user authentication & state management'
                        : 'Integrated third-party APIs and performance optimizations'
                    }`}
                    value={point}
                    onChange={(e) => handlePointChange(pIdx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1E3B2F] font-medium"
                  />
                  {modalSkillPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModalPoint(pIdx)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg cursor-pointer"
                      title="Remove point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default SkillTagsSection;
