import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return 'TBD';
  }
  return date.toLocaleDateString();
}

export { getServerApiUrl, serverApiCall } from './server-api-client';
