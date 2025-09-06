import { useCallback } from 'react';

import { analytics } from '@/lib/utils/analytics';
import type { IAnalyticsProperties } from '@/types';

export function useAnalytics() {
  const trackPageView = useCallback((page: string, properties?: IAnalyticsProperties) => {
    analytics.trackPageView(page, properties);
  }, []);

  const trackGameLogCreated = useCallback(
    (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
      analytics.trackGameLogCreated(gameId, sport, properties);
    },
    []
  );

  const trackGameLogUpdated = useCallback(
    (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
      analytics.trackGameLogUpdated(gameId, sport, properties);
    },
    []
  );

  const trackGameLogDeleted = useCallback(
    (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
      analytics.trackGameLogDeleted(gameId, sport, properties);
    },
    []
  );

  const trackGameLogViewed = useCallback(
    (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
      analytics.trackGameLogViewed(gameId, sport, properties);
    },
    []
  );

  const trackSearch = useCallback(
    (query: string, resultsCount: number, properties?: IAnalyticsProperties) => {
      analytics.trackSearch(query, resultsCount, properties);
    },
    []
  );

  const trackSignUp = useCallback((method: string, properties?: IAnalyticsProperties) => {
    analytics.trackSignUp(method, properties);
  }, []);

  const trackSignIn = useCallback((method: string, properties?: IAnalyticsProperties) => {
    analytics.trackSignIn(method, properties);
  }, []);

  const trackLiveGameViewed = useCallback(
    (gameId: string, sport: string, properties?: IAnalyticsProperties) => {
      analytics.trackLiveGameViewed(gameId, sport, properties);
    },
    []
  );

  const trackSportPageView = useCallback((sport: string, properties?: IAnalyticsProperties) => {
    analytics.trackSportPageView(sport, properties);
  }, []);

  const trackCommentAdded = useCallback((gameLogId: string, properties?: IAnalyticsProperties) => {
    analytics.trackCommentAdded(gameLogId, properties);
  }, []);

  const trackReactionAdded = useCallback(
    (gameLogId: string, reactionType: string, properties?: IAnalyticsProperties) => {
      analytics.trackReactionAdded(gameLogId, reactionType, properties);
    },
    []
  );

  const trackFriendAdded = useCallback((friendId: string, properties?: IAnalyticsProperties) => {
    analytics.trackFriendAdded(friendId, properties);
  }, []);

  const trackProfileUpdated = useCallback((properties?: IAnalyticsProperties) => {
    analytics.trackProfileUpdated(properties);
  }, []);

  const trackSettingsChanged = useCallback(
    (setting: string, value: string, properties?: IAnalyticsProperties) => {
      analytics.trackSettingsChanged(setting, value, properties);
    },
    []
  );

  const trackError = useCallback(
    (error: string, context: string, properties?: IAnalyticsProperties) => {
      analytics.trackError(error, context, properties);
    },
    []
  );

  const trackPerformance = useCallback(
    (metric: string, value: number, properties?: IAnalyticsProperties) => {
      analytics.trackPerformance(metric, value, properties);
    },
    []
  );

  const trackFeatureUsed = useCallback((feature: string, properties?: IAnalyticsProperties) => {
    analytics.trackFeatureUsed(feature, properties);
  }, []);

  const trackClick = useCallback(
    (element: string, page: string, properties?: IAnalyticsProperties) => {
      analytics.track('click', {
        element,
        page,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    },
    []
  );

  return {
    trackPageView,
    trackGameLogCreated,
    trackGameLogUpdated,
    trackGameLogDeleted,
    trackGameLogViewed,
    trackSearch,
    trackSignUp,
    trackSignIn,
    trackLiveGameViewed,
    trackSportPageView,
    trackCommentAdded,
    trackReactionAdded,
    trackFriendAdded,
    trackProfileUpdated,
    trackSettingsChanged,
    trackError,
    trackPerformance,
    trackFeatureUsed,
    trackClick,
  };
}
