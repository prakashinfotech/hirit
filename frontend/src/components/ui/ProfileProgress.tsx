import { cn } from '../../lib/utils';

interface ProfileProgressProps {
  /** A number between 0 and 100 representing profile completion. */
  percentage: number;
  className?: string;
}

/**
 * A horizontal progress bar showing profile completion percentage.
 * Includes a tooltip hint to encourage users to complete their profile.
 */
export default function ProfileProgress({ percentage, className }: ProfileProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round(percentage)));

  const barColor =
    pct < 40 ? 'bg-red-400' : pct < 70 ? 'bg-yellow-400' : 'bg-[#2563eb]';

  return (
    <div
      className={cn('w-full', className)}
      title="Complete your profile to get more visibility"
    >
      {/* Label row */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          Profile {pct}% complete
        </span>
        <span
          className={cn(
            'text-xs font-bold',
            pct < 40 ? 'text-red-500' : pct < 70 ? 'text-yellow-600' : 'text-[#2563eb]',
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Profile ${pct}% complete`}
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Hint text */}
      {pct < 100 && (
        <p className="mt-1 text-xs text-gray-400">
          Complete your profile to get more visibility
        </p>
      )}
    </div>
  );
}
