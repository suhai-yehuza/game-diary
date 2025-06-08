import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export all utility modules
export * from './time';
export * from './format';
export * from './game';
export * from './pagination';
export * from './response';
export * from './processing';
export * from './validation';
