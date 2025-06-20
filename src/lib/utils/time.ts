import type { IDateFields, ISeasonOption, ISeasonRange } from '@src/lib/types';

/**
 * Gets the current NBA season year.
 * NBA seasons typically start in October and end in June of the following year.
 * For example, the 2023-24 season would be considered 2023.
 */
export function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-based

  // If we're in the first half of the year (before October),
  // return the previous year as the season
  if (month < 10) {
    return year - 1;
  }

  return year;
}

/**
 * Gets the season range from current year back to a specified number of years
 */
export function getSeasonRange(years: number): ISeasonRange {
  const current = getCurrentSeason();
  return {
    start: current - years + 1,
    end: current,
    current,
  };
}

/**
 * Creates an array of season options for selection
 */
export function createSeasonOptions(range: ISeasonRange): ISeasonOption[] {
  return Array.from({ length: range.end - range.start + 1 }, (_, i) => {
    const year = range.end - i;
    return {
      value: year,
      label: `${year}-${(year + 1).toString().slice(-2)}`,
      isCurrent: year === range.current,
    };
  });
}

/**
 * Validates if a given year is a valid NBA season
 */
export function isValidSeason(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1946 && year <= currentYear; // NBA started in 1946
}

/**
 * Gets the season start and end dates for a given year
 */
export function getSeasonDates(year: number): { start: Date; end: Date } {
  return {
    start: new Date(year, 9, 1), // October 1st
    end: new Date(year + 1, 5, 30), // June 30th
  };
}

export function getDateFields(item: IDateFields) {
  return {
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

export function formatDateForExport(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateFields<T extends IDateFields>(obj: T): T {
  const result = { ...obj };
  if (result.createdAt) result.createdAt = new Date(result.createdAt);
  if (result.updatedAt) result.updatedAt = new Date(result.updatedAt);
  return result;
}

export function formatGameDate(date: string | { start: string }): string {
  const dateStr = typeof date === 'string' ? date : date.start;
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Utility function to create a delay for a specified number of milliseconds
 * @param ms Number of milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatRelativeTime(date: Date | string): string {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
