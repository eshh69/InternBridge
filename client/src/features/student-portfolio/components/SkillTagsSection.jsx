import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, Plus, Sparkles, Check } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'react',
  'node.js',
  'express',
  'mongodb',
  'javascript',
  'typescript',
  'python',
  'tailwind css',
  'html5',
  'css3',
  'git',
  'docker',
  'rest apis',
  'sql',
  'c++',
  'java',
  'figma',
  'aws',
];

export const SkillTagsSection = ({ skills = [], onSaveSkills, isLoading }) => {
  const [currentSkills, setCurrentSkills] = useState(skills);
  const [inputValue, setInputValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync when prop updates
  React.useEffect(() => {
    setCurrentSkills(skills);
    setHasChanges(false);
  }, [skills]);

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || inputValue).trim().toLowerCase();
    if (!trimmed) return;

    if (!currentSkills.includes(trimmed)) {
      const updated = [...currentSkills, trimmed];
      setCurrentSkills(updated);
      setHasChanges(true);
      setInputValue('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = currentSkills.filter((s) => s !== skillToRemove);
    setCurrentSkills(updated);
    setHasChanges(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = () => {
    onSaveSkills(currentSkills);
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">Skills & Competencies</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              {currentSkills.length} Added
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Key skills are directly matched with company internship criteria.
          </p>
        </div>

        {hasChanges && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isLoading}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            Save Skills
          </Button>
        )}
      </div>

      {/* Input to add skill */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Type a skill (e.g. react, docker, python) and press Enter"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleAddSkill()}
          disabled={!inputValue.trim()}
          className="gap-1 px-4"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Current Skill Badges */}
      <div className="min-h-[50px] p-3 rounded-lg bg-gray-50/70 border border-gray-100 flex flex-wrap gap-2 items-center">
        {currentSkills.length > 0 ? (
          currentSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-700 border border-indigo-200/80 shadow-xs group transition-all"
            >
              <span className="capitalize">{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
                title={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic">
            No skills added yet. Add your core technical & soft skills to boost match rates.
          </p>
        )}
      </div>

      {/* Suggested Skills */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Suggestions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_SKILLS.filter((s) => !currentSkills.includes(s)).slice(0, 10).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleAddSkill(skill)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-gray-100/80 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-400" />
              <span className="capitalize">{skill}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
