import { useState, KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, ChevronLeft } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import SkillTag from '../../components/ui/SkillTag';
import { createJob, updateJob, getJobById } from '../../api/jobs';
import { getEmployerDashboard } from '../../api/dashboard';
import { cn } from '../../lib/utils';
import { JobType } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'IT & Software',
  'Finance & Banking',
  'Marketing',
  'Healthcare',
  'Engineering',
  'Education',
  'Sales',
  'Design',
  'HR',
  'Operations',
  'Legal',
  'Other',
];

const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: 'Full-time', value: JobType.FULL_TIME },
  { label: 'Part-time', value: JobType.PART_TIME },
  { label: 'Contract', value: JobType.CONTRACT },
  { label: 'Internship', value: JobType.INTERNSHIP },
];

const EXP_YEARS = Array.from({ length: 21 }, (_, i) => i);

// ─── Schema ───────────────────────────────────────────────────────────────────

const jobSchema = z
  .object({
    title: z.string().min(3, { message: 'Job title must be at least 3 characters.' }),
    category: z.string().min(1, { message: 'Please select a category.' }),
    job_type: z.enum([
      JobType.FULL_TIME,
      JobType.PART_TIME,
      JobType.CONTRACT,
      JobType.INTERNSHIP,
      JobType.FREELANCE,
      JobType.TEMPORARY,
    ]),
    description: z.string().min(100, { message: 'Description must be at least 100 characters.' }),
    location: z.string().min(2, { message: 'Location is required.' }),
    is_remote: z.boolean(),
    openings: z.coerce.number().int().min(1, { message: 'At least 1 opening required.' }).optional(),
    application_deadline: z.string().optional(),
    experience_min: z.coerce.number().int().min(0).max(20),
    experience_max: z.coerce.number().int().min(0).max(20),
    disclose_salary: z.boolean(),
    salary_min: z.coerce.number().min(0).optional().or(z.literal('')),
    salary_max: z.coerce.number().min(0).optional().or(z.literal('')),
  })
  .refine(
    (d) => d.experience_max === 0 || d.experience_max >= d.experience_min,
    {
      message: 'Max experience must be >= min experience.',
      path: ['experience_max'],
    },
  );

type JobFormValues = z.infer<typeof jobSchema>;

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionHeader({ number, title }: Readonly<{ number: number; title: string }>) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f0f0f0] pb-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white">
        {number}
      </span>
      <h2 className="text-base font-semibold text-[#1a1a2e]">{title}</h2>
    </div>
  );
}

function FieldError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

const inputCls = (hasError?: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition',
    hasError
      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
      : 'border-[#e0e0e0] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',
  );

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Fetch company info for company_id
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: getEmployerDashboard,
  });

  // Fetch existing job data when editing
  const { isLoading: jobLoading } = useQuery({
    queryKey: ['job', editId],
    queryFn: () => getJobById(editId!),
    enabled: Boolean(editId),
    onSuccess: (job: any) => {
      reset({
        title: job.title,
        category: job.category ?? '',
        job_type: job.job_type,
        description: job.description,
        location: job.location,
        is_remote: job.is_remote,
        openings: undefined,
        application_deadline: job.application_deadline
          ? job.application_deadline.split('T')[0]
          : '',
        experience_min: job.experience_min ?? 0,
        experience_max: job.experience_max ?? 0,
        disclose_salary: !(job.salary_min == null && job.salary_max == null),
        salary_min: job.salary_min ?? '',
        salary_max: job.salary_max ?? '',
      });
      if (job.skills_required?.length) {
        setSkills(job.skills_required.map((s: any) => s.name));
      }
    },
  } as any);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      job_type: JobType.FULL_TIME,
      is_remote: false,
      experience_min: 0,
      experience_max: 0,
      disclose_salary: true,
      openings: 1,
    },
  });

  const descriptionValue = watch('description') ?? '';
  const discloseSalary = watch('disclose_salary');

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job posted successfully!');
      navigate('/dashboard/jobs');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to post job. Please try again.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job updated successfully!');
      navigate('/dashboard/jobs');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to update job.';
      toast.error(msg);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleAddSkill = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, '').trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
    if (e.key === 'Backspace' && skillInput === '' && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  const onSubmit = (values: JobFormValues, isDraft = false) => {
    const companyId = dashData?.company?.id;
    if (!companyId) {
      toast.error('Company profile not found. Please complete your company profile first.');
      return;
    }

    const payload = {
      title: values.title,
      company_id: companyId,
      category: values.category,
      job_type: values.job_type,
      description: values.description,
      location: values.location,
      is_remote: values.is_remote,
      experience_min: values.experience_min,
      experience_max: values.experience_max || undefined,
      salary_min:
        values.disclose_salary && values.salary_min !== ''
          ? Number(values.salary_min) * 100000
          : undefined,
      salary_max:
        values.disclose_salary && values.salary_max !== ''
          ? Number(values.salary_max) * 100000
          : undefined,
      skills_required: skills,
      application_deadline: values.application_deadline || undefined,
      is_active: !isDraft,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (dashLoading || jobLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderSubmitButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {editId ? 'Saving…' : 'Posting…'}
        </>
      );
    }
    return editId ? 'Save Changes' : 'Post Job';
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] text-gray-500 transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {editId ? 'Edit Job' : 'Post a New Job'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Fill in the details below to {editId ? 'update your' : 'publish a'} job listing.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((v) => onSubmit(v, false))}
        noValidate
        className="space-y-8"
      >
        {/* ── Section 1: Basic Info ── */}
        <div className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-sm space-y-5">
          <SectionHeader number={1} title="Basic Information" />

          {/* Job Title */}
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
              Job Title <span className="text-[#2563eb]">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Senior React Developer"
              {...register('title')}
              className={inputCls(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
              Category <span className="text-[#2563eb]">*</span>
            </label>
            <select
              id="category"
              {...register('category')}
              className={inputCls(Boolean(errors.category))}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <FieldError message={errors.category?.message} />
          </div>

          {/* Job Type */}
          <div>
            <p className="mb-2 text-sm font-medium text-[#1a1a2e]">
              Job Type <span className="text-[#2563eb]">*</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {JOB_TYPES.map(({ label, value }) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    {...register('job_type')}
                    className="peer sr-only"
                  />
                  <span className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors peer-checked:border-[#2563eb] peer-checked:bg-teal-50 peer-checked:text-[#2563eb] border-[#e0e0e0] text-gray-600 hover:border-[#2563eb]/50">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <FieldError message={errors.job_type?.message} />
          </div>
        </div>

        {/* ── Section 2: Details ── */}
        <div className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-sm space-y-5">
          <SectionHeader number={2} title="Job Details" />

          {/* Description */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-medium text-[#1a1a2e]">
                Job Description <span className="text-[#2563eb]">*</span>
              </label>
              <span
                className={cn(
                  'text-xs',
                  descriptionValue.length < 100 ? 'text-red-400' : 'text-gray-400',
                )}
              >
                {descriptionValue.length} / 100 min chars
              </span>
            </div>
            <textarea
              id="description"
              rows={7}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              {...register('description')}
              className={cn(inputCls(Boolean(errors.description)), 'resize-y')}
            />
            <FieldError message={errors.description?.message} />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
              Location <span className="text-[#2563eb]">*</span>
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Bangalore, India"
              {...register('location')}
              className={inputCls(Boolean(errors.location))}
            />
            <FieldError message={errors.location?.message} />
          </div>

          {/* Remote checkbox */}
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#1a1a2e]">
            <input
              type="checkbox"
              {...register('is_remote')}
              className="h-4 w-4 rounded border-[#e0e0e0] accent-[#2563eb]"
            />{' '}
            Also open to remote
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Number of Openings */}
            <div>
              <label htmlFor="openings" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                Number of Openings
              </label>
              <input
                id="openings"
                type="number"
                min={1}
                placeholder="1"
                {...register('openings')}
                className={inputCls(Boolean(errors.openings))}
              />
              <FieldError message={errors.openings?.message} />
            </div>

            {/* Application Deadline */}
            <div>
              <label htmlFor="application_deadline" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                Application Deadline
              </label>
              <input
                id="application_deadline"
                type="date"
                {...register('application_deadline')}
                className={inputCls(false)}
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Requirements ── */}
        <div className="rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-sm space-y-5">
          <SectionHeader number={3} title="Requirements" />

          {/* Experience */}
          <div>
            <p className="mb-2 text-sm font-medium text-[#1a1a2e]">Experience (Years)</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="exp_min" className="mb-1 block text-xs text-gray-500">
                  Minimum
                </label>
                <select
                  id="exp_min"
                  {...register('experience_min')}
                  className={inputCls(Boolean(errors.experience_min))}
                >
                  {EXP_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y} yr{y !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <span className="mt-5 text-gray-400">—</span>
              <div className="flex-1">
                <label htmlFor="exp_max" className="mb-1 block text-xs text-gray-500">
                  Maximum
                </label>
                <select
                  id="exp_max"
                  {...register('experience_max')}
                  className={inputCls(Boolean(errors.experience_max))}
                >
                  <option value={0}>Any</option>
                  {EXP_YEARS.filter((y) => y > 0).map((y) => (
                    <option key={y} value={y}>
                      {y} yr{y !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.experience_max?.message} />
              </div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <Controller
              control={control}
              name="disclose_salary"
              render={({ field }) => (
                <label className="mb-3 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#1a1a2e]">
                  <input
                    type="checkbox"
                    checked={!field.value}
                    onChange={(e) => field.onChange(!e.target.checked)}
                    className="h-4 w-4 rounded border-[#e0e0e0] accent-[#2563eb]"
                  />{' '}
                  Don't disclose salary
                </label>
              )}
            />

            {discloseSalary && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salary_min" className="mb-1 block text-xs text-gray-500">
                    Min Salary (LPA)
                  </label>
                  <input
                    id="salary_min"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    {...register('salary_min')}
                    className={inputCls(Boolean(errors.salary_min))}
                  />
                  <FieldError message={errors.salary_min?.message as string} />
                </div>
                <div>
                  <label htmlFor="salary_max" className="mb-1 block text-xs text-gray-500">
                    Max Salary (LPA)
                  </label>
                  <input
                    id="salary_max"
                    type="number"
                    min={0}
                    placeholder="e.g. 12"
                    {...register('salary_max')}
                    className={inputCls(Boolean(errors.salary_max))}
                  />
                  <FieldError message={errors.salary_max?.message as string} />
                </div>
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <label htmlFor="skills_input" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
              Required Skills
            </label>
            <p className="mb-2 text-xs text-gray-400">
              Type a skill and press Enter or comma to add it.
            </p>
            <div
              className={cn(
                'flex min-h-[48px] flex-wrap gap-2 rounded-lg border px-3 py-2 transition',
                'border-[#e0e0e0] focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]',
              )}
            >
              {skills.map((skill) => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  removable
                  onRemove={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                />
              ))}
              <input
                id="skills_input"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => skillInput.trim() && handleAddSkill(skillInput)}
                placeholder={skills.length === 0 ? 'e.g. React, Node.js, Python' : ''}
                className="min-w-[140px] flex-1 bg-transparent text-sm text-[#1a1a2e] placeholder-gray-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── Section 4: Actions ── */}
        <div className="flex flex-wrap items-center justify-end gap-4 rounded-xl border border-[#e0e0e0] bg-white px-6 py-5 shadow-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-[#e0e0e0] px-6 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((v) => onSubmit(v, true))}
            className="rounded-lg border border-[#1a1a2e] px-6 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {renderSubmitButtonContent()}
          </button>
        </div>
      </form>
    </div>
  );
}
