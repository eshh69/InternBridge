import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { verificationRatingApi } from '../verificationRatingApi';
import { useAuth } from '../../../hooks/useAuth';
import { Search, User, Building2, Star, CheckCircle, Sparkles } from 'lucide-react';

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
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold !rounded-none border transition-all ${
                targetType === 'student'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              Evaluate Student Candidate
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetType('company');
                setSelectedTarget(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold !rounded-none border transition-all ${
                targetType === 'company'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Evaluate Corporate Partner
            </button>
          </div>
        </div>

        {/* Target Selection & Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Select {targetType === 'student' ? 'Student Candidate' : 'Corporate Company'}
          </label>

          {selectedTarget ? (
            <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 !rounded-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 !rounded-none bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedTarget.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-none">{selectedTarget.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {targetType === 'student'
                      ? selectedTarget.profile?.degree || selectedTarget.email
                      : selectedTarget.industry || 'Registered Corporate Recruiter'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTarget(null)}
                className="text-xs text-blue-600 hover:text-blue-800 !rounded-none font-semibold"
              >
                Change Target
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${targetType === 'student' ? 'students by name or email...' : 'companies by name or industry...'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 !rounded-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Target List Dropdown */}
              <div className="max-h-40 overflow-y-auto border border-gray-200 !rounded-none divide-y divide-gray-100 bg-white">
                {loadingTargets ? (
                  <div className="p-3 text-center text-xs text-gray-500">Loading directory...</div>
                ) : targets.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-500">
                    No matching {targetType}s found. Try another search term.
                  </div>
                ) : (
                  targets.map((target) => (
                    <button
                      key={target._id}
                      type="button"
                      onClick={() => setSelectedTarget(target)}
                      className="w-full text-left p-2.5 hover:bg-blue-50/50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 !rounded-none bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {target.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">{target.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {targetType === 'student'
                              ? target.profile?.fieldOfStudy || target.email
                              : target.industry || 'Company'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 uppercase tracking-wider">
                        Select
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Criteria Ratings Section */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 !rounded-none space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Multi-Criteria Star Ratings
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Overall Rating:</span>
              <span className="text-sm font-extrabold text-blue-700">{computedOverall}</span>
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
            className="w-full px-3 py-2 text-xs border border-gray-300 !rounded-none shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={submitting} className="text-xs !rounded-none">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            disabled={!selectedTarget}
            className="text-xs !rounded-none !bg-blue-600 hover:!bg-blue-700 !border-blue-600 text-white font-semibold shadow-xs"
          >
            Publish Verified Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewSubmissionModal;
