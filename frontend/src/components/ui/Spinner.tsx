import { cn } from '../../lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  /** Controls the size of the spinner. Defaults to 'md'. */
  size?: SpinnerSize;
  /**
   * When true, the spinner is wrapped in a full-viewport overlay
   * with a semi-transparent background and centered.
   */
  fullPage?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-14 w-14 border-4',
};

/**
 * A circular loading spinner in Foundit orange.
 *
 * Usage:
 *   <Spinner />                  — inline, medium
 *   <Spinner size="sm" />        — small inline
 *   <Spinner fullPage />         — full-viewport overlay
 */
export default function Spinner({ size = 'md', fullPage = false, className }: SpinnerProps) {
  const spinnerEl = (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-[#2563eb] border-t-transparent',
        SIZE_CLASSES[size],
        className,
      )}
    />
  );

  if (fullPage) {
    return (
      <div
        aria-live="polite"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm"
      >
        {spinnerEl}
      </div>
    );
  }

  return spinnerEl;
}
