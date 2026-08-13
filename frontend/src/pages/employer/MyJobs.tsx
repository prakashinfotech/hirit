import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PlusCircle,
  MoreVertical,
  Edit2,
  Users,
  XCircle,
  Trash2,
  Briefcase,
  MapPin,
  Calendar,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { getJobs, deleteJob, toggleJobStatus } from '../../api/jobs';
import { cn, formatDate } from '../../lib/utils';
import type { Job } from '../../types';

// ─── Status tab config ────────────────────────────────────────────────────────

type TabKey = 'all' | 'active' | 'draft' | 'closed';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'closed', label: 'Closed' },
];

function matchTab(job: Job, tab: TabKey): boolean {
  if (tab === 'all') return true;
  if (tab === 'active') return job.is_active;
  if (tab === 'draft') return !job.is_active && !job.is_featured;
  if (tab === 'closed') return !job.is_active;
  return true;
}

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

interface ActionsDropdownProps {
  job: Job;
  onEdit: () => void;
  onViewApplicants: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

function ActionsDropdown({
  job,
  onEdit,
  onViewApplicants,
  onToggleStatus,
  onDelete,
  isLoading,
}: Readonly<ActionsDropdownProps>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItem = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    danger?: boolean,
  ) => (
    <button
      type="button"
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      disabled={isLoading}
      className={cn(
        'flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors',
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-[#1a1a2e] hover:bg-[#f5f5f5]',
        isLoading && 'cursor-not-allowed opacity-50',
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e0e0e0] text-gray-500 transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-[#e0e0e0] bg-white shadow-lg">
          <div className="py-1">
            {menuItem('Edit Job', <Edit2 className="h-4 w-4" />, onEdit)}
            {menuItem(
              'View Applicants',
              <Users className="h-4 w-4" />,
              onViewApplicants,
            )}
            {menuItem(
              job.is_active ? 'Close Job' : 'Reopen Job',
              <XCircle className="h-4 w-4" />,
              onToggleStatus,
            )}
            <div className="my-1 border-t border-[#f0f0f0]" />
            {menuItem('Delete', <Trash2 className="h-4 w-4" />, onDelete, true)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  onEdit: () => void;
  onViewApplicants: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  isActionLoading?: boolean;
}

function JobCard({
  job,
  onEdit,
  onViewApplicants,
  onToggleStatus,
  onDelete,
  isActionLoading,
}: Readonly<JobCardProps>) {
  return (
    <div className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[#1a1a2e]">{job.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
              {job.is_remote && ' · Remote OK'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Posted {formatDate(job.created_at)}
            </span>
          </div>
        </div>

        <ActionsDropdown
          job={job}
          onEdit={onEdit}
          onViewApplicants={onViewApplicants}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          isLoading={isActionLoading}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Applicants badge */}
        <button
          type="button"
          onClick={onViewApplicants}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#2563eb] transition-colors hover:bg-teal-100"
        >
          <Users className="h-3.5 w-3.5" />
          {job.applications_count ?? 0} Applicant{job.applications_count !== 1 ? 's' : ''}
        </button>

        {/* Status badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            job.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500',
          )}
        >
          {job.is_active ? 'Active' : 'Closed'}
        </span>

        {job.is_featured && (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
            Featured
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function MyJobsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [page, setPage] = useState(1);
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employer-jobs', page],
    queryFn: () =>
      getJobs({ page, page_size: PAGE_SIZE }),
    keepPreviousData: true,
  } as any);

  const allJobs: Job[] = data?.results ?? [];

  const filteredJobs = allJobs.filter((j) => matchTab(j, activeTab));

  const tabCounts: Record<TabKey, number> = {
    all: allJobs.length,
    active: allJobs.filter((j) => j.is_active).length,
    draft: allJobs.filter((j) => !j.is_active).length,
    closed: allJobs.filter((j) => !j.is_active).length,
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onMutate: (id) => setActionJobId(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['employer-jobs', page], (prev: any) => ({
        ...prev,
        results: prev?.results?.filter((j: Job) => j.id !== id) ?? [],
        count: (prev?.count ?? 1) - 1,
      }));
      toast.success('Job deleted.');
    },
    onError: () => toast.error('Failed to delete job.'),
    onSettled: () => setActionJobId(null),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleJobStatus(id, isActive),
    onMutate: ({ id }) => setActionJobId(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(['employer-jobs', page], (prev: any) => ({
        ...prev,
        results:
          prev?.results?.map((j: Job) => (j.id === updated.id ? updated : j)) ?? [],
      }));
      toast.success(updated.is_active ? 'Job is now active.' : 'Job closed.');
    },
    onError: () => toast.error('Failed to update job status.'),
    onSettled: () => setActionJobId(null),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this job listing? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-center">
        <Briefcase className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">Failed to load jobs. Please refresh.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">My Jobs</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage your job listings and track applicants.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/post-job')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          Post New Job
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#e0e0e0] bg-white p-1 shadow-sm">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActiveTab(key);
              setPage(1);
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              activeTab === key
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#f5f5f5]',
            )}
          >
            {label}
            <span
              className={cn(
                'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs',
                activeTab === key
                  ? 'bg-white/20 text-white'
                  : 'bg-[#f5f5f5] text-gray-500',
              )}
            >
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10" />}
          title={
            activeTab === 'all'
              ? 'No jobs posted yet'
              : `No ${activeTab} jobs`
          }
          description={
            activeTab === 'all'
              ? 'Post your first job to start receiving applicants.'
              : `You don't have any ${activeTab} jobs right now.`
          }
          actionLabel={activeTab === 'all' ? 'Post Your First Job' : undefined}
          onAction={
            activeTab === 'all' ? () => navigate('/dashboard/post-job') : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => navigate(`/dashboard/post-job?edit=${job.id}`)}
              onViewApplicants={() => navigate(`/dashboard/jobs/${job.id}/applicants`)}
              onToggleStatus={() =>
                toggleMutation.mutate({ id: job.id, isActive: !job.is_active })
              }
              onDelete={() => handleDelete(job.id)}
              isActionLoading={actionJobId === job.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(data?.total_pages ?? 0) > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
