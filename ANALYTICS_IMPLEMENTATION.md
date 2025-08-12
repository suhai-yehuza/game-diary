# Vercel Analytics Implementation

This document describes the Vercel Analytics implementation for the game-diary project, following the [official Vercel Analytics documentation](https://vercel.com/docs/analytics/quickstart#add-the-analytics-component-to-your-app).

## Overview

The analytics implementation provides comprehensive tracking for user interactions, performance metrics, and business events throughout the game-diary application. It uses Vercel's official `@vercel/analytics` package for reliable, privacy-compliant analytics.

## Setup

### 1. Package Installation

The `@vercel/analytics` package has been installed:

```bash
pnpm add @vercel/analytics
```

### 2. Analytics Component Integration

The `Analytics` component has been added to the root layout (`src/app/layout.tsx`):

```tsx
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Enable Analytics in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click on the "Analytics" tab
3. Click "Enable" from the dialog
4. Deploy your application to activate analytics tracking

## Analytics Utilities

### Core Analytics Utility (`src/lib/utils/analytics.ts`)

Provides comprehensive tracking functions for all application events:

```typescript
import { analytics } from '@/lib/utils/analytics';

// Track page views
analytics.trackPageView('/dashboard', { user_type: 'premium' });

// Track game log events
analytics.trackGameLogCreated('game-123', 'basketball', { platform: 'mobile' });

// Track search events
analytics.trackSearch('Lakers vs Warriors', 15, { filter: 'live' });

// Track authentication events
analytics.trackSignUp('google', { referral_source: 'twitter' });

// Track errors
analytics.trackError('API timeout', 'game-fetch', { endpoint: '/api/games' });
```

### React Hook (`src/hooks/use-analytics.ts`)

Provides memoized analytics functions for React components:

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function GameLogComponent({ gameId, sport }) {
  const { trackGameLogViewed, trackClick } = useAnalytics();

  useEffect(() => {
    trackGameLogViewed(gameId, sport);
  }, [gameId, sport, trackGameLogViewed]);

  const handleButtonClick = () => {
    trackClick('create-game-log-button', '/dashboard');
  };

  return (
    <button onClick={handleButtonClick}>
      Create Game Log
    </button>
  );
}
```

### Page View Tracker (`src/app/components/analytics/PageViewTracker.tsx`)

Automatically tracks page views when included in pages:

```tsx
import { PageViewTracker } from '@/app/components/analytics/PageViewTracker';

export default function DashboardPage() {
  return (
    <div>
      <PageViewTracker pageTitle="Dashboard" />
      {/* Page content */}
    </div>
  );
}
```

## Event Types

The analytics system tracks the following event types:

### Core Events

- `page_view` - Page views with metadata
- `search_performed` - Search queries and results
- `error_occurred` - Application errors and exceptions

### Game Log Events

- `game_log_created` - New game logs created
- `game_log_updated` - Existing game logs modified
- `game_log_deleted` - Game logs removed
- `game_log_viewed` - Game log detail views

### Authentication Events

- `user_signed_up` - New user registrations
- `user_signed_in` - User login events

### Sports Events

- `live_game_viewed` - Live game page views
- `sport_page_viewed` - Sport-specific page views

### Social Features

- `comment_added` - Comments on game logs
- `reaction_added` - Reactions to game logs
- `friend_added` - Friend connections

### User Profile Events

- `profile_updated` - Profile modifications
- `settings_changed` - User setting changes

### Performance Events

- `performance_metric` - Performance measurements
- `feature_used` - Feature usage tracking

### User Behavior Events

- `scroll_depth` - Page scroll depth
- `time_on_page` - Time spent on pages
- `click` - Element click tracking

## Usage Examples

### Tracking Game Log Creation

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function CreateGameLogForm() {
  const { trackGameLogCreated } = useAnalytics();

  const handleSubmit = async formData => {
    try {
      const gameLog = await createGameLog(formData);
      trackGameLogCreated(gameLog.id, formData.sport, {
        platform: 'web',
        user_type: 'premium',
        game_type: 'live',
      });
    } catch (error) {
      // Error tracking handled by error boundary
    }
  };
}
```

### Tracking Search Events

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function SearchComponent() {
  const { trackSearch } = useAnalytics();

  const handleSearch = (query: string, results: any[]) => {
    trackSearch(query, results.length, {
      filter: 'all',
      sort_by: 'date',
      user_type: 'authenticated',
    });
  };
}
```

### Error Tracking

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function ErrorBoundary({ children }) {
  const { trackError } = useAnalytics();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    trackError(error.message, 'error_boundary', {
      component_stack: errorInfo.componentStack,
      error_name: error.name,
      page: window.location.pathname,
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
```

### Performance Tracking

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function PerformanceTracker() {
  const { trackPerformance } = useAnalytics();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart, {
          page: window.location.pathname,
        });
      }
    }
  }, [trackPerformance]);
}
```

## Privacy and Compliance

The analytics implementation follows Vercel's privacy standards:

- **No PII Collection**: Personal identifiable information is not collected
- **GDPR Compliant**: Follows GDPR requirements for data collection
- **Privacy-First**: Minimal data collection with user consent
- **Data Retention**: Follows Vercel's data retention policies

## Viewing Analytics Data

1. **Vercel Dashboard**: Go to your project's Analytics tab
2. **Real-time Data**: View live visitor data and page views
3. **Custom Events**: Monitor custom events and user interactions
4. **Performance Metrics**: Track page load times and performance
5. **Error Tracking**: Monitor application errors and exceptions

## Best Practices

### 1. Consistent Event Naming

Use descriptive, consistent event names:

```typescript
// Good
analytics.trackGameLogCreated(gameId, sport);

// Avoid
analytics.track('click', { button: 'create' });
```

### 2. Meaningful Properties

Include relevant context with events:

```typescript
analytics.trackSearch(query, resultsCount, {
  filter: 'live',
  user_type: 'premium',
  platform: 'mobile',
});
```

### 3. Error Handling

Always wrap analytics calls in try-catch blocks:

```typescript
try {
  analytics.trackGameLogCreated(gameId, sport);
} catch (error) {
  console.warn('Analytics tracking failed:', error);
}
```

### 4. Performance Considerations

Use the `useAnalytics` hook for memoized functions:

```typescript
const { trackGameLogCreated } = useAnalytics(); // Memoized
```

### 5. Testing

Mock analytics in test environments:

```typescript
// In test setup
jest.mock('@/lib/utils/analytics', () => ({
  analytics: {
    trackGameLogCreated: jest.fn(),
    trackSearch: jest.fn(),
    // ... other methods
  },
}));
```

## Troubleshooting

### Analytics Not Working

1. Verify `@vercel/analytics` is installed
2. Check that `<Analytics />` is in the root layout
3. Ensure analytics is enabled in Vercel dashboard
4. Deploy the application to activate tracking

### Custom Events Not Appearing

1. Verify event names are valid strings
2. Check that properties are serializable
3. Ensure events are being called in client-side code
4. Wait for data to appear in dashboard (may take time)

### Performance Impact

1. Use memoized hooks for repeated calls
2. Avoid tracking in render loops
3. Consider debouncing frequent events
4. Monitor bundle size impact

## Next Steps

1. **Enable Analytics**: Enable Web Analytics in your Vercel dashboard
2. **Deploy**: Deploy your application to start collecting data
3. **Monitor**: Check the Analytics tab for incoming data
4. **Customize**: Add more custom events as needed
5. **Optimize**: Use analytics data to improve user experience

For more information, refer to the [Vercel Analytics documentation](https://vercel.com/docs/analytics).
