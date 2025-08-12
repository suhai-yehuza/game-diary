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

// Enhanced analytics tracking with custom properties
export const analytics = {
  // Track page views
  trackPageView: (page: string, properties?: IAnalyticsProperties) => {
    track('page_view', {
      page,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track game log events
  trackGameLogCreated: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    track('game_log_created', {
      game_id: gameId,
      sport,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackGameLogUpdated: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    track('game_log_updated', {
      game_id: gameId,
      sport,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackGameLogDeleted: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    track('game_log_deleted', {
      game_id: gameId,
      sport,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackGameLogViewed: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    track('game_log_viewed', {
      game_id: gameId,
      sport,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track search events
  trackSearch: (query: string, resultsCount: number, properties?: IAnalyticsProperties) => {
    track('search_performed', {
      query,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track authentication events
  trackSignUp: (method: string, properties?: IAnalyticsProperties) => {
    track('user_signed_up', {
      method,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackSignIn: (method: string, properties?: IAnalyticsProperties) => {
    track('user_signed_in', {
      method,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track live games
  trackLiveGameViewed: (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
    track('live_game_viewed', {
      game_id: gameId,
      sport,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track sport page views
  trackSportPageView: (sport: string, properties?: IAnalyticsProperties) => {
    track('sport_page_viewed', {
      sport,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track social features
  trackCommentAdded: (gameLogId: string, properties?: IAnalyticsProperties) => {
    track('comment_added', {
      game_log_id: gameLogId,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackReactionAdded: (
    gameLogId: string,
    reactionType: string,
    properties?: IAnalyticsProperties
  ) => {
    track('reaction_added', {
      game_log_id: gameLogId,
      reaction_type: reactionType,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackFriendAdded: (friendId: string, properties?: IAnalyticsProperties) => {
    track('friend_added', {
      friend_id: friendId,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track user profile events
  trackProfileUpdated: (properties?: IAnalyticsProperties) => {
    track('profile_updated', {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  trackSettingsChanged: (setting: string, value: string, properties?: IAnalyticsProperties) => {
    track('settings_changed', {
      setting,
      value,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track errors
  trackError: (error: string, context: string, properties?: IAnalyticsProperties) => {
    track('error_occurred', {
      error,
      context,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track performance metrics
  trackPerformance: (metric: string, value: number, properties?: IAnalyticsProperties) => {
    track('performance_metric', {
      metric,
      value,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Track feature usage
  trackFeatureUsed: (feature: string, properties?: IAnalyticsProperties) => {
    track('feature_used', {
      feature,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },

  // Generic track function for custom events
  track: (event: AnalyticsEvent, properties?: IAnalyticsProperties) => {
    track(event, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },
};

// Analytics hook for React components
export const useAnalytics = () => {
  return analytics;
};

// Performance monitoring utilities
export const performanceAnalytics = {
  // Track page load time
  trackPageLoad: (page: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        analytics.trackPerformance(
          'page_load_time',
          navigation.loadEventEnd - navigation.loadEventStart,
          {
            page,
            navigation_type: navigation.type,
          }
        );
      }
    }
  },

  // Track component render time
  trackComponentRender: (componentName: string, renderTime: number) => {
    analytics.trackPerformance('component_render_time', renderTime, {
      component: componentName,
    });
  },

  // Track API response time
  trackApiResponse: (endpoint: string, responseTime: number, status: number) => {
    analytics.trackPerformance('api_response_time', responseTime, {
      endpoint,
      status,
    });
  },
};

// Error boundary analytics
export const errorAnalytics = {
  trackErrorBoundary: (error: Error, errorInfo: React.ErrorInfo) => {
    analytics.trackError(error.message, 'error_boundary', {
      component_stack: errorInfo.componentStack,
      error_name: error.name,
    });
  },

  trackUnhandledError: (error: Error, context?: string) => {
    analytics.trackError(error.message, context || 'unhandled_error', {
      error_name: error.name,
      ...(error.stack && { error_stack: error.stack }),
    });
  },
};

// User behavior analytics
export const behaviorAnalytics = {
  trackScrollDepth: (page: string, depth: number) => {
    analytics.track('scroll_depth', {
      page,
      depth,
      timestamp: new Date().toISOString(),
    });
  },

  trackTimeOnPage: (page: string, timeSpent: number) => {
    analytics.track('time_on_page', {
      page,
      time_spent: timeSpent,
      timestamp: new Date().toISOString(),
    });
  },

  trackClick: (element: string, page: string, properties?: IAnalyticsProperties) => {
    analytics.track('click', {
      element,
      page,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  },
};

export default analytics;
