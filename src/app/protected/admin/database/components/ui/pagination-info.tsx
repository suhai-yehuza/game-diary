import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';

interface IPaginationInfoProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  itemLabel: string;
}

export function PaginationInfo({
  totalCount,
  currentPage,
  pageSize,
  itemLabel,
}: IPaginationInfoProps) {
  if (!itemLabel) return null;
  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        {formatNumberShort(totalCount)} total {itemLabel}
      </div>
      <div className="text-sm text-muted-foreground">
        Page{' '}
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentPage}</span>{' '}
        of {Math.ceil(totalCount / pageSize)}
      </div>
    </div>
  );
}
