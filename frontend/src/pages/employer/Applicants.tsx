import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ExternalLink,
  Users,
  Clock,
  Gift,
  XCircle,
  Star,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import SkillTag from '../../components/ui/SkillTag';
import { getJobApplicants, updateApplicationStatus } from '../../api/applications';
import { getJobById } from '../../api/jobs';
import { cn, formatRelativeDate, getInitials } from '../../lib/utils';
import { ApplicationStatus } from '../../types';
import type { Application } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

type StatusFilter =
  | 'ALL'
  | ApplicationStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: ApplicationStatus.PENDING, label: 'Applied' },
  { key: ApplicationStatus.SHORTLISTED, label: 'Shortlisted' },
  { key: ApplicationStatus.INTERVIEW_SCHEDULED, label: 'Interviewed' },
  { key: ApplicationStatus.OFFERED, label: 'Offered' },
  { key: ApplicationStatus.REJECTED, label: 'Rejected' },
];

const ALL_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: ApplicationStatus.PENDING, label: 'Applied' },
  { value: ApplicationStatus.REVIEWING, label: 'Reviewing' },
  { value: ApplicationStatus.SHORTLISTED, label: 'Shortlisted' },
  { value: ApplicationStatus.INTERVIEW_SCHEDULED, label: 'Interview Scheduled' },
  { value: ApplicationStatus.OFFERED, label: 'Offered' },
  { value: ApplicationStatus.HIRED, label: 'Hired' },
  { value: ApplicationStatus.REJECTED, label: 'Rejected' },
];

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-amber-600',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-600',
];

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({
  label,
  count,
  icon,
  colorClass,
}: Readonly<{
  label: string;
  count: number;
  icon: React.ReactNode;
  colorClass: string;
}>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-4 py-3 shadow-sm">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colorClass)}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-[#1a1a2e]">{count}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ─── Applicant Card ───────────────────────────────────────────────────────────

interface ApplicantCardProps {
  application: Application;
  index: number;
  onStatusChange: (appId: string, status: ApplicationStatus) => void;
  isUpdating: boolean;
}

function ApplicantCard({
  application,
  index,
  onStatusChange,
  isUpdating,
}: Readonly<ApplicantCardProps>) {
  const applicant = application.applicant;
  const fullName = applicant
    ? `${applicant.first_name} ${applicant.last_name}`.trim()
    : 'Unknown';
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  // Pull skills from the application's job skills (proxy for applicant skills)
  const skills: string[] = [];

  const canShortlist =
    application.status !== ApplicationStatus.SHORTLISTED &&
    application.status !== ApplicationStatus.REJECTED;
  const canReject = application.status !== ApplicationStatus.REJECTED;

  return (
    <div
      className={cn(
        'rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm transition-opacity',
        isUpdating && 'opacity-60 pointer-events-none',
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          aria-hidden="true"
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white',
            avatarColor,
          )}
        >
          {getInitials(fullName)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-[#1a1a2e]">{fullName}</p>
              <p className="text-xs text-gray-400">
                Applied {formatRelativeDate(application.created_at)}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((s) => (
                <SkillTag key={s} skill={s} />
              ))}
              {skills.length > 4 && (
                <span className="text-xs text-gray-400">+{skills.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f5f5f5] pt-3">
        {/* Status change dropdown */}
        <select
          value={application.status}
          onChange={(e) =>
            onStatusChange(application.id, e.target.value as ApplicationStatus)
          }
          disabled={isUpdating}
          aria-label="Change applicant status"
          className="flex-1 rounded-lg border border-[#e0e0e0] px-2.5 py-1.5 text-xs font-medium text-[#1a1a2e] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
        >
          {ALL_STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* View Resume */}
        {application.resume_url ? (
          <a
            href={application.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-xs font-medium text-[#1a1a2e] transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Resume
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-xs font-medium text-gray-300"
            title="No resume uploaded"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Resume
          </button>
        )}

        {/* Quick: Shortlist */}
        {canShortlist && (
          <button
            type="button"
            onClick={() =>
              onStatusChange(application.id, ApplicationStatus.SHORTLISTED)
            }
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-[#2563eb] transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star className="h-3.5 w-3.5" />
            Shortlist
          </button>
        )}

        {/* Quick: Reject */}
        {canReject && (
          <button
            type="button"
            onClick={() =>
              onStatusChange(application.id, ApplicationStatus.REJECTED)
            }
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId!),
    enabled: Boolean(jobId),
  });

  // Fetch applicants
  const { data, isLoading: appsLoading, isError } = useQuery({
    queryKey: ['applicants', jobId],
    queryFn: () => getJobApplicants(jobId!, { page_size: 100 }),
    enabled: Boolean(jobId),
  });

  const applications: Application[] = data?.results ?? [];

  // Derived stats
  const stats = {
    total: applications.length,
    shortlisted: applications.filter(
      (a) => a.status === ApplicationStatus.SHORTLISTED,
    ).length,
    interviewed: applications.filter(
      (a) => a.status === ApplicationStatus.INTERVIEW_SCHEDULED,
    ).length,
    offered: applications.filter((a) => a.status === ApplicationStatus.OFFERED).length,
    rejected: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
  };

  // Filtered list
  const filtered =
    statusFilter === 'ALL'
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  // Status update mutation with optimistic update
  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: ApplicationStatus }) =>
      updateApplicationStatus(appId, status),
    onMutate: ({ appId, status }) => {
      setUpdatingId(appId);
      // Optimistic update
      queryClient.setQueryData(['applicants', jobId], (prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((a: Application) =>
            a.id === appId ? { ...a, status } : a,
          ),
        };
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['applicants', jobId], (prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((a: Application) =>
            a.id === updated.id ? updated : a,
          ),
        };
      });
      toast.success('Applicant status updated.');
    },
    onError: (_err, { appId }) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['applicants', jobId] });
      toast.error('Failed to update status.');
      setUpdatingId(null);
    },
    onSettled: () => setUpdatingId(null),
  });

  const isLoading = jobLoading || appsLoading;

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
        <Users className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">Failed to load applicants. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e0e0e0] text-gray-500 transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e] sm:text-2xl">
            Applicants for{' '}
            <span className="text-[#2563eb]">{job?.title ?? 'this job'}</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {job?.company?.name ?? ''} · {job?.location ?? ''}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatChip
          label="Total"
          count={stats.total}
          icon={<Users className="h-4 w-4 text-blue-600" />}
          colorClass="bg-blue-50"
        />
        <StatChip
          label="Shortlisted"
          count={stats.shortlisted}
          icon={<Star className="h-4 w-4 text-[#2563eb]" />}
          colorClass="bg-teal-50"
        />
        <StatChip
          label="Interviewed"
          count={stats.interviewed}
          icon={<Clock className="h-4 w-4 text-blue-600" />}
          colorClass="bg-blue-50"
        />
        <StatChip
          label="Offered"
          count={stats.offered}
          icon={<Gift className="h-4 w-4 text-green-600" />}
          colorClass="bg-green-50"
        />
        <StatChip
          label="Rejected"
          count={stats.rejected}
          icon={<XCircle className="h-4 w-4 text-red-400" />}
          colorClass="bg-red-50"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[#e0e0e0] bg-white p-1 shadow-sm">
        {STATUS_FILTERS.map(({ key, label }) => {
          const count =
            key === 'ALL'
              ? applications.length
              : applications.filter((a) => a.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                statusFilter === key
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#f5f5f5]',
              )}
            >
              {label}
              <span
                className={cn(
                  'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs',
                  statusFilter === key
                    ? 'bg-white/20 text-white'
                    : 'bg-[#f5f5f5] text-gray-500',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applicant cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title={
            statusFilter === 'ALL'
              ? 'No applicants yet'
              : `No ${statusFilter.toLowerCase().replace('_', ' ')} applicants`
          }
          description={
            statusFilter === 'ALL'
              ? 'Share the job link to start receiving applications.'
              : 'No applicants match this filter yet.'
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((app, i) => (
            <ApplicantCard
              key={app.id}
              application={app}
              index={i}
              onStatusChange={(appId, status) =>
                statusMutation.mutate({ appId, status })
              }
              isUpdating={updatingId === app.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
