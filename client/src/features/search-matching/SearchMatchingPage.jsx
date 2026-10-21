import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/apiClient';
import { useDebounce } from './hooks/useDebounce';
import { FilterSidebar } from './components/FilterSidebar';
import { InternshipCard } from './components/InternshipCard';
import { CandidateCard } from './components/CandidateCard';
import { InternshipDetailModal } from './components/InternshipDetailModal';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import {
  Search,
  Filter,
  Sparkles,
  Briefcase,
  Users,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  GraduationCap,
} from 'lucide-react';

const INITIAL_FILTERS = {
  locationType: 'All',
  area: '',
  durationMonths: '',
  isPaid: '',
  skills: '',
  minMatch: '',
  university: '',
  degree: '',
  academicYear: 'All',
  minGpa: '',
};

export const SearchMatchingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isStudent = user?.role === 'student';
  const isCompany = user?.role === 'company' || user?.role === 'admin';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('all_internships'); // 'all_internships' | 'top_matches' | 'candidates'

  // Search keyword state & debounced query
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // Filters & sorting state
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortOption, setSortOption] = useState(isStudent ? 'highest_match' : 'newest');
  const [page, setPage] = useState(1);

  // Results & UI state
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Modal inspection state
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Handle individual filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter modification
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
    setPage(1);
    setSortOption(isStudent ? 'highest_match' : 'newest');
  };

  // Remove single active filter
  const handleRemoveFilter = (key) => {
    handleFilterChange(key, INITIAL_FILTERS[key]);
  };

  // Fetch results based on active tab and query options
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'candidates') {
        // Candidate Search endpoint for companies
        const params = {
          keyword: debouncedSearchTerm || undefined,
          skills: filters.skills || undefined,
          university: filters.university || undefined,
          degree: filters.degree || undefined,
          academicYear: filters.academicYear !== 'All' ? filters.academicYear : undefined,
          minGpa: filters.minGpa || undefined,
          page,
          limit: 10,
        };

        const res = await apiClient.get('/search/students', { params });
        setItems(res.data?.items || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
      } else if (activeTab === 'top_matches' && isStudent) {
        // Personalized Recommended Internships endpoint for students
        const res = await apiClient.get('/match/internships', {
          params: { page, limit: 10 },
        });
        setItems(res.data?.items || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
      } else {
        // Standard Multi-parameter Internship Search & Filter
        const params = {
          keyword: debouncedSearchTerm || undefined,
          skills: filters.skills || undefined,
          locationType: filters.locationType !== 'All' ? filters.locationType : undefined,
          area: filters.area || undefined,
          durationMonths: filters.durationMonths || undefined,
          isPaid: filters.isPaid || undefined,
          minMatch: isStudent && filters.minMatch ? filters.minMatch : undefined,
          sort: sortOption,
          page,
          limit: 10,
        };

        const res = await apiClient.get('/search/internships', { params });
        setItems(res.data?.items || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'Failed to load results. Please try again.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedSearchTerm, filters, sortOption, page, isStudent]);

  // Trigger query on parameter updates
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Apply button action handler
  const handleApply = (internship) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navigate to applications workflow with preselected internship
    navigate('/applications', { state: { preselectedInternship: internship } });
  };

  // Calculate count of active filters for mobile badge
  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'locationType' || key === 'academicYear') return val !== 'All';
    return Boolean(val);
  }).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Opportunity Discovery & Matching
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore industry opportunities matched dynamically against student portfolio competencies.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start md:self-auto border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all_internships');
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all_internships'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Internships
          </button>

          {isStudent && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('top_matches');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'top_matches'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Best Matches
            </button>
          )}

          {isCompany && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('candidates');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'candidates'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Find Candidates
            </button>
          )}
        </div>
      </div>

      {/* Guest Notice Banner */}
      {!isAuthenticated && (
        <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border-indigo-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Want personalized skill matching?
                </h4>
                <p className="text-xs text-gray-600">
                  Log in as a student to see match percentage scores and gap analysis for every opportunity.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              className="flex-shrink-0"
            >
              Sign In to View Matches
            </Button>
          </div>
        </Card>
      )}

      {/* Main Search Bar & Quick Controls */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Keyword Input with Debounce */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={
                activeTab === 'candidates'
                  ? 'Search candidates by university, degree, field of study, or bio...'
                  : 'Search by job title, technologies, company, or location...'
              }
              className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="secondary"
            className="md:hidden w-full sm:w-auto gap-2"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <Filter className="w-4 h-4" /> Filters
            {activeFiltersCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Sort Selector (For Internships) */}
          {activeTab !== 'candidates' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-44">
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-3 pr-8 py-2 text-xs font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {isStudent && <option value="highest_match">Highest Match</option>}
                  <option value="newest">Newest First</option>
                  <option value="deadline">Deadline Soonest</option>
                  <option value="duration">Shortest Duration</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium mr-1">Active:</span>

            {searchTerm && (
              <Badge variant="neutral" size="sm" className="gap-1">
                Keyword: "{searchTerm}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => setSearchTerm('')}
                />
              </Badge>
            )}

            {filters.locationType !== 'All' && (
              <Badge variant="neutral" size="sm" className="gap-1">
                Type: {filters.locationType}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('locationType')}
                />
              </Badge>
            )}

            {filters.area && (
              <Badge variant="neutral" size="sm" className="gap-1">
                Area: {filters.area}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('area')}
                />
              </Badge>
            )}

            {filters.durationMonths && (
              <Badge variant="neutral" size="sm" className="gap-1">
                Duration: ≤ {filters.durationMonths} Mo
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('durationMonths')}
                />
              </Badge>
            )}

            {filters.isPaid === 'true' && (
              <Badge variant="success" size="sm" className="gap-1">
                Paid Only
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('isPaid')}
                />
              </Badge>
            )}

            {filters.minMatch && (
              <Badge variant="purple" size="sm" className="gap-1">
                Min Match: {filters.minMatch}%
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('minMatch')}
                />
              </Badge>
            )}

            {filters.skills &&
              filters.skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill) => (
                  <Badge key={skill} variant="info" size="sm" className="gap-1">
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => {
                        const updated = filters.skills
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s.toLowerCase() !== skill.toLowerCase())
                          .join(',');
                        handleFilterChange('skills', updated);
                      }}
                    />
                  </Badge>
                ))}

            {filters.university && (
              <Badge variant="neutral" size="sm" className="gap-1">
                Uni: {filters.university}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('university')}
                />
              </Badge>
            )}

            {filters.academicYear !== 'All' && (
              <Badge variant="neutral" size="sm" className="gap-1">
                Year: {filters.academicYear}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('academicYear')}
                />
              </Badge>
            )}

            {filters.minGpa && (
              <Badge variant="neutral" size="sm" className="gap-1">
                GPA ≥ {filters.minGpa}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveFilter('minGpa')}
                />
              </Badge>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-auto transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </Card>

      {/* Main Two-Column Content Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Filter Sidebar (Desktop) & Drawer (Mobile) */}
        <FilterSidebar
          mode={activeTab === 'candidates' ? 'candidates' : 'internships'}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isStudent={isStudent}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Right: Results Content Feed */}
        <main className="flex-1 space-y-4">
          {/* Results Summary Count */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong className="text-gray-900">{items.length}</strong> of{' '}
              <strong className="text-gray-900">{pagination.total}</strong>{' '}
              {activeTab === 'candidates' ? 'candidate students' : 'opportunities'}
            </span>
            {pagination.pages > 1 && (
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-24">
              <Spinner size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert type="danger" title="Search Error">
              <p>{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchResults}
                className="mt-3 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </Button>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && items.length === 0 && (
            <Card className="p-8">
              <EmptyState
                icon={
                  activeTab === 'candidates' ? (
                    <Users className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Briefcase className="w-12 h-12 text-gray-400" />
                  )
                }
                title={
                  activeTab === 'candidates'
                    ? 'No candidates found'
                    : 'No matching internships found'
                }
                description="We couldn't find any results matching your search terms and filter criteria. Try adjusting your filters or resetting them."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            </Card>
          )}

          {/* Results List: Internships */}
          {!isLoading && !error && activeTab !== 'candidates' && items.length > 0 && (
            <div className="space-y-4">
              {items.map((internship) => (
                <InternshipCard
                  key={internship._id || internship.id}
                  internship={internship}
                  isStudent={isStudent}
                  onViewDetails={(item) => setSelectedInternship(item)}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}

          {/* Results List: Candidates */}
          {!isLoading && !error && activeTab === 'candidates' && items.length > 0 && (
            <div className="space-y-4">
              {items.map((candidate) => (
                <CandidateCard
                  key={candidate._id || candidate.id}
                  candidate={candidate}
                  queriedSkills={
                    filters.skills
                      ? filters.skills.split(',').map((s) => s.trim())
                      : []
                  }
                />
              ))}
            </div>
          )}

          {/* Pagination Navigation */}
          {!isLoading && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => {
                  // Only display near current page
                  if (
                    p === 1 ||
                    p === pagination.pages ||
                    (p >= page - 1 && p <= page + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          page === p
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return (
                      <span key={p} className="text-xs text-gray-400 px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Internship Full Details Modal */}
      <InternshipDetailModal
        isOpen={Boolean(selectedInternship)}
        onClose={() => setSelectedInternship(null)}
        internship={selectedInternship}
        onApply={handleApply}
        isStudent={isStudent}
      />
    </div>
  );
};

export default SearchMatchingPage;
