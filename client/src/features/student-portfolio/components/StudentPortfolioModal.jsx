import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Alert } from '../../../components/ui/Alert';
import { ReputationAndReviewsCard } from '../../verification-rating/components/ReputationAndReviewsCard';
import studentPortfolioService from '../services/studentPortfolioService';
import {
  GraduationCap,
  Briefcase,
  FolderGit2,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  FileText,
  Mail,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  LayoutDashboard,
} from 'lucide-react';

export const StudentPortfolioModal = ({
  isOpen,
  onClose,
  studentId,
  initialProfile = null,
}) => {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isOpen) return;

    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    if (!studentId) return;

    let isMounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await studentPortfolioService.getPublicProfile(studentId);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load candidate portfolio.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, studentId, initialProfile]);

  if (!isOpen) return null;

  const user = profile?.user || {};
  const studentName = user.name || profile?.name || 'Student Candidate';
  const email = user.email || profile?.email || '';
  const avatarUrl = user.avatarUrl || profile?.avatarUrl;
  const targetUserId = user._id || user.id || profile?.user?._id || studentId;

  // Counts
  const skills = profile?.skills || [];
  const projects = profile?.projects || [];
  const education = profile?.education || [];
  const experience = profile?.experience || [];
  const certificates = profile?.certificates || [];
  const badges = profile?.badges || [];
  const credentialsCount = certificates.length + badges.length;
  const gpa = profile?.gpa ? Number(profile.gpa).toFixed(2) : null;

  const normalizeUrl = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Portfolio & Credentials"
      maxWidth="max-w-5xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Verified InternBridge Talent Record</span>
          </div>
          <Button variant="secondary" onClick={onClose} size="sm" className="px-5">
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Loading candidate portfolio...
          </p>
        </div>
      ) : error ? (
        <div className="py-8 space-y-4">
          <Alert type="danger">
            <span>{error}</span>
          </Alert>
          <div className="text-center">
            <Button variant="secondary" onClick={onClose} size="sm">
              Dismiss
            </Button>
          </div>
        </div>
      ) : !profile ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No portfolio information available for this candidate.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Header Banner */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#1E3B2F] via-[#244537] to-[#1E3B2F] text-white p-5 sm:p-6 shadow-md overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C8B48A]/15 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F5F0E6] text-[#1E3B2F] font-black text-2xl flex items-center justify-center overflow-hidden shrink-0 border-2 border-[#C8B48A]/60 shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
                  ) : (
                    studentName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Identity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {studentName}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7F8C6A]/40 text-[#F5F0E6] border border-[#C8B48A]/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#C8B48A]" /> Student Candidate
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-1.5 flex-wrap">
                    <GraduationCap className="w-4 h-4 text-[#C8B48A] shrink-0" />
                    <span>{profile.degree || 'Degree Candidate'}</span>
                    <span>•</span>
                    <span className="text-slate-300">{profile.university || 'University'}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap pt-0.5">
                    {email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#C8B48A]" /> {email}
                      </span>
                    )}
                    {profile.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C8B48A]" /> {profile.address}
                      </span>
                    )}
                    {gpa && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C8B48A]/25 text-[#F5F0E6] font-bold border border-[#C8B48A]/50 text-xs">
                        <Award className="w-3 h-3 text-[#C8B48A]" /> GPA {gpa}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: CV & Links */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
                {profile.cvUrl && (
                  <a
                    href={normalizeUrl(profile.cvUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C8B48A] hover:bg-[#b8a377] text-[#1E3B2F] font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#1E3B2F]" />
                    <span>View / Download CV</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}

                {/* Social links */}
                <div className="flex items-center gap-2 pt-1">
                  {profile.links?.github && (
                    <a
                      href={normalizeUrl(profile.links.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile.links?.linkedin && (
                    <a
                      href={normalizeUrl(profile.links.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.links?.portfolio && (
                    <a
                      href={normalizeUrl(profile.links.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Personal Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate Bio */}
            {profile.bio && (
              <p className="mt-4 pt-3 border-t border-white/15 text-xs text-slate-200 leading-relaxed max-w-4xl">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#C8B48A]/40 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Technical Skills
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{skills.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Verified competencies</span>
            </div>

            <div className="bg-white border border-[#C8B48A]/40 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Featured Projects
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{projects.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Repositories &amp; demos</span>
            </div>

            <div className="bg-white border border-[#C8B48A]/40 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Work Experience
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{experience.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Roles &amp; engagements</span>
            </div>

            <div className="bg-white border border-[#C8B48A]/40 rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Credentials
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{credentialsCount}</p>
              <span className="text-[11px] text-slate-500 font-medium">Certificates &amp; badges</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#FAF7F0] p-1 rounded-xl border border-[#C8B48A]/35 flex space-x-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Skills', icon: LayoutDashboard },
              { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
              { id: 'academics', label: `Experience & Education`, icon: Briefcase },
              { id: 'credentials', label: `Certificates & Reviews`, icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C8B48A]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & SKILLS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Technical Skills Card */}
              <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1E3B2F]" />
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Technical Skills &amp; Capabilities
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2.5 py-0.5 rounded-full border border-[#C8B48A]/40">
                    {skills.length} skills listed
                  </span>
                </div>

                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No skills listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((skill, idx) => {
                      const name =
                        typeof skill === 'string'
                          ? skill
                          : skill?.name || 'Competency';
                      const details =
                        typeof skill === 'object' ? skill?.details : null;

                      return (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F0E6]/70 text-[#1E3B2F] border border-[#C8B48A]/40 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3B2F]" />
                          <span>{name}</span>
                          {details && (
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({details})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Recent Experience Preview */}
              {experience.length > 0 && (
                <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Briefcase className="w-4 h-4 text-[#1E3B2F]" />
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Recent Work &amp; Engagement
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {experience.slice(0, 2).map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-100 bg-[#FAF7F0]/40 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {exp.title || exp.role}
                            </h4>
                            <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-[#1E3B2F]" />
                              {exp.company}
                              {exp.location && <span>• {exp.location}</span>}
                            </p>
                          </div>
                          {exp.duration && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                              {exp.duration}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-600 pt-1 line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                  <FolderGit2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No featured projects added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#C8B48A]/40 bg-white overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
                    >
                      {/* Project Cover */}
                      {proj.imageUrl ? (
                        <div className="w-full h-36 bg-slate-900 overflow-hidden relative">
                          <img
                            src={proj.imageUrl}
                            alt={proj.title}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-br from-[#1E3B2F]/10 to-[#C8B48A]/20 flex items-center justify-center border-b border-gray-100">
                          <FolderGit2 className="w-8 h-8 text-[#1E3B2F]/60" />
                        </div>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {proj.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {proj.description || 'No project description provided.'}
                          </p>

                          {/* Technologies */}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {(Array.isArray(proj.technologies)
                                ? proj.technologies
                                : String(proj.technologies).split(',')
                              ).map((t, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F0E6] text-[#1E3B2F] border border-[#C8B48A]/35"
                                >
                                  {typeof t === 'string' ? t.trim() : t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Project Links */}
                        {(proj.githubUrl || proj.projectUrl) && (
                          <div className="flex items-center gap-3 pt-2.5 border-t border-gray-100 text-xs">
                            {proj.githubUrl && (
                              <a
                                href={normalizeUrl(proj.githubUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-medium"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Code</span>
                              </a>
                            )}
                            {proj.projectUrl && (
                              <a
                                href={normalizeUrl(proj.projectUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#1E3B2F] hover:text-[#152A22] font-bold"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Live Demo</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACADEMICS & WORK EXPERIENCE */}
          {activeTab === 'academics' && (
            <div className="space-y-5">
              {/* Education Section */}
              <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <GraduationCap className="w-4 h-4 text-[#1E3B2F]" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Education &amp; Degree Pathway
                  </h3>
                </div>

                {education.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No academic institutions recorded.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-100 bg-[#FAF7F0]/40 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                            <p className="text-[11px] text-slate-600 font-medium">{edu.institution}</p>
                          </div>
                          {(edu.startDate || edu.endDate) && (
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} -{' '}
                              {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                            </span>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Experience Section */}
              <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Briefcase className="w-4 h-4 text-[#1E3B2F]" />
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Work &amp; Internship Experience
                  </h3>
                </div>

                {experience.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No prior internship or work history added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-100 bg-[#FAF7F0]/40 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {exp.title || exp.role}
                            </h4>
                            <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-[#1E3B2F]" />
                              {exp.company}
                              {exp.location && <span>• {exp.location}</span>}
                            </p>
                          </div>
                          {exp.duration && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                              {exp.duration}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 4: CREDENTIALS & FACULTY REVIEWS */}
          {activeTab === 'credentials' && (
            <div className="space-y-5">
              {/* Certificates & Badges Card */}
              <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#1E3B2F]" />
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Certificates &amp; Digital Badges
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-2.5 py-0.5 rounded-full border border-[#C8B48A]/40">
                    {credentialsCount} credentials
                  </span>
                </div>

                {credentialsCount === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No verified certificates or badges uploaded.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...certificates, ...badges].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-gray-200/80 bg-white flex items-start justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.title || item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.issuer || 'Accredited Issuer'}
                          </p>
                          {item.issueDate && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Issued: {new Date(item.issueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {(item.credentialUrl || item.certificateFileUrl) && (
                          <a
                            href={normalizeUrl(item.credentialUrl || item.certificateFileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[#1E3B2F] hover:bg-[#7F8C6A]/15 transition-colors shrink-0"
                            title="Verify Credential"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Verified Faculty Evaluations (Full Width) */}
              {targetUserId ? (
                <ReputationAndReviewsCard
                  targetId={targetUserId}
                  targetType="student"
                  title="Verified Academic Reputation & Faculty Evaluations"
                />
              ) : null}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default StudentPortfolioModal;
