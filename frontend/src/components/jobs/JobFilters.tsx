import { type ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { JobType } from '../../types';
import type { JobSearchParams } from '../../types';
import { getCategories } from '../../api/jobs';

interface JobFiltersProps {
  /** Current active filter state. */
  filters: JobSearchParams;
  /** Called immediately on any filter change. */
  onChange: (updated: JobSearchParams) => void;
  className?: string;
}

const JOB_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Full-time', value: JobType.FULL_TIME },
  { label: 'Part-time', value: JobType.PART_TIME },
  { label: 'Contract', value: JobType.CONTRACT },
  { label: 'Internship', value: JobType.INTERNSHIP },
  { label: 'Freelance', value: JobType.FREELANCE },
  { label: 'Remote', value: 'REMOTE' },
];


const DATE_POSTED_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 3 days', value: '3' },
  { label: 'Last week', value: '7' },
  { label: 'Last month', value: '30' },
];

// ── Collapsible section wrapper ──────────────────────────────────────────────

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#e0e0e0] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-[#1a1a2e] transition-colors hover:text-[#2563eb]"
        aria-expanded={open}
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && <div className="mb-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function JobFilters({ filters, onChange, className }: JobFiltersProps) {
  const { data: categoryData } = useQuery({
    queryKey: ['job-categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
  
  const dynamicCategories = categoryData?.map(c => (c as any).category || c.name) || [];

  const update = (patch: Partial<JobSearchParams>) =>
    onChange({ ...filters, ...patch, page: 1 });

  const handleJobTypeChange = (value: string, checked: boolean) => {
    if (value === 'REMOTE') {
      update({ is_remote: checked ? true : undefined });
      return;
    }
    update({ job_type: checked ? (value as JobType) : undefined });
  };

  const handleClearAll = () => {
    onChange({
      q: filters.q,
      page: 1,
      page_size: filters.page_size,
    });
  };

  const hasActiveFilters = Boolean(
    filters.job_type ||
      filters.is_remote ||
      filters.salary_min ||
      filters.salary_max ||
      filters.experience_min != null ||
      filters.experience_max != null ||
      filters.category ||
      filters.location,
  );

  return (
    <aside
      className={cn(
        'w-full rounded-xl border border-[#e0e0e0] bg-white px-5 py-4',
        className,
      )}
      aria-label="Job filters"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1a1a2e]">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-medium text-[#2563eb] transition-opacity hover:opacity-75"
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Job Type */}
      <FilterSection title="Job Type">
        {JOB_TYPE_OPTIONS.map(({ label, value }) => {
          const checked =
            value === 'REMOTE' ? !!filters.is_remote : filters.job_type === value;
          return (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 hover:text-[#1a1a2e]"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => handleJobTypeChange(value, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#2563eb]"
              />
              {label}
            </label>
          );
        })}
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience (years)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={50}
            placeholder="Min"
            value={filters.experience_min ?? ''}
            onChange={(e) =>
              update({
                experience_min: e.target.value !== '' ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
          />
          <span className="shrink-0 text-xs text-gray-400">to</span>
          <input
            type="number"
            min={0}
            max={50}
            placeholder="Max"
            value={filters.experience_max ?? ''}
            onChange={(e) =>
              update({
                experience_max: e.target.value !== '' ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
          />
        </div>
      </FilterSection>

      {/* Salary */}
      <FilterSection title="Salary (LPA)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={
              filters.salary_min != null ? Math.round(filters.salary_min / 100_000) : ''
            }
            onChange={(e) =>
              update({
                salary_min: e.target.value !== '' ? Number(e.target.value) * 100_000 : undefined,
              })
            }
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
          />
          <span className="shrink-0 text-xs text-gray-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={
              filters.salary_max != null ? Math.round(filters.salary_max / 100_000) : ''
            }
            onChange={(e) =>
              update({
                salary_max: e.target.value !== '' ? Number(e.target.value) * 100_000 : undefined,
              })
            }
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
          />
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location">
        <input
          type="text"
          placeholder="e.g. Bangalore"
          value={filters.location ?? ''}
          onChange={(e) => update({ location: e.target.value || undefined })}
          className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
        />
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <select
          value={filters.category ?? ''}
          onChange={(e) => update({ category: e.target.value || undefined })}
          className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#1a1a2e] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
        >
          <option value="">All Categories</option>
          {dynamicCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Date Posted */}
      <FilterSection title="Date Posted" defaultOpen={false}>
        {DATE_POSTED_OPTIONS.map(({ label, value }) => {
          // We encode date_posted as ordering param with a days-ago prefix
          const currentVal = filters.ordering ?? '';
          const selected = currentVal === value;
          return (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 hover:text-[#1a1a2e]"
            >
              <input
                type="radio"
                name="date_posted"
                checked={selected}
                onChange={() => update({ ordering: value || undefined })}
                className="h-4 w-4 accent-[#2563eb]"
              />
              {label}
            </label>
          );
        })}
      </FilterSection>
    </aside>
  );
}
