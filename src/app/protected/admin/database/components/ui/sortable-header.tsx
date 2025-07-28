import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

import type { SortDirection, ISortableHeaderProps } from '@/lib/types';

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

  const handleClick = (event: React.MouseEvent<HTMLTableHeaderCellElement>) => {
    console.log('SortableHeader clicked:', sortKey, event.type);
    event.preventDefault();
    event.stopPropagation();

    if (disabled) return;

    let newDirection: SortDirection;
    if (!isActive) {
      newDirection = 'asc';
    } else if (isAsc) {
      newDirection = 'desc';
    } else {
      newDirection = null;
    }

    console.log('Calling onSort with:', sortKey, newDirection);
    onSort(sortKey, newDirection);
  };

  const getSortIcon = () => {
    if (disabled) return null;

    if (isAsc) {
      return <ArrowUp data-testid="arrow-up" className="h-4 w-4 text-yellow-300" />;
    } else if (isDesc) {
      return <ArrowDown data-testid="arrow-down" className="h-4 w-4 text-yellow-300" />;
    } else {
      return (
        <ArrowUpDown
          data-testid="arrow-up-down"
          className="h-4 w-4 text-white/70 hover:text-white transition-colors"
        />
      );
    }
  };

  return (
    <th
      role="columnheader"
      className={`
        px-6 py-4 text-left text-sm font-semibold text-white tracking-wide border-r border-emerald-500/30 dark:border-emerald-400/30 last:border-r-0
        transition-all duration-200 ease-in-out
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-emerald-500/20 active:bg-emerald-500/30'}
        ${isActive ? 'bg-emerald-500/30' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between group">
        <span className="font-medium">{children}</span>
        {!disabled && <div className="flex items-center ml-2">{getSortIcon()}</div>}
      </div>
    </th>
  );
}
