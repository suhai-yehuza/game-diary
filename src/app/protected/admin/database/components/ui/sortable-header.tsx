import { ChevronUp, ChevronDown } from 'lucide-react';
import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface ISortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (sortKey: string, direction: SortDirection) => void;
  className?: string;
  disabled?: boolean;
}

export function SortableHeader({
  children,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  className = '',
  disabled = false,
}: ISortableHeaderProps) {
  const isActive = currentSortKey === sortKey;
  const isAsc = isActive && currentSortDirection === 'asc';
  const isDesc = isActive && currentSortDirection === 'desc';

  const handleClick = () => {
    if (disabled) return;

    let newDirection: SortDirection;
    if (!isActive) {
      newDirection = 'asc';
    } else if (isAsc) {
      newDirection = 'desc';
    } else {
      newDirection = null;
    }

    onSort(sortKey, newDirection);
  };

  return (
    <th
      className={`
        px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider border-b border-border
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {!disabled && (
          <div className="flex flex-col">
            <ChevronUp
              data-testid="chevron-up"
              className={`h-3 w-3 transition-colors ${
                isAsc ? 'text-foreground' : 'text-muted-foreground/30'
              }`}
            />
            <ChevronDown
              data-testid="chevron-down"
              className={`h-3 w-3 transition-colors -mt-1 ${
                isDesc ? 'text-foreground' : 'text-muted-foreground/30'
              }`}
            />
          </div>
        )}
      </div>
    </th>
  );
}
