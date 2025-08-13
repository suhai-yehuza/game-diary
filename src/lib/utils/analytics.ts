import { track } from '@vercel/analytics';

// Analytics event types for the game-diary application
export type AnalyticsEvent =
  | 'page_view'
  | 'game_log_created'
  | 'game_log_updated'
  | 'game_log_deleted'
  | 'game_log_viewed'
  | 'search_performed'
  | 'user_signed_up'
  | 'user_signed_in'
  | 'live_game_viewed'
  | 'sport_page_viewed'
  | 'comment_added'
  | 'reaction_added'
  | 'friend_added'
  | 'profile_updated'
  | 'settings_changed'
  | 'error_occurred'
  | 'performance_metric'
  | 'feature_used'
  | 'scroll_depth'
  | 'time_on_page'
  | 'click';

// Analytics properties interface
export interface IAnalyticsProperties {
  [key: string]: string | number | boolean | undefined | null;
}

// TEMPORARILY DISABLED: Custom analytics tracking to reduce costs
// Set this to true to re-enable custom analytics events
const ANALYTICS_ENABLED = false;

// Enhanced analytics tracking with custom properties
export const analytics = {
  // Track page views (kept enabled for basic analytics)
  trackPageView: (page: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('page_view', {
        page,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track game log events
  trackGameLogCreated: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('game_log_created', {
        game_id: gameId,
        sport,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  trackGameLogUpdated: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('game_log_updated', {
        game_id: gameId,
        sport,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  trackGameLogDeleted: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('game_log_deleted', {
        game_id: gameId,
        sport,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  trackGameLogViewed: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('game_log_viewed', {
        game_id: gameId,
        sport,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track search events
  trackSearch: (query: string, resultsCount: number, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('search_performed', {
        query,
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track authentication events
  trackSignUp: (method: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('user_signed_up', {
        method,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  trackSignIn: (method: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('user_signed_in', {
        method,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track live games
  trackLiveGameViewed: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('live_game_viewed', {
        game_id: gameId,
        sport,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track sport pages
  trackSportPageView: (sport: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('sport_page_viewed', {
        sport,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track comments
  trackCommentAdded: (gameLogId: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('comment_added', {
        game_log_id: gameLogId,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track reactions
  trackReactionAdded: (
    gameLogId: string,
    reactionType: string,
    properties?: IAnalyticsProperties
  ) => {
    if (ANALYTICS_ENABLED) {
      track('reaction_added', {
        game_log_id: gameLogId,
        reaction_type: reactionType,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track friend events
  trackFriendAdded: (friendId: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('friend_added', {
        friend_id: friendId,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track profile events
  trackProfileUpdated: (properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('profile_updated', {
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track settings events
  trackSettingsChanged: (setting: string, value: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('settings_changed', {
        setting,
        value,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track errors
  trackError: (error: string, context: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('error_occurred', {
        error,
        context,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track performance metrics
  trackPerformance: (metric: string, value: number, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('performance_metric', {
        metric,
        value,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Track feature usage
  trackFeatureUsed: (feature: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track('feature_used', {
        feature,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },

  // Generic track function for custom events
  track: (event: AnalyticsEvent, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      track(event, {
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },
};

// Analytics hook for React components
export const useAnalytics = () => {
  return analytics;
};

// Performance analytics (temporarily disabled)
export const performanceAnalytics = {
  trackApiResponseTime: (endpoint: string, responseTime: number, status: number) => {
    if (ANALYTICS_ENABLED) {
      analytics.trackPerformance('api_response_time', responseTime, {
        endpoint,
        status,
      });
    }
  },
};

// Error boundary analytics (temporarily disabled)
export const errorAnalytics = {
  trackErrorBoundary: (error: Error, errorInfo: React.ErrorInfo) => {
    if (ANALYTICS_ENABLED) {
      analytics.trackError(error.message, 'error_boundary', {
        component_stack: errorInfo.componentStack,
        error_name: error.name,
      });
    }
  },

  trackUnhandledError: (error: Error, context?: string) => {
    if (ANALYTICS_ENABLED) {
      analytics.trackError(error.message, context || 'unhandled_error', {
        error_name: error.name,
        ...(error.stack && { error_stack: error.stack }),
      });
    }
  },
};

// User behavior analytics (temporarily disabled)
export const behaviorAnalytics = {
  trackScrollDepth: (page: string, depth: number) => {
    if (ANALYTICS_ENABLED) {
      analytics.track('scroll_depth', {
        page,
        depth,
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackTimeOnPage: (page: string, timeSpent: number) => {
    if (ANALYTICS_ENABLED) {
      analytics.track('time_on_page', {
        page,
        time_spent: timeSpent,
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackClick: (element: string, page: string, properties?: IAnalyticsProperties) => {
    if (ANALYTICS_ENABLED) {
      analytics.track('click', {
        element,
        page,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    }
  },
};

export default analytics;
