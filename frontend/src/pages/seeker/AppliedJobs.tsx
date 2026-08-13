import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, ExternalLink } from 'lucide-react';
import { getMyApplications } from '../../api/applications';
import StatusBadge from '../../components/ui/StatusBadge';
import { getInitials } from '../../lib/utils';

type FilterTab = 'ALL' | 'applied' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interviewed', label: 'Interviewed' },
  { key: 'offered', label: 'Offered' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AppliedJobs() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications({ page_size: 50 }),
    staleTime: 30 * 1000,
  });

  const allApplications = data?.results ?? [];
  const applications = activeTab === 'ALL'
    ? allApplications
    : allApplications.filter((app) => (app.status as string) === activeTab);

  const renderApplicationsContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">No applications found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            {activeTab === 'ALL'
              ? "You haven't applied to any jobs yet. Start exploring!"
              : `No ${activeTab.toLowerCase().replace('_', ' ')} applications.`}
          </p>
          <Link
            to="/jobs"
            className="bg-[#2563eb] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            Browse Jobs
          </Link>
        </div>
      );
    }

    return (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs text-gray-500 font-semibold">
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Job Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                        {app.job?.company?.logo_url ? (
                          <img src={app.job.company.logo_url} alt="" className="w-full h-full object-contain" />
                        ) : (
                          getInitials(app.job?.company?.name ?? '?')
                        )}
                      </div>
                      <span className="font-medium text-[#1a1a2e] max-w-[120px] truncate">
                        {app.job?.company?.name ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#1a1a2e] max-w-[200px] truncate">
                    {app.job?.title ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/jobs/${app.job_id ?? app.job?.id}`}
                      className="inline-flex items-center gap-1.5 text-[#2563eb] hover:underline text-sm font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Job
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {applications.map((app) => (
            <div key={app.id} className="p-4 flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                {app.job?.company?.logo_url ? (
                  <img src={app.job.company.logo_url} alt="" className="w-full h-full object-contain" />
                ) : (
                  getInitials(app.job?.company?.name ?? '?')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a1a2e] truncate">{app.job?.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{app.job?.company?.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={app.status} />
                </div>
              </div>
              <Link to={`/jobs/${app.job_id ?? app.job?.id}`} className="text-[#2563eb] text-xs hover:underline whitespace-nowrap mt-1">
                View
              </Link>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Applied Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">Track all your job applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white rounded-xl border border-gray-200 p-2">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-[#2563eb] text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {renderApplicationsContent()}
      </div>

      {/* Count */}
      {!isLoading && applications.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          Showing {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          {data?.count && data.count > applications.length && ` of ${data.count}`}
        </p>
      )}
    </div>
  );
}
