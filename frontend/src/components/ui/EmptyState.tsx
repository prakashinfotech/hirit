import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  /** Lucide icon element or any React node for the illustration. */
  icon?: ReactNode;
  /** Bold heading text. */
  title: string;
  /** Supporting description text. */
  description?: string;
  /** Label for the optional call-to-action button. */
  actionLabel?: string;
  /** Handler called when the CTA button is clicked. */
  onAction?: () => void;
  className?: string;
}

/**
 * A centered empty state with an optional icon, heading, description, and CTA button.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f5f5] text-gray-300">
          {icon}
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-[#1a1a2e]">{title}</h3>

      {description && (
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
