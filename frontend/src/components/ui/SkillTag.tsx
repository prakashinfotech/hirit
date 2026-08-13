import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SkillTagProps {
  /** The skill name to display. Accepts either `skill` or `name` prop for backward compat. */
  skill?: string;
  name?: string;
  /** When true, renders an X button to remove the tag. */
  removable?: boolean;
  /** Called when the X button is clicked. */
  onRemove?: () => void;
  className?: string;
}

/**
 * An orange-outline pill tag for displaying a skill.
 * When removable is true, it shows an X icon button.
 */
export default function SkillTag({
  skill,
  name,
  removable = false,
  onRemove,
  className,
}: SkillTagProps) {
  const label = skill ?? name ?? '';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-[#2563eb]/40 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-[#2563eb]',
        className,
      )}
    >
      {label}
      {(removable || onRemove) && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove skill ${label}`}
          className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[#2563eb]/70 transition-colors hover:bg-[#2563eb] hover:text-white"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}
