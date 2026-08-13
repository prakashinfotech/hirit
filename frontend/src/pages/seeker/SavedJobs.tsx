import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSavedJobs, unsaveJob } from '../../api/jobs';
import JobCard from '../../components/jobs/JobCard';

export default function SavedJobs() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => getSavedJobs(),
    staleTime: 30 * 1000,
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => unsaveJob(jobId),
    onSuccess: () => {
      toast.success('Job removed from saved list.');
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: () => toast.error('Failed to remove job.'),
  });

  const savedItems = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Saved Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? '...' : `${savedItems.length} saved jobs`}
          </p>
        </div>
        <Link
          to="/jobs"
          className="text-sm font-semibold text-[#2563eb] border border-teal-200 bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors"
        >
          Browse Jobs
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">No saved jobs yet</h3>
          <p className="text-sm text-gray-500 max-w-xs mb-6">
            Start exploring jobs and save the ones you like. They'll appear here.
          </p>
          <Link
            to="/jobs"
            className="bg-[#2563eb] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div key={item.id} className="relative">
              <JobCard
                job={item.job}
                isSaved
                onSave={() => unsaveMutation.mutate(item.job.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
