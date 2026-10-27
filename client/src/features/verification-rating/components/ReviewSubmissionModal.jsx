import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { apiClient } from '../../../services/apiClient';
import { Search, User, Building2, Star, CheckCircle, Sparkles } from 'lucide-react';

export const ReviewSubmissionModal = ({
  isOpen,
  onClose,
  initialTargetType = 'student',
  initialTargetId = null,
  onSuccess,
}) => {
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

  // Fetch targets when targetType or searchQuery changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTargets = async () => {
      setLoadingTargets(true);
      try {
        const res = await apiClient.get(
          `/reviews/targets?type=${targetType}&q=${encodeURIComponent(searchQuery)}`
        );
        if (isMounted) {
          setTargets(res.data?.targets || []);
          if (initialTargetId && !selectedTarget) {
            const match = res.data?.targets?.find((t) => t._id === initialTargetId);
            if (match) setSelectedTarget(match);
          }
        }
      } catch (err) {
        console.error('Failed to load targets', err);
      } finally {
        if (isMounted) setLoadingTargets(false);
      }
    };

    const debounce = setTimeout(fetchTargets, 300);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [isOpen, targetType, searchQuery]);

  // Compute live overall rating
  const relevantCriteria =
    targetType === 'student'
      ? ['technicalSkills', 'softSkills', 'professionalism']
      : ['workEnvironment', 'mentorship', 'professionalism'];

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
      };

      await apiClient.post('/reviews', payload);

      setSuccessMsg('Evaluation submitted successfully! Reputation scores updated.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
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
      title="Submit Verified Academic Evaluation"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Evaluation Target Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setTargetType('student');
                setSelectedTarget(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                targetType === 'student'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              Evaluate Student
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetType('company');
                setSelectedTarget(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                targetType === 'company'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Evaluate Company
            </button>
          </div>
        </div>

        {/* Target Selection & Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select {targetType === 'student' ? 'Student' : 'Company'} to Evaluate
          </label>

          {selectedTarget ? (
            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {selectedTarget.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{selectedTarget.name}</h4>
                  <p className="text-xs text-gray-500">
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
                className="text-xs text-indigo-600"
              >
                Change Target
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${targetType === 'student' ? 'students by name or email...' : 'companies by name or industry...'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Target List Dropdown */}
              <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
                {loadingTargets ? (
                  <div className="p-4 text-center text-xs text-gray-500">Searching...</div>
                ) : targets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No matching {targetType}s found. Try another search term.
                  </div>
                ) : (
                  targets.map((target) => (
                    <button
                      key={target._id}
                      type="button"
                      onClick={() => setSelectedTarget(target)}
                      className="w-full text-left p-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                          {target.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight">{target.name}</p>
                          <p className="text-xs text-gray-500">
                            {targetType === 'student'
                              ? target.profile?.degree || target.email
                              : target.industry || 'Company'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="neutral" size="sm">
                        Select
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Criteria Ratings Section */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Multi-Criteria Star Ratings
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Calculated Overall:</span>
              <span className="text-base font-extrabold text-indigo-600">{computedOverall}</span>
              <span className="text-xs text-gray-400">/ 5.0</span>
            </div>
          </div>

          {targetType === 'student' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Technical Skills & Proficiency</p>
                  <p className="text-xs text-gray-500">Code quality, problem-solving, architectural design</p>
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
                  <p className="text-sm font-medium text-gray-800">Soft Skills & Communication</p>
                  <p className="text-xs text-gray-500">Teamwork, articulation, active listening</p>
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
                  <p className="text-sm font-medium text-gray-800">Professionalism & Work Ethic</p>
                  <p className="text-xs text-gray-500">Punctuality, accountability, ethical conduct</p>
                </div>
                <StarRating
                  value={ratings.professionalism}
                  onChange={(val) => handleRatingChange('professionalism', val)}
                  size="md"
                  showScore
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Work Environment & Culture</p>
                  <p className="text-xs text-gray-500">Safe, inclusive, supportive learning atmosphere</p>
                </div>
                <StarRating
                  value={ratings.workEnvironment}
                  onChange={(val) => handleRatingChange('workEnvironment', val)}
                  size="md"
                  showScore
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Mentorship & Guidance Quality</p>
                  <p className="text-xs text-gray-500">Senior supervision, feedback cadence, intern development</p>
                </div>
                <StarRating
                  value={ratings.mentorship}
                  onChange={(val) => handleRatingChange('mentorship', val)}
                  size="md"
                  showScore
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Professionalism & Integrity</p>
                  <p className="text-xs text-gray-500">Fair compensation, timely communication, adherence to terms</p>
                </div>
                <StarRating
                  value={ratings.professionalism}
                  onChange={(val) => handleRatingChange('professionalism', val)}
                  size="md"
                  showScore
                />
              </div>
            </div>
          )}
        </div>

        {/* Written Review Comments */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Detailed Academic Feedback & Endorsement <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">{comments.length}/2000 characters</span>
          </div>
          <textarea
            rows={4}
            maxLength={2000}
            required
            placeholder={
              targetType === 'student'
                ? "Describe the student's strengths, project contributions, and readiness for industrial internship..."
                : "Evaluate the company's internship program structure, intern support, and organizational culture..."
            }
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting} disabled={!selectedTarget}>
            Publish Verified Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
