import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { ReputationAndReviewsCard } from '../verification-rating/components/ReputationAndReviewsCard';
import studentPortfolioService from './services/studentPortfolioService';
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
  Share2,
  Check,
  ArrowLeft,
  Search,
} from 'lucide-react';

export const PublicPortfolioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await studentPortfolioService.getPublicProfile(id);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to locate this student portfolio.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const normalizeUrl = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading student portfolio...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Portfolio Not Found
        </h2>
        <p className="text-sm text-slate-500">
          The requested portfolio profile does not exist or has been made private.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate('/search')} variant="primary" size="md">
            Browse Other Candidates &amp; Internships
          </Button>
        </div>
      </div>
    );
  }

  const user = profile?.user || {};
  const studentName = user.name || profile?.name || 'Student Candidate';
  const email = user.email || profile?.email || '';
  const avatarUrl = user.avatarUrl || profile?.avatarUrl;
  const targetUserId = user._id || user.id || profile?.user?._id || id;

  const skills = profile?.skills || [];
  const projects = profile?.projects || [];
  const education = profile?.education || [];
  const experience = profile?.experience || [];
  const certificates = profile?.certificates || [];
  const badges = profile?.badges || [];
  const credentialsCount = certificates.length + badges.length;
  const gpa = profile?.gpa ? Number(profile.gpa).toFixed(2) : null;

  return (
    <div className="space-y-6 animate-slide-up pb-16 max-w-7xl mx-auto">
      {/* ── Top Bar with Share & Verification Pill ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#C8B48A]/30">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#1E3B2F] text-[#F5F0E6] flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C8B48A]" />
            Verified Undergraduate Portfolio
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            • Authenticated by InternBridge
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleShare}
            variant="secondary"
            size="sm"
            className="gap-1.5 shadow-xs border-[#C8B48A]/50 text-[#1E3B2F] hover:bg-[#F5F0E6]"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
                <span>Share Portfolio</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => navigate('/search')}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            <Search className="w-3.5 h-3.5 mr-1" /> Browse Placements
          </Button>
        </div>
      </div>

      {/* ── Executive Hero Banner ── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#1E3B2F] via-[#244537] to-[#1E3B2F] text-white p-6 sm:p-8 shadow-md overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C8B48A]/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F5F0E6] text-[#1E3B2F] font-black text-3xl flex items-center justify-center overflow-hidden shrink-0 border-2 border-[#C8B48A]/70 shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
              ) : (
                studentName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Candidate Identity */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {studentName}
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7F8C6A]/35 text-[#F5F0E6] border border-[#C8B48A]/50">
                  Candidate
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-200 font-medium flex items-center gap-2 flex-wrap">
                <GraduationCap className="w-4 h-4 text-[#C8B48A] shrink-0" />
                <span>{profile.degree || 'Information & Communication Technology'}</span>
                <span>•</span>
                <span className="text-slate-300">{profile.university || 'University'}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-1">
                {email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C8B48A]" /> {email}
                  </span>
                )}
                {profile.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C8B48A]" /> {profile.address}
                  </span>
                )}
                {gpa && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#C8B48A]/25 text-[#F5F0E6] font-bold border border-[#C8B48A]/50 text-xs">
                    <Award className="w-3.5 h-3.5 text-[#C8B48A]" /> GPA {gpa}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CV & Social Links Action Block */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
            {profile.cvUrl && (
              <a
                href={normalizeUrl(profile.cvUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8B48A] hover:bg-[#b8a377] text-[#1E3B2F] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#1E3B2F]" />
                <span>Download Resume (CV)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              {profile.links?.github && (
                <a
                  href={normalizeUrl(profile.links.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
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
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
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
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Personal Portfolio Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-5 pt-4 border-t border-white/15 text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl font-normal">
            {profile.bio}
          </p>
        )}
      </div>

      {/* ── KPI Metric Cards Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Technical Skills
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{skills.length}</p>
          <span className="text-xs text-slate-500 font-medium">Verified stack</span>
        </div>

        <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Featured Projects
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{projects.length}</p>
          <span className="text-xs text-slate-500 font-medium">Repositories &amp; demos</span>
        </div>

        <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Work Experience
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{experience.length}</p>
          <span className="text-xs text-slate-500 font-medium">Prior engagements</span>
        </div>

        <div className="bg-white border border-[#C8B48A]/40 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Credentials
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{credentialsCount}</p>
          <span className="text-xs text-slate-500 font-medium">Certificates &amp; badges</span>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="bg-white p-1.5 rounded-xl border border-[#C8B48A]/35 shadow-xs w-fit max-w-full overflow-x-auto flex space-x-1">
        {[
          { id: 'overview', label: 'Overview & Skills', icon: LayoutDashboard },
          { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
          { id: 'academics', label: 'Experience & Education', icon: Briefcase },
          { id: 'credentials', label: 'Certificates & Reviews', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C8B48A]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & SKILLS ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Technical Skills Card */}
          <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E3B2F]" />
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Technical Competencies &amp; Stack
                </h3>
              </div>
              <span className="text-xs font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-3 py-1 rounded-full border border-[#C8B48A]/40">
                {skills.length} competencies listed
              </span>
            </div>

            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
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
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F0E6]/70 text-[#1E3B2F] border border-[#C8B48A]/40 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#1E3B2F]" />
                      <span>{name}</span>
                      {details && (
                        <span className="text-[11px] text-slate-500 font-normal">
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
            <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 sm:p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Briefcase className="w-4 h-4 text-[#1E3B2F]" />
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Recent Work &amp; Engagement
                </h3>
              </div>

              <div className="space-y-3">
                {experience.slice(0, 3).map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-100 bg-[#FAF7F0]/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {exp.title || exp.role}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
                          {exp.company}
                          {exp.location && <span>• {exp.location}</span>}
                        </p>
                      </div>
                      {exp.duration && (
                        <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
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
            </Card>
          )}
        </div>
      )}

      {/* ── TAB 2: PROJECTS ── */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
              <FolderGit2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">No featured projects added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#C8B48A]/40 bg-white overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                >
                  {/* Project Cover */}
                  {proj.imageUrl ? (
                    <div className="w-full h-44 bg-slate-900 overflow-hidden relative">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-[#1E3B2F]/10 to-[#C8B48A]/20 flex items-center justify-center border-b border-gray-100">
                      <FolderGit2 className="w-10 h-10 text-[#1E3B2F]/60" />
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {proj.description || 'No project description provided.'}
                      </p>

                      {/* Technologies */}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(Array.isArray(proj.technologies)
                            ? proj.technologies
                            : String(proj.technologies).split(',')
                          ).map((t, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F0E6] text-[#1E3B2F] border border-[#C8B48A]/35"
                            >
                              {typeof t === 'string' ? t.trim() : t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Project Links */}
                    {(proj.githubUrl || proj.projectUrl) && (
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs">
                        {proj.githubUrl && (
                          <a
                            href={normalizeUrl(proj.githubUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 font-medium"
                          >
                            <Github className="w-4 h-4" />
                            <span>Code Repository</span>
                          </a>
                        )}
                        {proj.projectUrl && (
                          <a
                            href={normalizeUrl(proj.projectUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#1E3B2F] hover:text-[#152A22] font-bold ml-auto"
                          >
                            <ExternalLink className="w-4 h-4" />
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

      {/* ── TAB 3: ACADEMICS & WORK EXPERIENCE ── */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          {/* Education Section */}
          <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <GraduationCap className="w-4 h-4 text-[#1E3B2F]" />
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Education &amp; Degree Pathway
              </h3>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No academic institutions recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-100 bg-[#FAF7F0]/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{edu.degree}</h4>
                        <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
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

          {/* Work Experience Section */}
          <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Briefcase className="w-4 h-4 text-[#1E3B2F]" />
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Work &amp; Internship Experience
              </h3>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No prior internship or work history added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-100 bg-[#FAF7F0]/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {exp.title || exp.role}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
                          {exp.company}
                          {exp.location && <span>• {exp.location}</span>}
                        </p>
                      </div>
                      {exp.duration && (
                        <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
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

      {/* ── TAB 4: CREDENTIALS & FACULTY REVIEWS ── */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          {/* Certificates & Badges */}
          <Card className="rounded-2xl border border-[#C8B48A]/40 p-5 sm:p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1E3B2F]" />
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Certificates &amp; Digital Badges
                </h3>
              </div>
              <span className="text-xs font-bold text-[#1E3B2F] bg-[#7F8C6A]/15 px-3 py-1 rounded-full border border-[#C8B48A]/40">
                {credentialsCount} credentials
              </span>
            </div>

            {credentialsCount === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No verified certificates or badges uploaded.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...certificates, ...badges].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-gray-200/80 bg-white flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title || item.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.issuer || 'Accredited Issuer'}
                      </p>
                      {item.issueDate && (
                        <span className="text-[10px] text-slate-400 block mt-1">
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

          {/* Verified Faculty Evaluations */}
          {targetUserId && (
            <ReputationAndReviewsCard
              targetId={targetUserId}
              targetType="student"
              title="Verified Academic Reputation & Faculty Evaluations"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PublicPortfolioPage;
