/**
 * E2E Test Constants
 * Centralized configuration and test data for E2E tests
 */

import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';

export const SPORTS_PAGES = [
  ...Object.values(SPORTS_CONFIG).map(sport => sport.href),
  '/sports/all-sports',
  '/sports/live',
] as const;

export const MAJOR_SECTIONS = [
  { href: '/', label: 'Home' },
  { href: '/sports/nba', label: 'Sports' },
  { href: '/', label: 'Dashboard' },
  { href: '/protected/user', label: 'Profile' },
] as const;

export const TEST_TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 15000,
  VERY_LONG: 30000,
} as const;

export const PERFORMANCE_THRESHOLDS = {
  LOAD_TIME: 5000, // 5 seconds
  DOM_CONTENT_LOADED: 3000, // 3 seconds
  FIRST_CONTENTFUL_PAINT: 2000, // 2 seconds
} as const;

export const VIEWPORT_SIZES = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1280, height: 720 },
  LARGE_DESKTOP: { width: 1920, height: 1080 },
} as const;

export const CSS_ANIMATION_DISABLE =
  '* { transition: none !important; animation: none !important; }';
