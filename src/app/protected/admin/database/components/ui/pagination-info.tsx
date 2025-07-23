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
        {totalCount} total {itemLabel}
      </div>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
      </div>
    </div>
  );
}
