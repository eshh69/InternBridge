import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { X, Plus, Trash2, Edit2, Code2, CheckCircle2 } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'react',
  'node.js',
  'express',
  'mongodb',
  'javascript',
  'typescript',
  'python',
  'tailwind css',
  'git',
  'docker',
  'rest apis',
  'sql',
  'figma',
  'aws',
];

export const SkillTagsSection = ({ skills = [], onSaveSkills, isLoading }) => {
  const [currentSkills, setCurrentSkills] = useState(skills);
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Modal form states
  const [modalSkillName, setModalSkillName] = useState('');
  const [modalSkillDetails, setModalSkillDetails] = useState('');
  const [modalSkillPoints, setModalSkillPoints] = useState(['']);
  const [modalError, setModalError] = useState('');

  React.useEffect(() => {
    setCurrentSkills(skills);
  }, [skills]);

  // Helpers to handle both string and object skills seamlessly
  const getSkillName = (s) => (typeof s === 'string' ? s : s?.name || '');
  const getSkillDetails = (s) => (typeof s === 'object' ? s?.details || '' : '');
  const getSkillPoints = (s) => (Array.isArray(s?.points) ? s.points : []);
  const hasDetails = (s) => Boolean(getSkillDetails(s) || getSkillPoints(s).length > 0);

  const handleQuickAddSkill = (skillToAdd) => {
    const raw = (skillToAdd || inputValue).trim().toLowerCase();
    if (!raw) return;

    const exists = currentSkills.some((s) => getSkillName(s).toLowerCase() === raw);
    if (!exists) {
      const updated = [...currentSkills, raw];
      setCurrentSkills(updated);
      setInputValue('');
      onSaveSkills(updated);
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    const updated = currentSkills.filter((_, idx) => idx !== indexToRemove);
    setCurrentSkills(updated);
    onSaveSkills(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all skills?')) {
      setCurrentSkills([]);
      onSaveSkills([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAddSkill();
    }
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setModalSkillName('');
    setModalSkillDetails('');
    setModalSkillPoints(['']);
    setModalError('');
    setIsModalOpen(true);
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

  const handleAddModalPoint = () => {
    setModalSkillPoints((prev) => [...prev, '']);
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

  const handleSaveModal = (e) => {
    e?.preventDefault();
    setModalError('');
    const trimmedName = modalSkillName.trim().toLowerCase();
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
        (s) => getSkillName(s).toLowerCase() === trimmedName
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

  // Partition skills for clean display
  const detailedSkills = currentSkills
    .map((s, idx) => ({ skill: s, originalIndex: idx }))
    .filter(({ skill }) => hasDetails(skill));

  const tagSkills = currentSkills
    .map((s, idx) => ({ skill: s, originalIndex: idx }))
    .filter(({ skill }) => !hasDetails(skill));

  return (
    <Card className="space-y-4 rounded-2xl shadow-xs border border-gray-200/90 p-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Skills & Expertise</h3>
          {currentSkills.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {currentSkills.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentSkills.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs text-gray-400 hover:text-rose-600 font-medium transition-colors"
            >
              Clear all
            </button>
          )}

          {/* Minimal Add Icon Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
            title="Add Skill with Points / Experience"
            aria-label="Add Skill with Points"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Input Bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Quick add skill (e.g. React, Node.js)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-xs rounded-xl border border-gray-200"
          />
        </div>
        <button
          type="button"
          onClick={() => handleQuickAddSkill()}
          disabled={!inputValue.trim() || isLoading}
          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors focus:outline-none shrink-0"
          title="Add Skill"
          aria-label="Add Skill"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* SECTION 1: Skills with Details / Points (Highlight Cards) */}
      {detailedSkills.length > 0 && (
        <div className="space-y-2.5 pt-1">
          {detailedSkills.map(({ skill, originalIndex }) => {
            const name = getSkillName(skill);
            const details = getSkillDetails(skill);
            const points = getSkillPoints(skill);

            return (
              <div
                key={originalIndex}
                className="p-4 bg-gray-50/60 border border-gray-200/80 rounded-xl space-y-2 transition-all hover:border-blue-400 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 capitalize tracking-tight">
                    {name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(skill, originalIndex)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none rounded-lg"
                      title="Edit points"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(originalIndex)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors focus:outline-none rounded-lg"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {details && (
                  <p className="text-xs text-gray-600 leading-relaxed">{details}</p>
                )}

                {points.length > 0 && (
                  <ul className="space-y-1 pt-0.5">
                    {points.map((pt, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 flex items-start gap-1.5 leading-snug"
                      >
                        <span className="text-blue-600 font-bold select-none">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: Quick Skill Tags (without points) */}
      <div className="min-h-[46px] p-3 rounded-xl bg-gray-50/60 border border-gray-200/80 flex flex-wrap gap-2 items-center">
        {tagSkills.length > 0 ? (
          tagSkills.map(({ skill, originalIndex }) => {
            const name = getSkillName(skill);
            return (
              <span
                key={originalIndex}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200/90 shadow-2xs group hover:border-blue-400 transition-colors"
              >
                <span className="capitalize">{name}</span>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(skill, originalIndex)}
                  className="text-gray-300 group-hover:text-gray-500 hover:!text-blue-600 transition-colors"
                  title="Add details or points to this skill"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(originalIndex)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-rose-500 transition-colors"
                  title={`Remove ${name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        ) : detailedSkills.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No skills added yet.</p>
        ) : null}
      </div>

      {/* Quick Suggestions */}
      {SUGGESTED_SKILLS.filter(
        (s) => !currentSkills.some((cs) => getSkillName(cs).toLowerCase() === s)
      ).length > 0 && (
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Suggestions:</span>
          {SUGGESTED_SKILLS.filter(
            (s) => !currentSkills.some((cs) => getSkillName(cs).toLowerCase() === s)
          )
            .slice(0, 6)
            .map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleQuickAddSkill(skill)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200/60 hover:border-blue-200 transition-colors"
              >
                <Plus className="w-3 h-3 text-gray-400" />
                <span className="capitalize">{skill}</span>
              </button>
            ))}
        </div>
      )}

      {/* Modal: Add / Edit Skill with Details & Points */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Skill & Highlights' : 'Add Skill & Experience Points'}
        maxWidth="max-w-md"
        footer={
          <>
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
              className="rounded-xl text-xs font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Save Skill
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          {modalError && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl font-medium">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Skill Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. React, Docker, Python, Node.js"
              value={modalSkillName}
              onChange={(e) => setModalSkillName(e.target.value)}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Role / Summary <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend UI architecture & state management"
              value={modalSkillDetails}
              onChange={(e) => setModalSkillDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">
                Experience Points / What did you build?{' '}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={handleAddModalPoint}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors focus:outline-none flex items-center gap-1 text-xs font-semibold"
              >
                <Plus className="w-3 h-3" />
                Add Point
              </button>
            </div>

            <div className="space-y-2">
              {modalSkillPoints.map((point, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold select-none">•</span>
                  <input
                    type="text"
                    placeholder={`e.g. ${
                      pIdx === 0
                        ? 'Built real-time messaging using Socket.IO'
                        : 'Optimized render cycles with custom hooks'
                    }`}
                    value={point}
                    onChange={(e) => handlePointChange(pIdx, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {modalSkillPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModalPoint(pIdx)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors focus:outline-none rounded-lg"
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
