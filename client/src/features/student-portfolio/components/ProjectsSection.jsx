import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Github,
  Edit2,
  Trash2,
  Code2,
} from 'lucide-react';

export const ProjectsSection = ({ projects = [], onSaveProjects, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
  });
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      description: '',
      technologies: '',
      projectUrl: '',
      githubUrl: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    const proj = projects[index];
    setEditingIndex(index);
    setFormData({
      title: proj.title || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
      projectUrl: proj.projectUrl || '',
      githubUrl: proj.githubUrl || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter((_, i) => i !== index);
      onSaveProjects(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Project description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const projectItem = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      technologies: techArray,
      projectUrl: formData.projectUrl.trim(),
      githubUrl: formData.githubUrl.trim(),
    };

    let updatedProjects;
    if (editingIndex !== null) {
      updatedProjects = [...projects];
      updatedProjects[editingIndex] = projectItem;
    } else {
      updatedProjects = [...projects, projectItem];
    }

    onSaveProjects(updatedProjects);
    setIsModalOpen(false);
  };

  return (
    <Card className="space-y-4 !rounded-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Featured Projects</h3>
          <span className="text-xs px-2 py-0.5 !rounded-none bg-indigo-50 text-indigo-700 font-medium">
            {projects.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenAdd}
          className="gap-1.5 text-indigo-600 hover:text-indigo-800 !rounded-none"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 px-4 !rounded-none border border-dashed border-gray-200 bg-gray-50/50">
          <Code2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-gray-700">No projects showcase yet</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Adding academic or personal projects significantly increases your visibility to hiring companies.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="mt-3 gap-1.5 !rounded-none">
            <Plus className="w-3.5 h-3.5" />
            Add First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="p-4 !rounded-none border border-gray-200/90 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{proj.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(idx)}
                      className="p-1 text-gray-400 hover:text-indigo-600 !rounded-none transition-colors"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 !rounded-none transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {proj.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 !rounded-none text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Code Repository
                  </a>
                )}
                {proj.projectUrl && (
                  <a
                    href={proj.projectUrl.startsWith('http') ? proj.projectUrl : `https://${proj.projectUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Project' : 'Add New Project'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isLoading} className="!rounded-none">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} className="!rounded-none">
              {editingIndex !== null ? 'Update Project' : 'Add Project'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. InternBridge Platform"
            error={errors.title}
            required
            className="!rounded-none"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the problem solved, architecture, and your contributions..."
              className={`w-full px-3 py-2 border !rounded-none shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          <Input
            label="Technologies Used (Comma-separated)"
            name="technologies"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="e.g. React, Node.js, Socket.IO, MongoDB"
            helperText="Separate tools and libraries with commas"
            className="!rounded-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Live Project URL"
              name="projectUrl"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              placeholder="https://myproject.com"
              className="!rounded-none"
            />
            <Input
              label="GitHub Repository URL"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/user/repo"
              className="!rounded-none"
            />
          </div>
        </form>
      </Modal>
    </Card>
  );
};
