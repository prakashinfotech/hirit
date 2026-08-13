import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Heart, MapPin } from 'lucide-react';
import {
  cn,
  formatRelativeDate,
  formatSalary,
  getExperienceLabel,
  getInitials,
  toTitleCase,
} from '../../lib/utils';
import type { Job } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavedJobs, saveJob, unsaveJob } from '../../api/jobs';
import { getMyApplications } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import SkillTag from '../ui/SkillTag';

interface JobCardProps {
  /** The job object to display. */
  job: Job;
  /** Whether to show the save/heart button. Defaults to true. */
  showSaveButton?: boolean;
  /** Whether this job is already saved. */
  isSaved?: boolean;
  /** Callback when the save button is clicked. Receives jobId and the desired saved state. */
  onSave?: (jobId: string, saved: boolean) => void;
  /** Optional class overrides. */
  className?: string;
}

const JOB_TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-green-100 text-green-700',
  'part-time': 'bg-blue-100 text-blue-700',
  'contract': 'bg-blue-100 text-blue-700',
  'internship': 'bg-yellow-100 text-yellow-700',
  'freelance': 'bg-pink-100 text-pink-700',
  'temporary': 'bg-gray-100 text-gray-600',
};

export default function JobCard({
  job,
  showSaveButton = true,
  isSaved = false,
  onSave,
  className,
}: JobCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedJobs } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: getSavedJobs,
    enabled: isAuthenticated && showSaveButton && onSave === undefined,
    staleTime: 5 * 60 * 1000,
  });

  const { data: myApplications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications({ page_size: 100 }),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const [localSaved, setLocalSaved] = useState<boolean | null>(null);

  const derivedSaved = savedJobs?.some(sj => sj.job?.id === job.id) ?? false;
  const hasApplied = myApplications?.results?.some(app => app.job_id === job.id) ?? false;
  const isActuallySaved = onSave !== undefined 
    ? isSaved 
    : (localSaved !== null ? localSaved : derivedSaved);

  const saveMutation = useMutation({
    mutationFn: (id: string) => saveJob(id),
    onSuccess: () => {
      setLocalSaved(true);
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (id: string) => unsaveJob(id),
    onSuccess: () => {
      setLocalSaved(false);
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });

  const salaryText =
    job.salary_min || job.salary_max
      ? formatSalary(job.salary_min, job.salary_max, job.salary_currency ?? 'INR')
      : null;

  const expLabel =
    job.experience_min != null || job.experience_max != null
      ? getExperienceLabel(job.experience_min, job.experience_max)
      : null;

  const companyInitials = getInitials(job.company?.name ?? '');
  const displayedSkills = (job.skills_required ?? []).slice(0, 3);
  const extraSkillsCount = (job.skills_required?.length ?? 0) - 3;

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    navigate(`/jobs/${job.id}`);
  };

  const handleSaveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onSave !== undefined) {
      onSave(job.id, !isActuallySaved);
    } else {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      if (isActuallySaved) {
        unsaveMutation.mutate(job.id);
      } else {
        saveMutation.mutate(job.id);
      }
    }
  };

  return (
    <div
      role="article"
      onClick={handleCardClick}
      className={cn(
        'group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-teal-200',
        className,
      )}
    >
      {/* Top row: company logo + name + save button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {job.company?.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={job.company.name}
              className="h-11 w-11 flex-shrink-0 rounded-full border border-[#e0e0e0] object-contain"
            />
          ) : (
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-sm font-bold text-white">
              {companyInitials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-700">
              {job.company?.name}
            </p>
            {job.company?.is_verified && (
              <span className="text-xs font-medium text-blue-500">Verified</span>
            )}
          </div>
        </div>

        {showSaveButton && (
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label={isActuallySaved ? 'Unsave job' : 'Save job'}
            className={cn(
              'flex-shrink-0 cursor-pointer rounded-full p-1.5 transition-colors hover:bg-teal-50',
              isActuallySaved ? 'text-[#2563eb]' : 'text-gray-300 hover:text-[#2563eb]',
            )}
          >
            <Heart
              className="h-5 w-5"
              fill={isActuallySaved ? 'currentColor' : 'none'}
            />
          </button>
        )}
      </div>

      {/* Job title */}
      <Link
        to={`/jobs/${job.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-lg font-semibold leading-snug text-[#1a1a2e] transition-colors group-hover:text-[#2563eb]"
      >
        {job.title}
        {job.is_featured && (
          <span className="ml-2 rounded-full border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-xs font-medium text-[#2563eb]">
            Featured
          </span>
        )}
      </Link>

      {/* Location + job type */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="flex items-center gap-1 text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {job.location}
          {job.is_remote && (
            <span className="ml-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700">
              Remote
            </span>
          )}
        </span>

        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            JOB_TYPE_COLORS[job.job_type] ?? 'bg-gray-100 text-gray-600',
          )}
        >
          <Briefcase className="h-3 w-3" />
          {toTitleCase(job.job_type)}
        </span>
      </div>

      {/* Salary + experience */}
      {(salaryText || expLabel) && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {salaryText && (
            <span className="font-semibold text-green-700">{salaryText} p.a.</span>
          )}
          {expLabel && (
            <span className="rounded-full border border-[#e0e0e0] px-2 py-0.5 text-xs text-gray-600">
              {expLabel}
            </span>
          )}
        </div>
      )}

      {/* Skill tags */}
      {displayedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {displayedSkills.map((skill) => (
            <SkillTag key={skill.id} skill={skill.name} />
          ))}
          {extraSkillsCount > 0 && (
            <span className="rounded-full border border-[#e0e0e0] px-2 py-0.5 text-xs text-gray-500">
              +{extraSkillsCount} more
            </span>
          )}
        </div>
      )}

      {/* Footer: posted time + apply */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">
          Posted {formatRelativeDate(job.created_at)}
        </span>
        {hasApplied ? (
          <span className="rounded-md bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-500 cursor-not-allowed">
            Applied
          </span>
        ) : (
          <Link
            to={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer rounded-md bg-[#2563eb] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}
