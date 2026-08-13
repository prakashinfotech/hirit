import { useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/jobs/SearchBar';
import JobFilters from '../components/jobs/JobFilters';
import JobCard from '../components/jobs/JobCard';
import { getJobs } from '../api/jobs';
import type { JobSearchParams } from '../types';

const PAGE_SIZE = 12;

// ── Skeleton card shown while loading ───────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-gray-100" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-4 bg-gray-100 rounded-full w-24" />
        <div className="h-4 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-28 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded-md w-24" />
      </div>
    </div>
  );
}

// ── Empty state illustration ─────────────────────────────────────────────────

function NoJobsFound({ onClear, keyword }: { onClear: () => void; keyword?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#e0e0e0]">
      {/* Magnifying-glass illustration */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f5f5f5]">
        <svg
          className="w-12 h-12 text-gray-300"
          fill="none"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="3" />
          <path d="M42 42l14 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M21 28h14M28 21v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-bold text-[#1a1a2e]">
        {keyword ? `No jobs found for "${keyword}"` : 'No jobs found'}
      </h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-gray-500">
        Try broadening your search or removing some filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
      >
        <X className="w-4 h-4" />
        Clear Filters
      </button>
    </div>
  );
}

// ── Pagination component ─────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build an array of page numbers with ellipsis markers (null)
  const pages: (number | null)[] = [];
  const delta = 2; // pages either side of current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null); // ellipsis
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg border border-[#e0e0e0] text-sm font-medium text-[#333333] bg-white hover:border-[#2563eb] hover:text-[#2563eb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {pages.map((p, idx) =>
        p === null ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-[#2563eb] text-white border border-[#2563eb]'
                : 'border border-[#e0e0e0] bg-white text-[#333333] hover:border-[#2563eb] hover:text-[#2563eb]'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg border border-[#e0e0e0] text-sm font-medium text-[#333333] bg-white hover:border-[#2563eb] hover:text-[#2563eb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Parse URL params ───────────────────────────────────────────────────────
  const keyword = searchParams.get('q') ?? '';
  const location = searchParams.get('location') ?? '';
  const category = searchParams.get('category') ?? '';
  const jobType = searchParams.get('job_type') ?? '';
  const experienceMin = searchParams.get('experience_min');
  const experienceMax = searchParams.get('experience_max');
  const salaryMin = searchParams.get('salary_min');
  const salaryMax = searchParams.get('salary_max');
  const isRemote = searchParams.get('is_remote') === 'true';
  const ordering = searchParams.get('ordering') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  // ── Build query object from URL ────────────────────────────────────────────
  const filters: JobSearchParams = {
    ...(keyword && { q: keyword }),
    ...(location && { location }),
    ...(category && { category }),
    ...(jobType && { job_type: jobType as JobSearchParams['job_type'] }),
    ...(experienceMin && { experience_min: Number(experienceMin) }),
    ...(experienceMax && { experience_max: Number(experienceMax) }),
    ...(salaryMin && { salary_min: Number(salaryMin) }),
    ...(salaryMax && { salary_max: Number(salaryMax) }),
    ...(isRemote && { is_remote: true }),
    ...(ordering && { ordering }),
    page,
    page_size: PAGE_SIZE,
  };

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => getJobs(filters),
    staleTime: 60 * 1000,
  });

  const totalCount = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const jobs = data?.results ?? [];

  // Count active filters (excluding keyword) for badge display
  const activeFilterCount = [
    jobType,
    isRemote,
    experienceMin,
    experienceMax,
    salaryMin,
    salaryMax,
    category,
    location,
  ].filter(Boolean).length;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFiltersChange = useCallback(
    (updated: JobSearchParams) => {
      setSearchParams(() => {
        const next = new URLSearchParams();
        if (updated.q) next.set('q', updated.q);
        if (updated.location) next.set('location', updated.location);
        if (updated.category) next.set('category', updated.category);
        if (updated.job_type) next.set('job_type', updated.job_type);
        if (updated.experience_min != null)
          next.set('experience_min', String(updated.experience_min));
        if (updated.experience_max != null)
          next.set('experience_max', String(updated.experience_max));
        if (updated.salary_min != null)
          next.set('salary_min', String(updated.salary_min));
        if (updated.salary_max != null)
          next.set('salary_max', String(updated.salary_max));
        if (updated.is_remote) next.set('is_remote', 'true');
        if (ordering) next.set('ordering', ordering);
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams, ordering],
  );

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setOrdering = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('ordering', val);
      else next.delete('ordering');
      next.set('page', '1');
      return next;
    });
  };

  const clearAllFilters = () => {
    navigate(`/jobs${keyword ? `?q=${encodeURIComponent(keyword)}` : ''}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />

      {/* ── Compact search bar strip ────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e0e0e0] pt-[64px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar
            size="sm"
            defaultKeyword={keyword}
            defaultLocation={location}
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="flex gap-6 items-start">

          {/* ── Left: Filters sidebar (desktop, fixed 280px) ──────────── */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[80px]">
            <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e0e0e0]">
                <h2 className="text-base font-bold text-[#1a1a2e]">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:text-blue-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2563eb] text-white text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  </button>
                )}
              </div>

              {/* Filter component — strip its own outer border since we handle it here */}
              <div className="px-1">
                <JobFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                  className="border-0 rounded-none shadow-none"
                />
              </div>
            </div>
          </aside>

          {/* ── Right: Job results ────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Results top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white rounded-xl border border-[#e0e0e0] px-5 py-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-[#333333] border border-[#e0e0e0] rounded-lg px-3 py-1.5 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2563eb] text-white text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Count */}
                {isLoading ? (
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                ) : (
                  <p className="text-sm text-[#666666]">
                    <span className="font-bold text-[#1a1a2e] text-base">
                      {totalCount.toLocaleString('en-IN')}
                    </span>{' '}
                    {totalCount === 1 ? 'job' : 'jobs'} found
                    {keyword && (
                      <>
                        {' '}for{' '}
                        <span className="font-semibold text-[#333333]">"{keyword}"</span>
                      </>
                    )}
                    {location && (
                      <>
                        {' '}in{' '}
                        <span className="font-semibold text-[#333333]">{location}</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#666666] hidden sm:inline">Sort by:</span>
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="border border-[#e0e0e0] rounded-lg px-3 py-1.5 text-sm text-[#333333] bg-white focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] cursor-pointer"
                >
                  <option value="">Relevance</option>
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="-salary_max">Highest Salary</option>
                  <option value="salary_min">Lowest Salary</option>
                </select>
              </div>
            </div>

            {/* ── Job list ──────────────────────────────────────────────── */}
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#e0e0e0]">
                <p className="text-gray-500 text-sm mb-4">Something went wrong loading jobs. Please try again.</p>
                <button type="button" onClick={() => window.location.reload()} className="cursor-pointer rounded-lg bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
                  Retry
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <NoJobsFound keyword={keyword} onClear={clearAllFilters} />
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {!isLoading && totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filters drawer ────────────────────────────────────────── */}
      {showMobileFilters && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Job filters"
            className="fixed inset-y-0 left-0 z-50 w-[300px] bg-white shadow-2xl overflow-y-auto lg:hidden flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e0e0] bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1a1a2e]">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2563eb] text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                    className="text-xs font-semibold text-[#2563eb] hover:text-blue-800 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto p-4">
              <JobFilters
                filters={filters}
                onChange={(updated) => {
                  handleFiltersChange(updated);
                  setShowMobileFilters(false);
                }}
                className="border-0 shadow-none rounded-none"
              />
            </div>

            {/* Apply button */}
            <div className="sticky bottom-0 p-4 border-t border-[#e0e0e0] bg-white">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-lg bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              >
                Show {totalCount.toLocaleString('en-IN')} Jobs
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
