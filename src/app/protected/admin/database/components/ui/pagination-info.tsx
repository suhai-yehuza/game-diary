import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import type { IPaginationInfoProps } from '@/types';

export function PaginationInfo({
  totalCount,
  currentPage,
  pageSize,
  itemLabel,
}: IPaginationInfoProps) {
  if (!itemLabel) return null;
  if (totalCount === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div className="text-xs sm:text-sm text-muted-foreground">
        {startItem}-{endItem} of {formatNumberShort(totalCount)} total {itemLabel}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">
        Page{' '}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentPage}</span>{' '}
        of {totalPages}
      </div>
    </div>
  );
}
