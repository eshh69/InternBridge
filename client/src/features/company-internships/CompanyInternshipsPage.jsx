import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';

import { CompanyDashboardStats } from './components/CompanyDashboardStats';
import { InternshipFormModal } from './components/InternshipFormModal';
import { InternshipDetailsModal } from './components/InternshipDetailsModal';
import { CompanyProfileSection } from './components/CompanyProfileSection';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';

import {
  getMyInternships,
  getMyCompanyProfile,
  updateMyCompanyProfile,
  createInternship,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
} from './companyApi';

import {
  Briefcase,
  LayoutDashboard,
  Building2,
  PlusCircle,
  Search,
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  PauseCircle,
  RotateCcw,
} from 'lucide-react';

export const CompanyInternshipsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  // Data States
  const [internships, setInternships] = useState([]);
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
    totalApplicants: 0,
  });

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorAlert, setErrorAlert] = useState('');
  const [successAlert, setSuccessAlert] = useState('');

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Control States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedForView, setSelectedForView] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  // Switch Tab Helper
  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Fetch all company data on load
  const loadCompanyData = async () => {
    setIsLoading(true);
    setErrorAlert('');
    try {
      // 1. Fetch Company Profile (handles missing profile gracefully)
      let companyProfile = null;
      try {
        const profileRes = await getMyCompanyProfile();
        companyProfile = profileRes.data;
        setCompany(companyProfile);
      } catch (err) {
        setCompany(null);
      }

      // 2. Fetch Company Internships & Stats
      const internshipsRes = await getMyInternships();
      if (internshipsRes.data) {
        setInternships(internshipsRes.data.internships || []);
        if (internshipsRes.data.stats) {
          setStats(internshipsRes.data.stats);
        }
        if (!companyProfile && internshipsRes.data.company) {
          setCompany(internshipsRes.data.company);
        }
      }
    } catch (err) {
      setErrorAlert(err.message || 'Failed to load company data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

  const notifySuccess = (message) => {
    setSuccessAlert(message);
    setTimeout(() => setSuccessAlert(''), 4500);
  };

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' ? true : item.status === statusFilter;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus;

      const titleMatch = item.title?.toLowerCase().includes(query);
      const areaMatch = item.area?.toLowerCase().includes(query);
      const locationMatch = item.location?.toLowerCase().includes(query);
      const skillsMatch = item.requiredSkills?.some((s) =>
        s.toLowerCase().includes(query)
      );

      return matchesStatus && (titleMatch || areaMatch || locationMatch || skillsMatch);
    });
  }, [internships, statusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    if (!company) {
      handleTabChange('profile');
      setErrorAlert('Please complete your company profile details before posting an internship.');
      return;
    }
    setSelectedForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (internship) => {
    setSelectedForEdit(internship);
    setIsFormModalOpen(true);
  };

  const handleOpenViewModal = (internship) => {
    setSelectedForView(internship);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (internship) => {
    setSelectedForDelete(internship);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    setErrorAlert('');
    try {
      if (selectedForEdit) {
        const res = await updateInternship(selectedForEdit._id, payload);
        const updated = res.data;
        setInternships((prev) =>
          prev.map((i) => (i._id === updated._id ? { ...i, ...updated } : i))
        );
        notifySuccess(`Internship "${updated.title}" updated successfully.`);
      } else {
        const res = await createInternship(payload);
        const created = res.data;
        setInternships((prev) => [created, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          published: created.status === 'published' ? prev.published + 1 : prev.published,
          draft: created.status === 'draft' ? prev.draft + 1 : prev.draft,
        }));
        notifySuccess(`Internship "${created.title}" created successfully.`);
      }
      setIsFormModalOpen(false);
    } catch (err) {
      setErrorAlert(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (internshipId, newStatus) => {
    setErrorAlert('');
    try {
      const res = await updateInternshipStatus(internshipId, newStatus);
      const updated = res.data;

      setInternships((prev) => {
        const nextList = prev.map((i) =>
          i._id === updated._id ? { ...i, status: updated.status } : i
        );
        const publishedCount = nextList.filter((i) => i.status === 'published').length;
        const draftCount = nextList.filter((i) => i.status === 'draft').length;
        const closedCount = nextList.filter((i) => i.status === 'closed').length;
        setStats((s) => ({
          ...s,
          published: publishedCount,
          draft: draftCount,
          closed: closedCount,
        }));
        return nextList;
      });

      notifySuccess(`Internship status changed to "${newStatus}".`);
    } catch (err) {
      setErrorAlert(err.message || 'Failed to update internship status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedForDelete || isSubmitting) return;
    setIsSubmitting(true);
    setErrorAlert('');
    try {
      await deleteInternship(selectedForDelete._id);
      setInternships((prev) => prev.filter((i) => i._id !== selectedForDelete._id));
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        published:
          selectedForDelete.status === 'published'
            ? Math.max(0, prev.published - 1)
            : prev.published,
        draft:
          selectedForDelete.status === 'draft' ? Math.max(0, prev.draft - 1) : prev.draft,
        closed:
          selectedForDelete.status === 'closed'
            ? Math.max(0, prev.closed - 1)
            : prev.closed,
      }));
      notifySuccess('Internship listing deleted successfully.');
      setIsDeleteModalOpen(false);
    } catch (err) {
      setErrorAlert(err.message || 'Failed to delete internship.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCompanyProfile = async (profileData) => {
    setIsSubmitting(true);
    setErrorAlert('');
    try {
      const res = await updateMyCompanyProfile(profileData);
      setCompany(res.data);
      notifySuccess('Company profile saved successfully.');
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 mt-4 font-medium animate-pulse">
          Loading company recruitment portal...
        </p>
      </div>
    );
  }

  const tabsConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'internships', label: 'Manage Internships', icon: Briefcase, count: stats.total },
    { id: 'profile', label: 'Company Profile', icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Company & Internship Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Post and manage internship opportunities
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          size="md"
          className="gap-2 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Post New Internship
        </Button>
      </div>

      {/* Global Alerts */}
      {errorAlert && (
        <Alert type="danger" title="Action Failed">
          {errorAlert}
        </Alert>
      )}

      {successAlert && (
        <Alert type="success" title="Success">
          {successAlert}
        </Alert>
      )}

      {/* Modern Accessible Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs w-fit max-w-full overflow-x-auto">
        <nav className="flex space-x-1.5" aria-label="Portal Navigation Tabs">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-3 sm:px-4 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-indigo-700/80 text-white'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.id === 'profile' && !company && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================
          TAB 1: COMPANY DASHBOARD
          ======================================================== */}
      {currentTab === 'dashboard' && (
        <CompanyDashboardStats
          stats={stats}
          company={company}
          recentInternships={internships}
          onOpenCreateModal={handleOpenCreateModal}
          onSwitchTab={handleTabChange}
          onViewInternship={handleOpenViewModal}
        />
      )}

      {/* ========================================================
          TAB 2: MANAGE INTERNSHIPS
          ======================================================== */}
      {currentTab === 'internships' && (
        <div className="space-y-6 animate-slide-up">
          {/* Search Bar & Filter Controls */}
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings by title, skill, discipline, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Postings', count: stats.total },
                  { id: 'published', label: 'Published', count: stats.published },
                  { id: 'draft', label: 'Drafts', count: stats.draft },
                  { id: 'closed', label: 'Closed', count: stats.closed },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      statusFilter === f.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        statusFilter === f.id
                          ? 'bg-indigo-200 text-indigo-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Internship Listings Grid */}
          {filteredInternships.length === 0 ? (
            <Card className="p-12">
              <EmptyState
                icon={<Briefcase className="w-12 h-12 text-slate-300" />}
                title={
                  searchQuery || statusFilter !== 'all'
                    ? 'No matching internship listings'
                    : 'No internship listings created yet'
                }
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search keywords or filter status to view your other listings.'
                    : 'Create your first internship posting to begin connecting with skilled undergraduates.'
                }
                actionText={
                  searchQuery || statusFilter !== 'all' ? 'Reset Filters' : 'Post Internship'
                }
                onAction={
                  searchQuery || statusFilter !== 'all'
                    ? () => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }
                    : handleOpenCreateModal
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInternships.map((internship) => {
                const statusVariant =
                  internship.status === 'published'
                    ? 'success'
                    : internship.status === 'draft'
                    ? 'neutral'
                    : 'warning';

                const formattedDeadline = internship.deadline
                  ? new Date(internship.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Open';

                return (
                  <Card
                    key={internship._id}
                    className="p-5 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Title & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3
                            onClick={() => handleOpenViewModal(internship)}
                            className="font-bold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {internship.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {internship.area}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {internship.location} ({internship.locationType})
                            </span>
                          </p>
                        </div>
                        <Badge variant={statusVariant} size="sm" className="capitalize shrink-0">
                          {internship.status}
                        </Badge>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {internship.description}
                      </p>

                      {/* Required Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {internship.requiredSkills?.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="neutral" size="sm" className="lowercase">
                            {skill}
                          </Badge>
                        ))}
                        {internship.requiredSkills?.length > 4 && (
                          <span className="text-[11px] text-slate-400 font-medium self-center pl-1">
                            +{internship.requiredSkills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Metrics Bar */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl text-center text-xs border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">
                            Duration
                          </span>
                          <span className="font-semibold text-slate-800">
                            {internship.durationMonths} Mos
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">
                            Stipend
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {internship.stipend?.isPaid
                              ? `${internship.stipend.currency} ${internship.stipend.amount}`
                              : 'Unpaid'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">
                            Applicants
                          </span>
                          <span className="font-bold text-indigo-700">
                            {internship.applicantCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="border-t border-slate-100 mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {formattedDeadline}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Status Toggle Action */}
                        {internship.status === 'published' && (
                          <button
                            onClick={() => handleStatusToggle(internship._id, 'closed')}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                            title="Close Listing"
                            aria-label="Close Listing"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        )}

                        {internship.status === 'draft' && (
                          <button
                            onClick={() => handleStatusToggle(internship._id, 'published')}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            title="Publish Listing"
                            aria-label="Publish Listing"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {internship.status === 'closed' && (
                          <button
                            onClick={() => handleStatusToggle(internship._id, 'published')}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            title="Reopen Listing"
                            aria-label="Reopen Listing"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => handleOpenViewModal(internship)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(internship)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          title="Edit Listing"
                          aria-label="Edit Listing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleOpenDeleteModal(internship)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                          title="Delete Listing"
                          aria-label="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: COMPANY PROFILE
          ======================================================== */}
      {currentTab === 'profile' && (
        <CompanyProfileSection
          company={company}
          onSaveProfile={handleSaveCompanyProfile}
          isLoading={isSubmitting}
          isInitialSetup={!company}
        />
      )}

      {/* ========================================================
          MODALS
          ======================================================== */}
      {/* 1. Create / Edit Internship Modal */}
      <InternshipFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedForEdit}
        isLoading={isSubmitting}
      />

      {/* 2. Full Details Modal */}
      <InternshipDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        internship={selectedForView}
        onEdit={handleOpenEditModal}
        onStatusChange={handleStatusToggle}
      />

      {/* 3. Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        internshipTitle={selectedForDelete?.title}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CompanyInternshipsPage;
