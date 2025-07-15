// Centralized Clerk theme configuration
export const CLERK_THEME = {
  colors: {
    primary: '#1e40af', // Blue-800
    primaryHover: '#1e3a8a', // Blue-900
    primaryFocus: '#3b82f6', // Blue-600
  },
  tailwind: {
    button: 'bg-blue-800 hover:bg-blue-900 text-white',
    link: 'text-blue-800 hover:text-blue-900',
    secondaryLink: 'text-black hover:text-gray-800',
    focus: 'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
  },
} as const;

// Helper function to get Clerk appearance configuration
export function getClerkAppearance() {
  return {
    baseTheme: undefined,
    variables: {
      colorPrimary: CLERK_THEME.colors.primary,
      colorBackground: '#ffffff', // White
      colorInputBackground: '#f9fafb', // Gray-50
      colorInputText: '#111827', // Gray-900
    },
    elements: {
      formButtonPrimary: CLERK_THEME.tailwind.button,
      card: 'shadow-lg rounded-lg',
      headerTitle: 'text-xl font-semibold',
      headerSubtitle: 'text-gray-600',
      socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
      formFieldInput: `border border-gray-300 rounded-md ${CLERK_THEME.tailwind.focus}`,
      footerActionLink: CLERK_THEME.tailwind.link,
      footerAction: 'cl-footerAction',
      // Secondary links (Use phone, Use passkey, etc.)
      formFieldAction: CLERK_THEME.tailwind.secondaryLink,
      formFieldActionLink: CLERK_THEME.tailwind.secondaryLink,
      alternativeMethodsBlockButton: CLERK_THEME.tailwind.secondaryLink,
    },
  };
}
