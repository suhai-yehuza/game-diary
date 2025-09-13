import { BASE_COLORS } from '@/lib/constants/colors';

// Centralized Clerk theme configuration
export const CLERK_THEME = {
  colors: {
    primary: BASE_COLORS.brand.primary, // Using centralized brand primary
    primaryHover: BASE_COLORS.brand.primaryHover, // Using centralized brand primary hover
    primaryFocus: BASE_COLORS.brand.primaryLight, // Using centralized brand primary light
  },
  tailwind: {
    button:
      'bg-brand-primary hover:bg-brand-primary-hover text-theme-inverse focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
    link: 'text-brand-primary hover:text-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
    secondaryLink:
      'text-theme-primary hover:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
    focus: 'focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
  },
} as const;
