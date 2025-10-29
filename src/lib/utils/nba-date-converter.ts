/**
 * NBA API Date Conversion Utilities
 *
 * The NBA API returns dates in UTC format, but we need to properly handle
 * timezone conversions to ensure dates are displayed correctly in the local timezone.
 */

/**
 * Converts NBA API date string to proper Date object
 * Handles both UTC datetime strings and date-only strings
 *
 * @param dateString - Date string from NBA API (e.g., "2025-10-28T19:00:00.000Z" or "2025-10-28")
 * @returns Properly converted Date object
 */
export function convertNBADateToLocal(dateString: string): Date {
  if (!dateString || dateString.trim() === '') {
    throw new Error('Invalid date string provided');
  }

  // If it's already a full datetime string (contains 'T'), parse it as UTC
  if (dateString.includes('T')) {
    // NBA API returns UTC times, so we parse it as UTC
    const utcDate = new Date(dateString);

    // Validate the date
    if (isNaN(utcDate.getTime())) {
      throw new Error(`Invalid UTC date string: ${dateString}`);
    }

    return utcDate;
  } else {
    // If it's just a date string (YYYY-MM-DD), we need to be careful about timezone interpretation
    // NBA games are typically played in the evening Eastern Time
    // We'll treat this as a date-only value and let the database handle timezone conversion
    const dateOnly = new Date(dateString + 'T00:00:00.000Z');

    // Validate the date
    if (isNaN(dateOnly.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }

    return dateOnly;
  }
}

/**
 * Converts a Date object to a consistent format for database storage
 * Ensures all dates are stored in UTC format
 *
 * @param date - Date object to convert
 * @returns ISO string in UTC format
 */
export function convertDateToUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Formats a date for display in the local timezone
 *
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in local timezone
 */
export function formatDateForDisplay(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Gets the local date part of a UTC date (ignores time)
 * Useful for comparing dates without timezone issues
 *
 * @param utcDateString - UTC date string from database
 * @returns Date object representing the local date
 */
export function getLocalDateFromUTC(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  const localDate = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());
  return localDate;
}

/**
 * Checks if a date string is in UTC format
 *
 * @param dateString - Date string to check
 * @returns true if the string appears to be in UTC format
 */
export function isUTCFormat(dateString: string): boolean {
  return (
    dateString.includes('T') &&
    (dateString.endsWith('Z') || dateString.includes('+') || dateString.includes('-'))
  );
}

/**
 * Debug helper to log date conversion details
 *
 * @param originalDate - Original date string from API
 * @param convertedDate - Converted Date object
 * @param context - Context for debugging (e.g., "NBA API", "Database")
 */
export function debugDateConversion(
  originalDate: string,
  convertedDate: Date,
  context = 'Date Conversion'
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🕐 ${context}:`, {
      original: originalDate,
      converted: convertedDate.toISOString(),
      local: convertedDate.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isUTC: isUTCFormat(originalDate),
    });
  }
}
