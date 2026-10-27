import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { StarRating } from './StarRating';
import { apiClient } from '../../../services/apiClient';
import {
  Star,
  Search,
  User,
  Building2,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const GiveReviewForm = ({
  initialTargetType = 'Student',
  initialTargetId = null,
  onSuccess,
  onCancel,
  standalone = false,
}) => {
  const [targetType, setTargetType] = useState(initialTargetType);
  const [searchQuery, setSearchQuery] = useState('');
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loadingTargets, setLoadingTargets] = useState(false);

  // Criteria ratings: technicalSkills, communication, professionalism
  const [criteria, setCriteria] = useState({
    technicalSkills: 5,
    communication: 5,
    professionalism: 5,
  });

  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch targets when targetType or searchQuery changes
  useEffect(() => {
    let isMounted = true;
    const fetchTargets = async () => {
      setLoadingTargets(true);
      try {
        const res = await apiClient.get(
          `/reviews/targets?type=${targetType.toLowerCase()}&q=${encodeURIComponent(searchQuery)}`
        );
        if (isMounted) {
          const list = res.data?.targets || [];
          setTargets(list);
          if (initialTargetId && !selectedTarget) {
            const found = list.find((t) => t._id === initialTargetId);
            if (found) setSelectedTarget(found);
          }
        }
      } catch (err) {
        console.error('Failed to load targets', err);
      } finally {
        if (isMounted) setLoadingTargets(false);
      }
    };

    const timer = setTimeout(fetchTargets, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [targetType, searchQuery, initialTargetId]);

  // Compute live overall rating average
  const criteriaKeys = ['technicalSkills', 'communication', 'professionalism'];
  const overallAvg =
    Math.round(
      (criteriaKeys.reduce((acc, k) => acc + (criteria[k] || 5), 0) / criteriaKeys.length) * 10
    ) / 10;

  const handleRatingChange = (key, val) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedTarget) {
      setError(`Please select a ${targetType.toLowerCase()} to evaluate.`);
      return;
    }

    if (!comments.trim()) {
      setError('Please provide written evaluation comments.');
      return;
    }

    setSubmitting(true);

    try {
      // Calls POST /api/reviews
      const res = await apiClient.post('/reviews', {
        targetId: selectedTarget._id,
        targetType: targetType,
        ratingCriteria: {
          technicalSkills: criteria.technicalSkills,
          communication: criteria.communication,
          professionalism: criteria.professionalism,
        },
        comments: comments.trim(),
      });

      setSuccessMsg(
        res.message || `Evaluation successfully submitted for ${selectedTarget.name}!`
      );

      // Reset
      setComments('');
      setCriteria({ technicalSkills: 5, communication: 5, professionalism: 5 });

      if (onSuccess) {
        setTimeout(() => onSuccess(res.data), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert type="danger" title="Error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert type="success" title="Success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Target Type Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Evaluation Target Entity
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setTargetType('Student');
              setSelectedTarget(null);
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
              targetType === 'Student'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Undergraduate Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetType('Company');
              setSelectedTarget(null);
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
              targetType === 'Company'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Corporate Employer</span>
          </button>
        </div>
      </div>

      {/* Target Selection & Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Select {targetType}
        </label>

        {selectedTarget ? (
          <div className="flex items-center justify-between p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                {selectedTarget.name?.charAt(0) || 'T'}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  {selectedTarget.name}
                  <Badge variant="primary" size="sm">
                    Selected
                  </Badge>
                </p>
                <p className="text-xs text-gray-500">
                  {selectedTarget.email || selectedTarget.industry || 'Registered Candidate'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTarget(null)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Change Target
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${targetType.toLowerCase()} by name, email, or keywords...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {loadingTargets ? (
                <div className="p-4 text-center text-xs text-gray-400">Searching...</div>
              ) : targets.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No {targetType.toLowerCase()}s found matching search criteria.
                </div>
              ) : (
                targets.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTarget(t)}
                    className="flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {t.email || t.industry || t.profile?.university || 'Candidate'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" type="button" className="text-[11px] px-2 py-0.5">
                      Select
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Multi-Criteria Ratings: technicalSkills, communication, professionalism */}
      <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Multi-Criteria Ratings (1 – 5 Stars)
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Overall Score: {overallAvg.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {/* 1. Technical Skills */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-800">Technical Skills & Competence</p>
            <p className="text-[11px] text-gray-400">
              Domain expertise, problem solving, and technical execution
            </p>
          </div>
          <StarRating
            value={criteria.technicalSkills}
            onChange={(v) => handleRatingChange('technicalSkills', v)}
            size="md"
            showScore
          />
        </div>

        {/* 2. Communication */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-800">Communication & Teamwork</p>
            <p className="text-[11px] text-gray-400">
              Clarity, collaboration, feedback receptiveness, and team sync
            </p>
          </div>
          <StarRating
            value={criteria.communication}
            onChange={(v) => handleRatingChange('communication', v)}
            size="md"
            showScore
          />
        </div>

        {/* 3. Professionalism */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-800">Professionalism & Ethics</p>
            <p className="text-[11px] text-gray-400">
              Punctuality, work ethic, integrity, and organizational adherence
            </p>
          </div>
          <StarRating
            value={criteria.professionalism}
            onChange={(v) => handleRatingChange('professionalism', v)}
            size="md"
            showScore
          />
        </div>
      </div>

      {/* Written Evaluation Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Written Evaluation Feedback <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Provide structured feedback detailing student strengths, project accomplishments, areas for growth, or mentorship quality..."
          required
          maxLength={2000}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
        />
        <p className="text-right text-[11px] text-gray-400 mt-0.5">{comments.length}/2000 characters</p>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={submitting} disabled={!selectedTarget}>
          <ShieldCheck className="w-4 h-4 mr-1.5 inline" />
          Submit Verified Review
        </Button>
      </div>
    </form>
  );

  if (standalone) {
    return (
      <Card className="max-w-2xl mx-auto shadow-md border-gray-200">
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Submit Academic & Industry Evaluation
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            As an approved university lecturer or supervisor, your ratings and verified endorsements directly impact the recipient's certified reputation score.
          </p>
        </div>
        {formContent}
      </Card>
    );
  }

  return formContent;
};

export default GiveReviewForm;
