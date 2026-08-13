import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle,
  Eye,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { getEmployerDashboard } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { cn, formatDate, formatRelativeDate, getInitials } from '../../lib/utils';
import type { Application, Job } from '../../types';

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  subtitle?: string;
}

function StatCard({ label, value, icon, colorClass, bgClass, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={cn('mt-1 text-3xl font-bold', colorClass)}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', bgClass)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Job Row ───────────────────────────────────────────────────────────

function RecentJobRow({ job }: { job: Job }) {
  return (
    <tr className="border-b border-[#f5f5f5] transition-colors hover:bg-[#fafafa]">
      <td className="py-3 pr-4">
        <p className="text-sm font-semibold text-[#1a1a2e] line-clamp-1">{job.title}</p>
        <p className="text-xs text-gray-400">{job.location}</p>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-teal-100 px-2 text-xs font-semibold text-[#2563eb]">
          {job.applications_count ?? 0}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
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
      </td>
      <td className="py-3 pl-4 text-right">
        <Link
          to={`/employer/jobs/${job.id}/applicants`}
          className="text-xs font-medium text-[#2563eb] transition-opacity hover:opacity-70"
        >
          View Applicants →
        </Link>
      </td>
    </tr>
  );
}

// ─── Applicant Card ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-pink-500',
];

function ApplicantCard({ application, index }: { application: Application; index: number }) {
  const name =
    application.applicant
      ? `${application.applicant.first_name} ${application.applicant.last_name}`.trim()
      : 'Unknown Applicant';
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#f0f0f0] bg-white p-4 shadow-sm">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
          avatarColor,
        )}
        aria-hidden="true"
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#1a1a2e]">{name}</p>
        <p className="truncate text-xs text-gray-400">{application.job?.title ?? '—'}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge status={application.status} />
        <span className="text-xs text-gray-400">
          {formatRelativeDate(application.created_at)}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: getEmployerDashboard,
  });

  const companyName = data?.company?.name ?? user?.first_name ?? 'there';

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
        <TrendingUp className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">
          Failed to load dashboard data. Please refresh the page.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Jobs Posted',
      value: data?.total_jobs_posted ?? 0,
      icon: <Briefcase className="h-6 w-6 text-blue-600" />,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      subtitle: 'All time',
    },
    {
      label: 'Total Applicants',
      value: data?.total_applications_received ?? 0,
      icon: <Users className="h-6 w-6 text-[#2563eb]" />,
      colorClass: 'text-[#2563eb]',
      bgClass: 'bg-teal-50',
      subtitle: `+${data?.new_applications_today ?? 0} today`,
    },
    {
      label: 'Active Jobs',
      value: data?.active_jobs ?? 0,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      subtitle: 'Currently open',
    },
    {
      label: 'Profile Views',
      value: data?.company
        ? data.top_performing_jobs.reduce((sum, j) => sum + (j.views_count ?? 0), 0)
        : 0,
      icon: <Eye className="h-6 w-6 text-blue-600" />,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      subtitle: 'Across all jobs',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1a1a2e] to-[#2d2d4e] px-6 py-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {companyName}!</h1>
          <p className="mt-1 text-sm text-white/70">
            {formatDate(new Date().toISOString())} — Here's what's happening with your jobs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/employer/post-job')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          Post a New Job
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent jobs table */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-[#e0e0e0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
              <h2 className="text-base font-semibold text-[#1a1a2e]">My Recent Jobs</h2>
              <Link
                to="/employer/jobs"
                className="flex items-center gap-1 text-xs font-medium text-[#2563eb] transition-opacity hover:opacity-70"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data?.top_performing_jobs.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No jobs posted yet.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/employer/post-job')}
                  className="font-medium text-[#2563eb] hover:underline"
                >
                  Post your first job
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="border-b border-[#f0f0f0]">
                      <th className="py-2.5 pr-4 pl-5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Job Title
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Applicants
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Status
                      </th>
                      <th className="py-2.5 pl-4 pr-5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.top_performing_jobs.slice(0, 6).map((job) => (
                      <RecentJobRow key={job.id} job={job} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent applicants */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#e0e0e0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
              <h2 className="text-base font-semibold text-[#1a1a2e]">Recent Applicants</h2>
              <Link
                to="/employer/jobs"
                className="flex items-center gap-1 text-xs font-medium text-[#2563eb] transition-opacity hover:opacity-70"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data?.recent_applications.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No applicants yet.
              </div>
            ) : (
              <div className="divide-y divide-[#f5f5f5] px-4 py-2">
                {data?.recent_applications.slice(0, 5).map((app, i) => (
                  <div key={app.id} className="py-2">
                    <ApplicantCard application={app} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
