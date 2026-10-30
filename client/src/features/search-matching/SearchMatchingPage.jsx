import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/apiClient';
import { useDebounce } from './hooks/useDebounce';
import { FilterSidebar } from './components/FilterSidebar';
import { InternshipCard } from './components/InternshipCard';
import { CandidateCard } from './components/CandidateCard';
import { InternshipDetailModal } from './components/InternshipDetailModal';
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
  ArrowUpDown,
  MapPin,
  LayoutGrid,
  List,
  Send,
} from 'lucide-react';

import hero1 from './assets/hero-1.jpg';
import hero2 from './assets/hero-2.jpg';
import hero3 from './assets/hero-3.jpg';
import hero4 from './assets/hero-4.jpg';
import hero5 from './assets/hero-5.jpg';
import hero6 from './assets/hero-6.jpg';
import hero7 from './assets/hero-7.jpg';
import hero8 from './assets/hero-8.jpg';

const HERO_IMAGES = [hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8];

const INITIAL_FILTERS = {
  locationType: 'All',
  area: '',
  durationMonths: '',
  isPaid: '',
  skills: '',
  minMatch: '',
  location: '',
  university: '',
  degree: '',
  academicYear: 'All',
  minGpa: '',
};

const SKILL_DISPLAY_NAMES = {
  javascript: 'JavaScript',
  'express.js': 'Express.js',
  express: 'Express.js',
  mysql: 'MySQL',
  sql: 'SQL',
  java: 'Java',
  'c++': 'C++',
  cpp: 'C++',
  'html & css': 'HTML & CSS',
  html: 'HTML',
  html5: 'HTML5',
  css: 'CSS',
  css3: 'CSS3',
  'rest api': 'REST API',
  'rest apis': 'REST APIs',
  'machine learning': 'Machine Learning',
  ml: 'ML',
  figma: 'Figma',
  cybersecurity: 'Cybersecurity',
  firebase: 'Firebase',
  supabase: 'Supabase',
  react: 'React',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  python: 'Python',
  linux: 'Linux',
  docker: 'Docker',
  typescript: 'TypeScript',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  mongodb: 'MongoDB',
  'tailwind css': 'Tailwind CSS',
  tailwind: 'Tailwind CSS',
  'network security': 'Network Security',
  wireshark: 'Wireshark',
  selenium: 'Selenium',
  owasp: 'OWASP',
  siem: 'SIEM',
  go: 'Go',
  git: 'Git',
  aws: 'AWS',
};

const formatSkillName = (s = '') => {
  const lower = s.toLowerCase().trim();
  return SKILL_DISPLAY_NAMES[lower] || s.charAt(0).toUpperCase() + s.slice(1);
};

export const SearchMatchingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isStudent = user?.role === 'student';
  const isCompany = user?.role === 'company' || user?.role === 'admin';

  // Logged-in student profile skills from Member 1 Portfolio
  const [studentSkills, setStudentSkills] = useState([]);
  const [studentProfileLoaded, setStudentProfileLoaded] = useState(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('all_internships'); // 'all_internships' | 'top_matches' | 'candidates'

  // View mode state: 'list' (default, stacked) or 'grid' (2 columns)
  const [viewMode, setViewMode] = useState('list');

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

  // Random hero image state (selects randomly on page load/refresh)
  const [currentHeroIndex] = useState(() =>
    Math.floor(Math.random() * HERO_IMAGES.length)
  );

  // Handle individual filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
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
        const res = await apiClient.get('/match/internships', {
          params: { page, limit: 10 },
        });
        setItems(res.data?.items || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
      } else {
        const params = {
          keyword: debouncedSearchTerm || undefined,
          skills: filters.skills || undefined,
          locationType: filters.locationType !== 'All' ? filters.locationType : undefined,
          area: filters.area || undefined,
          location: filters.location || undefined,
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

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Load logged-in student's saved competencies from Member 1 StudentProfile
  useEffect(() => {
    if (isStudent && isAuthenticated) {
      apiClient
        .get('/students/me')
        .then((res) => {
          const profile = res.data?.data || res.data;
          if (profile && Array.isArray(profile.skills)) {
            setStudentSkills(profile.skills);
          }
          setStudentProfileLoaded(true);
        })
        .catch((err) => {
          console.warn('Could not load student profile skills:', err);
          setStudentProfileLoaded(true);
        });
    } else {
      setStudentSkills([]);
      setStudentProfileLoaded(false);
    }
  }, [isStudent, isAuthenticated]);

  const handleApply = (internship) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/applications', { state: { preselectedInternship: internship } });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'locationType' || key === 'academicYear') return val !== 'All';
    return Boolean(val);
  }).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Tab Switcher on Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all_internships');
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all_internships'
                ? 'bg-white text-blue-700 shadow-xs'
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
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Best Matches
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
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Find Candidates
            </button>
          )}
        </div>

        {/* Guest sign-in callout */}
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Sign In to view match scores →
          </button>
        )}
      </div>

      {/* Student Profile Skills Quick-Match Banner */}
      {isStudent && studentSkills.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-white rounded-2xl border border-indigo-200/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs flex-shrink-0 mt-0.5 md:mt-0">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900">
                  Matched with Your Profile Skills
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                  {studentSkills.length} Skills in Portfolio
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-xs text-gray-500 font-medium mr-1">Your competencies:</span>
                {studentSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-indigo-200 text-indigo-800 shadow-3xs"
                  >
                    {formatSkillName(skill)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                const currentList = filters.skills
                  ? filters.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
                  : [];
                const areAllActive = studentSkills.every((s) =>
                  currentList.includes(s.toLowerCase().trim())
                );
                if (areAllActive) {
                  handleFilterChange('skills', '');
                } else {
                  handleFilterChange('skills', studentSkills.join(','));
                }
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                studentSkills.every((s) =>
                  (filters.skills || '')
                    .toLowerCase()
                    .split(',')
                    .map((sk) => sk.trim())
                    .includes(s.toLowerCase().trim())
                )
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {studentSkills.every((s) =>
                (filters.skills || '')
                  .toLowerCase()
                  .split(',')
                  .map((sk) => sk.trim())
                  .includes(s.toLowerCase().trim())
              )
                ? '✓ Showing Only Matching Internships'
                : 'Filter Internships for My Skills'}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('top_matches');
                setPage(1);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-3xs transition-colors flex items-center gap-1"
            >
              Ranked Matches
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* LEFT COLUMN: FILTER SIDEBAR */}
        <FilterSidebar
          mode={activeTab === 'candidates' ? 'candidates' : 'internships'}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isStudent={isStudent}
          studentSkills={studentSkills}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
          totalCounts={{
            all: pagination.total || items.length,
            internships: pagination.total || items.length,
            remote: items.filter((i) => i.locationType === 'Remote').length,
            hybrid: items.filter((i) => i.locationType === 'Hybrid').length,
            onsite: items.filter((i) => i.locationType === 'On-site').length,
          }}
        />

        {/* RIGHT COLUMN: HERO BANNER + SEARCH ROW + OPPORTUNITY CARDS */}
        <div className="flex-1 w-full space-y-4">
          {/* 1. HERO SECTION WITH MOTIVATION GRAPHIC */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-stretch justify-between">
            {/* Left Content */}
            <div className="p-6 md:py-6 md:pl-7 md:pr-4 flex-1 flex flex-col justify-center z-10 max-w-xl space-y-1.5">
              <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                YOUR SKILLS • OUR NETWORK • BETTER FUTURE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Opportunity Discovery &amp; Matching
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Explore and find the best opportunities that match your skills, interests and career goals.
              </p>
            </div>

            {/* Right Side Rotating Hero Gallery - Fits Entire Right Half of Card */}
            <div className="relative flex-shrink-0 w-full md:w-[360px] lg:w-[440px] xl:w-[480px] h-40 md:h-auto self-stretch overflow-hidden group select-none">
              {HERO_IMAGES.map((imgSrc, idx) => (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={`InternBridge Showcase ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    idx === currentHeroIndex
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
                  }`}
                  loading="eager"
                />
              ))}

              {/* Seamless soft gradient blend between white card and image */}
              <div className="hidden md:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none z-10" />
            </div>
          </div>

          {/* 2. SEARCH BAR & CONTROLS ROW */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 flex flex-col sm:flex-row items-center gap-2">
            {/* Keyword Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by job title, keywords, company or location..."
                className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm rounded-xl border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5"
            >
              <Filter className="w-4 h-4 text-gray-500" /> Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Location Dropdown */}
            <div className="relative w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-2">
              <div className="relative">
                <select
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-7 pr-7 py-2 text-xs font-semibold border-0 rounded-lg bg-transparent text-gray-700 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="Colombo">Colombo, Sri Lanka</option>
                  <option value="Kandy">Kandy, Sri Lanka</option>
                  <option value="Galle">Galle, Sri Lanka</option>
                  <option value="Remote">Remote</option>
                </select>
                <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-1.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Sort / Relevance Dropdown */}
            <div className="relative w-full sm:w-40 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-2">
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-7 pr-7 py-2 text-xs font-semibold border-0 rounded-lg bg-transparent text-gray-700 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="newest">Relevance</option>
                  {isStudent && <option value="highest_match">Highest Match</option>}
                  <option value="deadline">Deadline Soonest</option>
                  <option value="duration">Duration</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-1.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. RESULTS HEADER (Count & View Switcher) */}
          <div className="flex items-center justify-between text-xs text-gray-600 px-1 pt-1">
            <span className="font-bold text-gray-900 text-sm">
              {pagination.total} opportunities found
            </span>

            {/* Grid vs List View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-gray-200">
              <Spinner size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert type="danger" title="Search Error">
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchResults}
                className="mt-2 text-xs font-semibold underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && items.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10">
              <EmptyState
                icon={<Briefcase className="w-12 h-12 text-gray-400" />}
                title="No opportunities found"
                description="We couldn't find any opportunities matching your filters. Try resetting or broadening your criteria."
                actionText="Reset Filters"
                onAction={handleResetFilters}
              />
            </div>
          )}

          {/* 4. OPPORTUNITY CARDS FEED (List View or Grid View) */}
          {!isLoading && !error && activeTab !== 'candidates' && items.length > 0 && (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 xl:grid-cols-2 gap-4'
                  : 'space-y-4'
              }
            >
              {items.map((internship) => (
                <InternshipCard
                  key={internship._id || internship.id}
                  internship={internship}
                  isStudent={isStudent}
                  selectedSkills={filters.skills}
                  onViewDetails={(item) => setSelectedInternship(item)}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}

          {/* Candidates Feed (For Recruiters) */}
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

          {/* 5. BOTTOM PAGINATION & HANDWRITTEN CALLOUT */}
          {!isLoading && items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              {/* Left: Showing count */}
              <span className="text-xs text-gray-500 font-medium">
                Showing{' '}
                {pagination.total > 0
                  ? `${(page - 1) * (pagination.limit || 10) + 1} – ${Math.min(
                      page * (pagination.limit || 10),
                      pagination.total
                    )}`
                  : '0'}{' '}
                of {pagination.total} opportunities
              </span>

              {/* Center: Pagination Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      page === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Handwritten Motivation Callout */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-blue-600 font-bold select-none">
                <span
                  style={{
                    fontFamily: "cursive, 'Brush Script MT', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  Your next opportunity is just a click away ↗
                </span>
              </div>
            </div>
          )}
        </div>
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
