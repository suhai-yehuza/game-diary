import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from './index.time';
export * from './index.format';
export * from './index.game';
export * from './index.pagaination';
export * from './index.response';
export * from './index.processing';
export * from './index.validation';
