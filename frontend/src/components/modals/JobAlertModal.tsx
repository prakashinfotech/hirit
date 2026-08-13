import { type FormEvent, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createJobAlert } from '../../api/alerts';
import { JobType } from '../../types';
import { cn, toTitleCase } from '../../lib/utils';
import Spinner from '../ui/Spinner';

interface JobAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill the keyword field (e.g., from a job search). */
  prefillKeyword?: string;
  /** Pre-fill the location field. */
  prefillLocation?: string;
}

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'DAILY' as const },
  { label: 'Weekly', value: 'WEEKLY' as const },
  { label: 'Instant', value: 'INSTANT' as const },
];

const JOB_TYPE_OPTIONS = [
  { label: 'Any Type', value: '' },
  ...Object.values(JobType).map((jt) => ({ label: toTitleCase(jt), value: jt })),
];

const SALARY_RANGES = [
  { label: 'Any salary', minLPA: '', maxLPA: '' },
  { label: '0 – 3 LPA', minLPA: '0', maxLPA: '300000' },
  { label: '3 – 6 LPA', minLPA: '300000', maxLPA: '600000' },
  { label: '6 – 10 LPA', minLPA: '600000', maxLPA: '1000000' },
  { label: '10 – 20 LPA', minLPA: '1000000', maxLPA: '2000000' },
  { label: '20+ LPA', minLPA: '2000000', maxLPA: '' },
];

interface FormState {
  name: string;
  keywords: string;
  location: string;
  job_type: string;
  salaryRange: string;
  frequency: 'DAILY' | 'WEEKLY' | 'INSTANT';
}

const DEFAULT_FORM: FormState = {
  name: '',
  keywords: '',
  location: '',
  job_type: '',
  salaryRange: '',
  frequency: 'DAILY',
};

/**
 * Modal for creating a new job alert with keyword, location, type, salary, and frequency settings.
 */
export default function JobAlertModal({
  isOpen,
  onClose,
  prefillKeyword = '',
  prefillLocation = '',
}: JobAlertModalProps) {
  const [form, setForm] = useState<FormState>({
    ...DEFAULT_FORM,
    keywords: prefillKeyword,
    location: prefillLocation,
    name: prefillKeyword ? `${prefillKeyword} Jobs` : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Sync prefill values when props change (e.g., modal opened from different job)
  useEffect(() => {
    if (isOpen) {
      setForm({
        ...DEFAULT_FORM,
        keywords: prefillKeyword,
        location: prefillLocation,
        name: prefillKeyword ? `${prefillKeyword} Jobs` : '',
      });
      setErrors({});
    }
  }, [isOpen, prefillKeyword, prefillLocation]);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Alert name is required.';
    if (!form.keywords.trim() && !form.location.trim()) {
      newErrors.keywords = 'Enter at least a keyword or location.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const salaryEntry = SALARY_RANGES.find((r) => r.label === form.salaryRange);

      await createJobAlert({
        name: form.name.trim(),
        keywords: form.keywords.trim() || undefined,
        location: form.location.trim() || undefined,
        job_type: (form.job_type as typeof JobType[keyof typeof JobType]) || undefined,
        salary_min: salaryEntry?.minLPA ? Number(salaryEntry.minLPA) : undefined,
        salary_max: salaryEntry?.maxLPA ? Number(salaryEntry.maxLPA) : undefined,
        frequency: form.frequency,
      });

      toast.success('Job alert created! We will notify you of matching jobs.');
      handleClose();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to create alert. Please try again.';
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
          aria-describedby="alert-modal-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                <Bell className="h-4 w-4 text-[#2563eb]" />
              </span>
              <Dialog.Title className="text-base font-bold text-[#1a1a2e]">
                Create Job Alert
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={submitting}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-[#f5f5f5] hover:text-gray-600 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form id="alert-modal-desc" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 px-6 py-5">
              {/* Alert name */}
              <div>
                <label htmlFor="alert-name" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                  Alert Name <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  id="alert-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. React Developer Jobs in Bangalore"
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition',
                    errors.name
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e0e0e0] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Keywords */}
              <div>
                <label htmlFor="alert-keywords" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                  Keywords
                </label>
                <input
                  id="alert-keywords"
                  type="text"
                  value={form.keywords}
                  onChange={(e) => set('keywords', e.target.value)}
                  placeholder="e.g. React, Node.js, Product Manager"
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition',
                    errors.keywords
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-[#e0e0e0] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',
                  )}
                />
                {errors.keywords && (
                  <p className="mt-1 text-xs text-red-500">{errors.keywords}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="alert-location" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                  Location
                </label>
                <input
                  id="alert-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>

              {/* Job type */}
              <div>
                <label htmlFor="alert-job-type" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                  Job Type
                </label>
                <select
                  id="alert-job-type"
                  value={form.job_type}
                  onChange={(e) => set('job_type', e.target.value)}
                  className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                >
                  {JOB_TYPE_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary range */}
              <div>
                <label htmlFor="alert-salary" className="mb-1 block text-sm font-medium text-[#1a1a2e]">
                  Salary Range
                </label>
                <select
                  id="alert-salary"
                  value={form.salaryRange}
                  onChange={(e) => set('salaryRange', e.target.value)}
                  className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                >
                  {SALARY_RANGES.map(({ label }) => (
                    <option key={label} value={label === 'Any salary' ? '' : label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <p className="mb-2 text-sm font-medium text-[#1a1a2e]">Notification Frequency</p>
                <div className="flex gap-3">
                  {FREQUENCY_OPTIONS.map(({ label, value }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium transition-colors',
                        form.frequency === value
                          ? 'border-[#2563eb] bg-teal-50 text-[#2563eb]'
                          : 'border-[#e0e0e0] text-gray-600 hover:border-[#2563eb]/50',
                      )}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={value}
                        checked={form.frequency === value}
                        onChange={() => set('frequency', value)}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e0e0e0] px-6 py-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={submitting}
                  className="rounded-md border border-[#e0e0e0] px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="border-white border-t-transparent" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Create Alert
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
