import React, { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import studentPortfolioService from '../services/studentPortfolioService';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Github,
  Edit2,
  Trash2,
  RefreshCw,
  Globe,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

const extractGithubUsername = (urlOrHandle) => {
  if (!urlOrHandle) return '';
  const trimmed = String(urlOrHandle).trim();
  const clean = trimmed.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/+$/, '');
  return clean.split('/')[0] || '';
};

const normalizeUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const ProjectPreview = ({ projectUrl, title }) => {
  const norm = normalizeUrl(projectUrl);
  const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(norm)}?w=600&h=340`;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  let domain = '';
  try {
    domain = new URL(norm).hostname.replace(/^www\./, '');
  } catch {
    domain = norm;
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <a
      href={norm}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative w-full h-40 bg-slate-900 border-b border-gray-200 overflow-hidden group/preview select-none rounded-t-2xl"
      title={`Visit ${domain || title}`}
    >
      {/* Mini Browser Window Header */}
      <div className="absolute top-0 left-0 right-0 z-20 h-6 bg-slate-800/95 backdrop-blur-xs px-2.5 flex items-center justify-between border-b border-slate-700/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        {/* Address Bar Pill */}
        <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-md text-[10px] text-slate-300 max-w-[190px] truncate border border-slate-700/50">
          <img
            src={faviconUrl}
            alt=""
            className="w-2.5 h-2.5 rounded-xs shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="truncate">{domain}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="pt-6 w-full h-full relative bg-slate-950">
        {!imageFailed && (
          <img
            src={screenshotUrl}
            alt={`${title} preview`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            className={`w-full h-full object-cover object-top transition-all duration-300 group-hover/preview:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Fallback Mockup Banner (Shows if screenshot is loading or fails) */}
        {(!imageLoaded || imageFailed) && (
          <div className="absolute inset-0 top-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-center mb-1.5 shadow-sm group-hover/preview:scale-110 transition-transform">
              <img
                src={faviconUrl}
                alt=""
                className="w-4 h-4 rounded-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs font-bold text-white tracking-tight line-clamp-1">
              {title}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[220px]">
              {domain}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Hover Overlay with Launch Button */}
      <div className="absolute inset-0 top-6 z-30 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-transform transform group-hover/preview:scale-105">
          <span>Launch Demo</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      </div>
    </a>
  );
};

export const ProjectsSection = ({
  projects = [],
  githubProfileUrl = '',
  onSaveProjects,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState({});

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const fileInputRef = useRef(null);

  // GitHub Auto-import State
  const [githubUser, setGithubUser] = useState('');
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [githubError, setGithubError] = useState('');
  const [importedRepoName, setImportedRepoName] = useState('');

  const handleImageFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size must be 5MB or less.');
      return;
    }

    try {
      setIsUploadingImage(true);
      setImageUploadError('');
      const uploadedUrl = await studentPortfolioService.uploadProjectImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (err) {
      setImageUploadError(err.message || 'Failed to upload screenshot.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFetchGithubRepos = async (userToQuery) => {
    const targetUser = (userToQuery || githubUser).trim();
    if (!targetUser) {
      setGithubError('Enter a GitHub username.');
      return;
    }

    try {
      setIsFetchingRepos(true);
      setGithubError('');
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(targetUser)}/repos?sort=updated&per_page=30`
      );

      if (res.status === 404) {
        throw new Error(`GitHub user "${targetUser}" not found.`);
      }
      if (!res.ok) {
        throw new Error(`GitHub error (${res.status}).`);
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setGithubError('No public repositories found.');
        setGithubRepos([]);
        return;
      }

      setGithubRepos(data);
    } catch (err) {
      setGithubError(err.message || 'Failed to fetch repositories.');
      setGithubRepos([]);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleSelectRepo = (repoId) => {
    setSelectedRepoId(repoId);
    if (!repoId) return;

    const repo = githubRepos.find((r) => String(r.id) === String(repoId));
    if (!repo) return;

    const techs = [];
    if (repo.language) techs.push(repo.language);
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach((t) => {
        if (!techs.some((existing) => existing.toLowerCase() === t.toLowerCase())) {
          techs.push(t);
        }
      });
    }

    const formattedTitle = repo.name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    setFormData((prev) => ({
      ...prev,
      title: formattedTitle || repo.name,
      description: repo.description || '',
      technologies: techs.join(', '),
      githubUrl: repo.html_url || '',
      projectUrl: repo.homepage || '',
    }));

    setImportedRepoName(repo.name);
    setErrors({});
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      description: '',
      technologies: '',
      projectUrl: '',
      githubUrl: '',
      imageUrl: '',
    });
    setErrors({});
    setSelectedRepoId('');
    setImportedRepoName('');
    setGithubError('');
    setImageUploadError('');

    const detected = extractGithubUsername(githubProfileUrl);
    setGithubUser(detected);
    setIsModalOpen(true);

    if (detected && githubRepos.length === 0) {
      handleFetchGithubRepos(detected);
    }
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
      imageUrl: proj.imageUrl || '',
    });
    setErrors({});
    setSelectedRepoId('');
    setImportedRepoName('');
    setGithubError('');
    setImageUploadError('');
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Delete this project?')) {
      const updated = projects.filter((_, i) => i !== index);
      onSaveProjects(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

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
      imageUrl: formData.imageUrl.trim(),
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
    <Card className="space-y-4 rounded-2xl shadow-xs border border-gray-200/90 p-5 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Featured Projects</h3>
          {projects.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {projects.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="p-1.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
          title="Add Project"
          aria-label="Add Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <p className="text-xs text-gray-400">No projects added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200/90 bg-white hover:border-blue-400 transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md group/card"
            >
              {/* Cover Banner: Custom Image OR Live Preview */}
              {proj.imageUrl ? (
                <a
                  href={proj.projectUrl ? normalizeUrl(proj.projectUrl) : proj.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full h-40 bg-slate-900 border-b border-gray-200 overflow-hidden group/preview select-none"
                  title={proj.title}
                >
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/preview:scale-105"
                  />
                  {proj.projectUrl && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-lg">
                        <span>Launch Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </a>
              ) : proj.projectUrl ? (
                <ProjectPreview projectUrl={proj.projectUrl} title={proj.title} />
              ) : null}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 text-xs truncate">{proj.title}</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(idx)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {(proj.githubUrl || proj.projectUrl) && (
                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-gray-100 text-xs">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-950 font-medium"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Code
                      </a>
                    )}
                    {proj.projectUrl && (
                      <a
                        href={proj.projectUrl.startsWith('http') ? proj.projectUrl : `https://${proj.projectUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Project' : 'Add Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* GitHub Auto-import (Only in Add mode) */}
          {editingIndex === null && (
            <div className="p-3.5 bg-gray-50/80 border border-gray-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                  <Github className="w-4 h-4 text-gray-900" />
                  <span>Import from GitHub</span>
                </div>
                {importedRepoName && (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Auto-filled: {importedRepoName}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFetchGithubRepos();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleFetchGithubRepos()}
                  disabled={isFetchingRepos || !githubUser.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isFetchingRepos ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Fetch Repos</span>
                  )}
                </button>
              </div>

              {githubError && (
                <p className="text-[11px] text-rose-500 font-medium">{githubError}</p>
              )}

              {githubRepos.length > 0 && (
                <div>
                  <select
                    value={selectedRepoId}
                    onChange={(e) => handleSelectRepo(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium cursor-pointer"
                  >
                    <option value="">-- Choose a repository ({githubRepos.length} found) --</option>
                    {githubRepos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.language ? `(${r.language})` : ''} {r.stargazers_count > 0 ? `★ ${r.stargazers_count}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            placeholder="e.g. InternBridge Platform"
            className="rounded-xl text-xs"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full text-xs p-2.5 rounded-xl border focus:border-blue-500 focus:outline-none transition-colors ${
                errors.description ? 'border-rose-400' : 'border-gray-200'
              }`}
              placeholder="What does this project do and what problem did it solve?"
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
          </div>

          <Input
            label="Technologies (comma separated)"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="e.g. React, Node.js, MongoDB, Tailwind"
            className="rounded-xl text-xs"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="rounded-xl text-xs"
            />
            <div>
              <Input
                label="Live Demo URL"
                value={formData.projectUrl}
                onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                placeholder="https://..."
                className="rounded-xl text-xs"
              />
              {formData.projectUrl && !formData.imageUrl && (
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Auto-preview will appear on card</span>
                </p>
              )}
            </div>
          </div>

          {/* Cover Image / Screenshot Section */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Project Cover Image / Screenshot
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageFileSelect(e.target.files[0]);
                }
              }}
            />

            {formData.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-slate-900 group h-32">
                <img
                  src={formData.imageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover object-top rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3 text-blue-600" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-3.5 py-2 border border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/40 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isUploadingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Screenshot</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-gray-400 text-center sm:text-left">or</span>

                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {imageUploadError && (
              <p className="text-xs text-rose-500 mt-1">{imageUploadError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isLoading || isUploadingImage}
              className="rounded-xl text-xs font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              {editingIndex !== null ? 'Save Changes' : 'Add Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
