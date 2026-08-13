import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Bookmark, Eye, TrendingUp, ArrowRight } from 'lucide-react';
import { getSeekerDashboard } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import ProfileProgress from '../../components/ui/ProfileProgress';
import JobCard from '../../components/jobs/JobCard';
import { formatRelativeDate } from '../../lib/utils';

export default function SeekerDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['seeker-dashboard'],
    queryFn: getSeekerDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const stats = [
    {
      label: 'Total Applications',
      value: data?.total_applications ?? 0,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      link: '/dashboard/applied',
    },
    {
      label: 'Shortlisted',
      value: data?.shortlisted_applications ?? 0,
      icon: TrendingUp,
      color: 'bg-teal-50 text-[#2563eb]',
      border: 'border-teal-100',
      link: '/dashboard/applied?status=shortlisted',
    },
    {
      label: 'Saved Jobs',
      value: data?.saved_jobs_count ?? 0,
      icon: Bookmark,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-100',
      link: '/dashboard/saved',
    },
    {
      label: 'Profile Views',
      value: 0,
      icon: Eye,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">
          Welcome back, {user?.first_name ?? 'User'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              {isLoading ? (
                <div className="h-7 bg-gray-200 rounded w-12 animate-pulse mb-1" />
              ) : (
                <div className="text-2xl font-extrabold text-[#1a1a2e]">{stat.value}</div>
              )}
              <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
            </>
          );

          if (stat.link) {
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className={`bg-white rounded-xl border ${stat.border} p-5 block hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm`}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border ${stat.border} p-5 shadow-sm`}
            >
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-[#1a1a2e] mb-4">Profile Completion</h2>
          <ProfileProgress percentage={data?.profile_completion_percentage ?? 0} />
          <div className="mt-5 space-y-2 text-sm text-gray-600">
            {[
              { label: 'Add work experience', done: false },
              { label: 'Upload resume', done: false },
              { label: 'Add skills', done: true },
              { label: 'Verify email', done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {item.done ? '✓' : '–'}
                </span>
                <span className={item.done ? 'line-through text-gray-400' : ''}>{item.label}</span>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/profile"
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Complete Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1a1a2e]">Recent Applications</h2>
            <Link to="/dashboard/applied" className="text-sm text-[#2563eb] hover:underline font-medium">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !data?.recent_applications?.length ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No applications yet. <Link to="/jobs" className="text-[#2563eb] hover:underline">Find jobs</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Job Title</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recent_applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-[#1a1a2e] max-w-[140px] truncate">
                        <Link to={`/jobs/${app.job_id ?? app.job?.id}`} className="hover:text-[#2563eb]">
                          {app.job?.title ?? '—'}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-gray-600 max-w-[120px] truncate">
                        {app.job?.company?.name ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {formatRelativeDate(app.applied_at ?? app.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Jobs */}
      {(data?.recommended_jobs?.length ?? 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1a1a2e] text-lg">Recommended for You</h2>
            <Link to="/jobs" className="text-sm text-[#2563eb] hover:underline font-medium">
              Browse All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data!.recommended_jobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
