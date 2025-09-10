/**
 * Search Component Styling Constants
 *
 * Centralized styling constants for search components to ensure consistency
 * and reduce code duplication.
 */

export const SEARCH_STYLES = {
  // Base container styles
  container: {
    base: 'group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden',
  },

  // Background gradients for different result types
  gradients: {
    game: 'from-blue-50/30 to-transparent dark:from-blue-900/10',
    player: 'from-blue-50/30 to-transparent dark:from-blue-900/10',
    team: 'from-red-50/30 to-transparent dark:from-red-900/10',
    user: 'from-green-50/30 to-transparent dark:from-green-900/10',
    gameLog: 'from-purple-50/30 to-transparent dark:from-purple-900/10',
    default: 'from-gray-50/30 to-transparent dark:from-gray-900/10',
  },

  // Avatar styles
  avatar: {
    base: 'w-14 h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300',
    game: 'bg-gradient-to-br from-blue-400 to-blue-600',
    player: 'bg-gradient-to-br from-blue-400 to-blue-600',
    team: 'bg-gradient-to-br from-red-400 to-red-600',
    user: 'bg-gradient-to-br from-green-400 to-green-600',
    gameLog: 'bg-gradient-to-br from-purple-400 to-purple-600',
  },

  // Badge styles
  badge: {
    base: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
    game: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    player:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    team: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    user: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    gameLog:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },

  // Badge dot colors
  badgeDot: {
    game: 'bg-blue-500',
    player: 'bg-blue-500',
    team: 'bg-red-500',
    user: 'bg-green-500',
    gameLog: 'bg-purple-500',
  },

  // Action indicator styles
  actionIndicator: {
    base: 'flex-shrink-0 ml-4 flex flex-col items-end',
    icon: 'w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300',
    text: 'text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300',
  },

  // Content styles
  content: {
    base: 'relative flex items-start space-x-4',
    info: 'flex-1 min-w-0',
    title: 'text-lg font-semibold text-gray-900 dark:text-white',
    subtitle: 'text-sm text-gray-500 dark:text-gray-400',
    meta: 'flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400',
  },
} as const;

export type SearchResultType = keyof typeof SEARCH_STYLES.gradients;
