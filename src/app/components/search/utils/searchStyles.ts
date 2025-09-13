/**
 * Search Component Styling Constants
 *
 * Centralized styling constants for search components to ensure consistency
 * and reduce code duplication.
 */

export const SEARCH_STYLES = {
  // Base container styles
  container: {
    base: 'group relative bg-surface-card border border-theme-primary rounded-xl p-6 hover:shadow-lg hover:border-theme-secondary transition-all duration-300 cursor-pointer overflow-hidden',
  },

  // Background gradients for different result types
  gradients: {
    game: 'from-semantic-info/30 to-transparent',
    player: 'from-semantic-info/30 to-transparent',
    team: 'from-semantic-error/30 to-transparent',
    user: 'from-semantic-success/30 to-transparent',
    gameLog: 'from-semantic-warning/30 to-transparent',
    default: 'from-bg-theme-secondary/30 to-transparent',
  },

  // Avatar styles
  avatar: {
    base: 'w-14 h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300',
    game: 'bg-gradient-to-br from-semantic-info to-semantic-info/80',
    player: 'bg-gradient-to-br from-semantic-info to-semantic-info/80',
    team: 'bg-gradient-to-br from-semantic-error to-semantic-error/80',
    user: 'bg-gradient-to-br from-semantic-success to-semantic-success/80',
    gameLog: 'bg-gradient-to-br from-semantic-warning to-semantic-warning/80',
  },

  // Badge styles
  badge: {
    base: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
    game: 'bg-semantic-info/10 text-semantic-info border-semantic-info/30',
    player: 'bg-semantic-info/10 text-semantic-info border-semantic-info/30',
    team: 'bg-semantic-error/10 text-semantic-error border-semantic-error/30',
    user: 'bg-semantic-success/10 text-semantic-success border-semantic-success/30',
    gameLog: 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/30',
  },

  // Badge dot colors
  badgeDot: {
    game: 'bg-semantic-info',
    player: 'bg-semantic-info',
    team: 'bg-semantic-error',
    user: 'bg-semantic-success',
    gameLog: 'bg-semantic-warning',
  },

  // Action indicator styles
  actionIndicator: {
    base: 'flex-shrink-0 ml-4 flex flex-col items-end',
    icon: 'w-5 h-5 text-theme-muted group-hover:text-theme-secondary transition-colors duration-300',
    text: 'text-xs text-theme-muted group-hover:text-theme-secondary mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300',
  },

  // Content styles
  content: {
    base: 'relative flex items-start space-x-4',
    info: 'flex-1 min-w-0',
    title: 'text-lg font-semibold text-theme-primary',
    subtitle: 'text-sm text-theme-muted',
    meta: 'flex items-center flex-wrap gap-4 text-sm text-theme-muted',
  },
} as const;

export type SearchResultType = keyof typeof SEARCH_STYLES.gradients;
