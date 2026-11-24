import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { CandidateProfilePreviewModal } from './CandidateProfilePreviewModal';
import { verificationRatingApi } from '../verificationRatingApi';
import { useAuth } from '../../../hooks/useAuth';
import {
  Search,
  User,
  Building2,
  Star,
  CheckCircle,
  Sparkles,
  Mail,
  GraduationCap,
  Eye,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const ReviewSubmissionModal = ({
  isOpen,
  onClose,
  initialTargetType = 'student',
  initialTargetId = null,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [targetType, setTargetType] = useState(initialTargetType);
  const [targets, setTargets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Criteria ratings
  const [ratings, setRatings] = useState({
    technicalSkills: 5,
    softSkills: 5,
    professionalism: 5,
    workEnvironment: 5,
    mentorship: 5,
  });

  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch targets when modal opens or targetType/searchQuery changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTargets = async () => {
      setLoadingTargets(true);
      try {
        const results = await verificationRatingApi.getTargets(targetType, searchQuery);
        if (isMounted) {
          setTargets(results || []);
          if (initialTargetId && !selectedTarget) {
            const match = results?.find((t) => t._id === initialTargetId);
            if (match) setSelectedTarget(match);
          }
        }
      } catch (err) {
        console.error('Failed to load review targets', err);
      } finally {
        if (isMounted) setLoadingTargets(false);
      }
    };

    const debounce = setTimeout(fetchTargets, 200);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [isOpen, targetType, searchQuery, initialTargetId]);

  // Compute live overall rating normalized across the exact 3 core criteria
  const relevantCriteria = ['technicalSkills', 'softSkills', 'professionalism'];

  const computedOverall =
    Math.round(
      (relevantCriteria.reduce((acc, crit) => acc + (ratings[crit] || 5), 0) /
        relevantCriteria.length) *
        10
    ) / 10;

  const handleRatingChange = (criterion, value) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTarget) {
      setError(`Please select a ${targetType} to evaluate.`);
      return;
    }

    if (!comments.trim()) {
      setError('Please provide feedback comments.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        targetType,
        targetStudentId: targetType === 'student' ? selectedTarget._id : undefined,
        targetCompanyId: targetType === 'company' ? selectedTarget._id : undefined,
        targetStudent: targetType === 'student' ? selectedTarget : undefined,
        targetCompany: targetType === 'company' ? selectedTarget : undefined,
        targetName: selectedTarget.name,
        targetInfo:
          targetType === 'student'
            ? `${selectedTarget.profile?.university || 'South Eastern University of Sri Lanka'} • ${selectedTarget.profile?.degree || selectedTarget.profile?.fieldOfStudy || 'ICT'}`
            : (selectedTarget.industry || 'Corporate Partner'),
        ratings: relevantCriteria.reduce((acc, key) => {
          acc[key] = ratings[key];
          return acc;
        }, {}),
        overallRating: computedOverall,
        comments: comments.trim(),
        reviewer: user || {
          name: 'Dr. Nimal Senarath (Senior Lecturer)',
          email: 'reviewer@internbridge.lk',
          role: 'reviewer',
        },
      };

      const res = await verificationRatingApi.submitReview(payload);

      setSuccessMsg(res.message || 'Evaluation submitted successfully! Reputation scores updated.');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.review, res.summary);
        onClose();
        setSuccessMsg('');
        setSelectedTarget(null);
        setComments('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Multi-Criteria Academic Evaluation"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert type="danger" title="Error">
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert type="success" title="Success">
            {successMsg}
          </Alert>
        )}

        {/* Target Type Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Target Evaluation Category
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTargetType('student');
                setSelectedTarget(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                targetType === 'student'
                  ? 'bg-[#7F8C6A]/15 border-[#1E3B2F] text-[#1E3B2F] font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#1E3B2F]" />
              Evaluate Student Candidate
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetType('company');
                setSelectedTarget(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                targetType === 'company'
                  ? 'bg-[#7F8C6A]/15 border-[#1E3B2F] text-[#1E3B2F] font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#1E3B2F]" />
              Evaluate Corporate Partner
            </button>
          </div>
        </div>

        {/* Target Selection & Search */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Select {targetType === 'student' ? 'Student Candidate' : 'Corporate Company'}
            </label>
            <span className="text-[11px] text-[#7F8C6A] font-medium">
              Verify credentials & profile before selecting
            </span>
          </div>

          {selectedTarget ? (
            <div className="p-3 bg-[#7F8C6A]/15 border border-[#C8B48A]/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center font-bold text-sm shadow-xs border border-[#C8B48A] flex-shrink-0">
                    {selectedTarget.avatarUrl ? (
                      <img
                        src={selectedTarget.avatarUrl}
                        alt={selectedTarget.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      selectedTarget.name?.charAt(0) || 'T'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-gray-900 text-sm leading-none truncate">
                        {selectedTarget.name}
                      </h4>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-1 truncate">
                      <Mail className="w-3 h-3 text-[#1E3B2F] flex-shrink-0" />
                      <span className="font-semibold text-[#1E3B2F] truncate">
                        {selectedTarget.email || 'student@internbridge.lk'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPreviewTarget(selectedTarget);
                      setIsPreviewModalOpen(true);
                    }}
                    className="text-[11px] text-[#1E3B2F] hover:text-[#152A22] rounded-lg font-bold gap-1 border-[#C8B48A]/60 bg-white shadow-2xs"
                    title="View candidate's full profile & academic details"
                  >
                    <Eye className="w-3 h-3 text-[#1E3B2F]" />
                    View Full Profile
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedTarget(null)}
                    className="text-[11px] text-gray-500 hover:text-red-700 rounded-lg font-semibold"
                  >
                    Change Target
                  </Button>
                </div>
              </div>

              {/* Sub-details line */}
              <div className="pt-2 border-t border-[#C8B48A]/30 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
                <span className="flex items-center gap-1 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1E3B2F] flex-shrink-0" />
                  <span className="truncate">
                    {targetType === 'student'
                      ? `${selectedTarget.profile?.university || 'South Eastern University of Sri Lanka'} • ${selectedTarget.profile?.degree || selectedTarget.profile?.fieldOfStudy || 'ICT'}`
                      : selectedTarget.industry || 'Corporate Partner'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>
                    {selectedTarget.reputationScore ? Number(selectedTarget.reputationScore).toFixed(1) : '4.8'}
                  </span>
                  <span className="text-gray-400">/ 5.0</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${targetType === 'student' ? 'students by name, email, or degree...' : 'companies by name or industry...'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3B2F] font-medium"
                />
              </div>

              {/* Target List Dropdown */}
              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl space-y-2 p-2 bg-slate-50/60 divide-y-0">
                {loadingTargets ? (
                  <div className="p-4 text-center text-xs text-gray-500 font-medium">Loading candidate directory...</div>
                ) : targets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No matching {targetType}s found. Try searching by another name or email.
                  </div>
                ) : (
                  targets.map((target) => {
                    const isStudent = targetType === 'student';
                    const profile = target.profile || {};
                    const university = profile.university || 'South Eastern University of Sri Lanka';
                    const degree = profile.degree || profile.fieldOfStudy || (isStudent ? 'BSc Hons in ICT' : target.industry || 'Corporate');
                    const year = profile.academicYear || '3rd Year';
                    const repScore = Number(target.reputationScore || profile.reputationScore || 4.8);

                    return (
                      <div
                        key={target._id}
                        onClick={() => setSelectedTarget(target)}
                        className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-[#1E3B2F] hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        {/* Candidate Identity Block */}
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-[#1E3B2F] text-[#F5F0E6] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-2xs border border-[#C8B48A]/40">
                            {target.avatarUrl ? (
                              <img src={target.avatarUrl} alt={target.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              target.name?.charAt(0) || 'T'
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-extrabold text-gray-900 leading-tight truncate">
                                {target.name}
                              </p>
                              {isStudent && year && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                  {year}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {repScore.toFixed(1)}
                              </span>
                            </div>

                            {/* Registered Email - always prominent so same-name users are instantly distinguishable */}
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate">
                              <Mail className="w-3 h-3 text-[#1E3B2F] flex-shrink-0" />
                              <span className="font-semibold text-[#1E3B2F] truncate">{target.email}</span>
                            </div>

                            {/* University & Degree */}
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                              {isStudent ? (
                                <GraduationCap className="w-3 h-3 text-[#7F8C6A] flex-shrink-0" />
                              ) : (
                                <Building2 className="w-3 h-3 text-[#7F8C6A] flex-shrink-0" />
                              )}
                              <span className="truncate">{university} • {degree}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: View Profile & Select Button */}
                        <div
                          className="flex items-center gap-2 self-end sm:self-center flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPreviewTarget(target);
                              setIsPreviewModalOpen(true);
                            }}
                            className="text-[11px] font-semibold gap-1 rounded-lg border-gray-300 text-gray-700 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/10 shadow-2xs"
                            title="Inspect full candidate profile & credentials"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#1E3B2F]" />
                            View Profile
                          </Button>

                          <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            onClick={() => setSelectedTarget(target)}
                            className="text-[11px] font-bold rounded-lg bg-[#1E3B2F] hover:bg-[#152A22] text-[#F5F0E6] shadow-2xs gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Select
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Criteria Ratings Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Multi-Criteria Star Ratings
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Overall Rating:</span>
              <span className="text-sm font-extrabold text-[#1E3B2F]">{computedOverall}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Technical Proficiency</p>
                <p className="text-[11px] text-gray-500">
                  {targetType === 'student'
                    ? 'Code quality, problem solving, architectural design'
                    : 'Engineering standards, technology infrastructure, tech stack quality'}
                </p>
              </div>
              <StarRating
                value={ratings.technicalSkills}
                onChange={(val) => handleRatingChange('technicalSkills', val)}
                size="md"
                showScore
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Soft Skills & Teamwork</p>
                <p className="text-[11px] text-gray-500">
                  {targetType === 'student'
                    ? 'Teamwork, sprint articulation, active listening'
                    : 'Mentorship cadence, peer support, communicative atmosphere'}
                </p>
              </div>
              <StarRating
                value={ratings.softSkills}
                onChange={(val) => handleRatingChange('softSkills', val)}
                size="md"
                showScore
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Professionalism & Ethic</p>
                <p className="text-[11px] text-gray-500">
                  {targetType === 'student'
                    ? 'Punctuality, accountability, academic & work ethics'
                    : 'Compensation fairness, work agreement adherence, corporate ethics'}
                </p>
              </div>
              <StarRating
                value={ratings.professionalism}
                onChange={(val) => handleRatingChange('professionalism', val)}
                size="md"
                showScore
              />
            </div>
          </div>
        </div>

        {/* Written Review Comments */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Detailed Academic Feedback & Endorsement <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400">{comments.length}/2000</span>
          </div>
          <textarea
            rows={3}
            maxLength={2000}
            required
            placeholder={
              targetType === 'student'
                ? "Describe the student's technical strengths, project contributions, and readiness for industrial internship..."
                : "Evaluate the corporate partner's internship program structure, intern support, and organizational mentorship..."
            }
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#1E3B2F]"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={submitting} className="text-xs rounded-lg">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            disabled={!selectedTarget}
            className="text-xs rounded-lg !bg-[#1E3B2F] hover:!bg-[#152A22] !border-[#1E3B2F] text-[#F5F0E6] font-semibold shadow-xs"
          >
            Publish Verified Review
          </Button>
        </div>
      </form>

      {/* Candidate Profile Preview Dossier Modal */}
      <CandidateProfilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewTarget(null);
        }}
        target={previewTarget}
        targetType={targetType}
        onSelect={(target) => {
          setSelectedTarget(target);
          setIsPreviewModalOpen(false);
          setPreviewTarget(null);
        }}
      />
    </Modal>
  );
};

export default ReviewSubmissionModal;
