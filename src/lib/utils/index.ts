import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getCurrentSeason } from './index.time';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { getCurrentSeason };

// Keep only the utility functions that are being used
export * from './index.time';
export * from './index.format';
export * from './index.game';
export * from './index.pagaination';
export * from './index.response';
export * from './index.processing';
export * from './index.validation';
