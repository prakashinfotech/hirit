import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds a compact list of page numbers with ellipsis for large page counts.
 * Always shows first, last, current, and one neighbour on each side.
 */
function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push('...');

  for (let p = left; p <= right; p++) {
    pages.push(p);
  }

  if (right < total - 1) pages.push('...');

  pages.push(total);

  return pages;
}

/**
 * Pagination controls with previous/next buttons and numbered page buttons.
 * The active page is highlighted in orange. Ellipsis is shown for large page counts.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] text-sm transition-colors',
          currentPage === 1
            ? 'cursor-not-allowed text-gray-300'
            : 'text-[#1a1a2e] hover:border-[#2563eb] hover:text-[#2563eb]',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-9 w-9 items-center justify-center text-gray-400"
            aria-hidden="true"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
              page === currentPage
                ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-sm'
                : 'border-[#e0e0e0] text-[#1a1a2e] hover:border-[#2563eb] hover:text-[#2563eb]',
            )}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] text-sm transition-colors',
          currentPage === totalPages
            ? 'cursor-not-allowed text-gray-300'
            : 'text-[#1a1a2e] hover:border-[#2563eb] hover:text-[#2563eb]',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
