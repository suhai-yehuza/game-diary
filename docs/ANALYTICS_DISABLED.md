# Analytics Temporarily Disabled

## Overview

To reduce analytics costs, the following custom analytics features have been temporarily disabled:

- **Custom event tracking** (game logs, search, authentication, etc.)
- **Performance monitoring** (Core Web Vitals, API response times, etc.)
- **Custom page view tracking** (detailed page view analytics)
- **User behavior tracking** (scroll depth, time on page, clicks)

## What's Still Active

- **Basic Vercel Analytics** - The `<Analytics />` component in `src/app/layout.tsx` is still active and will track basic page views
- **Speed Insights** - The `<SpeedInsights />` component is still active for performance monitoring

## Files Modified

### 1. `src/lib/utils/analytics.ts`

- Added `ANALYTICS_ENABLED = false` flag
- All custom tracking functions now check this flag before sending events
- **To re-enable**: Set `ANALYTICS_ENABLED = true`

### 2. `src/app/components/analytics/PerformanceMonitor.tsx`

- Changed default `enabled` prop to `false`
- All performance tracking features disabled by default
- **To re-enable**: Set `enabled={true}` in the component usage

### 3. `src/app/components/analytics/PageViewTracker.tsx`

- Custom page view tracking commented out
- **To re-enable**: Uncomment the analytics tracking code

### 4. `src/lib/utils/performance-monitoring.ts`

- Added `PERFORMANCE_MONITORING_ENABLED = false` flag
- All performance monitoring functions check this flag
- **To re-enable**: Set `PERFORMANCE_MONITORING_ENABLED = true`

## How to Re-enable Analytics

### Option 1: Re-enable All Analytics (Recommended)

1. Set `ANALYTICS_ENABLED = true` in `src/lib/utils/analytics.ts`
2. Set `PERFORMANCE_MONITORING_ENABLED = true` in `src/lib/utils/performance-monitoring.ts`
3. Uncomment the tracking code in `src/app/components/analytics/PageViewTracker.tsx`
4. Set `enabled={true}` for PerformanceMonitor in `src/app/layout.tsx`

### Option 2: Selective Re-enabling

You can selectively re-enable specific analytics features by modifying the individual flags:

```typescript
// In src/lib/utils/analytics.ts
const ANALYTICS_ENABLED = true; // Re-enable custom events

// In src/lib/utils/performance-monitoring.ts
const PERFORMANCE_MONITORING_ENABLED = true; // Re-enable performance tracking

// In src/app/components/analytics/PageViewTracker.tsx
// Uncomment the analytics.trackPageView call

// In src/app/components/analytics/PerformanceMonitor.tsx
// Change enabled default to true
```

## Cost Impact

With these changes:

- **Custom events**: 0 events sent (was ~50+ events per user session)
- **Performance metrics**: 0 metrics sent (was ~20+ metrics per page load)
- **Page views**: Still tracked by Vercel Analytics (basic tracking only)
- **Speed insights**: Still active (minimal cost impact)

## Monitoring

After re-enabling, monitor your Vercel Analytics dashboard to ensure costs remain within acceptable limits. Consider:

1. **Event volume**: Check how many custom events are being sent
2. **Cost trends**: Monitor daily/weekly cost changes
3. **Performance impact**: Ensure analytics don't affect app performance

## Rollback Plan

If costs become too high after re-enabling:

1. Set the flags back to `false`
2. Deploy the changes
3. Consider implementing event sampling or rate limiting

## Notes

- All code structure remains intact for easy re-enabling
- No breaking changes to existing components
- Analytics functions still exist but are no-ops when disabled
- Basic Vercel Analytics continues to provide essential page view data
