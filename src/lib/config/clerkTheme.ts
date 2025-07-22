// Centralized Clerk theme configuration
export const CLERK_THEME = {
  colors: {
    primary: '#1e40af', // Blue-800
    primaryHover: '#1e3a8a', // Blue-900
    primaryFocus: '#3b82f6', // Blue-600
  },
  tailwind: {
    button:
      'bg-blue-800 hover:bg-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
    link: 'text-blue-800 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
    secondaryLink:
      'text-black hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
    focus: 'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
  },
} as const;
