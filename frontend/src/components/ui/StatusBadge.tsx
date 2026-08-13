import { ApplicationStatus } from '../../types';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  [ApplicationStatus.PENDING]: {
    label: 'Applied',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  [ApplicationStatus.REVIEWING]: {
    label: 'Reviewing',
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  [ApplicationStatus.SHORTLISTED]: {
    label: 'Shortlisted',
    className: 'bg-teal-100 text-[#2563eb] border border-teal-200',
  },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: {
    label: 'Interview',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  [ApplicationStatus.OFFERED]: {
    label: 'Offered',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  [ApplicationStatus.HIRED]: {
    label: 'Hired',
    className: 'bg-green-200 text-green-800 border border-green-300',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-600 border border-red-200',
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Withdrawn',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
};

/**
 * A color-coded pill badge representing an application status.
 */
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: StatusConfig = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
