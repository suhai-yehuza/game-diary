# Vercel Speed Insights Implementation

This document describes the comprehensive Vercel Speed Insights implementation for the game-diary project, following the [official Vercel Speed Insights documentation](https://vercel.com/docs/speed-insights/quickstart#add-the-speedinsights-component-to-your-app).

## Overview

The Speed Insights implementation provides comprehensive performance monitoring and optimization insights for the game-diary application. It combines Vercel's official Speed Insights with custom performance monitoring to deliver detailed metrics and actionable insights.

## Setup

### 1. Package Installation

```bash
pnpm add @vercel/speed-insights
```

### 2. Speed Insights Component Integration

The `SpeedInsights` component has been added to the root layout (`src/app/layout.tsx`):

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. Enable Speed Insights in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click on the "Speed Insights" tab
3. Click "Enable" from the dialog
4. Deploy your application to activate performance tracking

## Performance Monitoring Architecture

### Core Components

1. **Vercel Speed Insights**: Official performance monitoring
2. **Custom Performance Monitoring**: Enhanced metrics and alerts
3. **Performance Hooks**: React hooks for component-level monitoring
4. **Performance Alerts**: Threshold-based alerting system

### Performance Metrics Tracked

#### Core Web Vitals

- **LCP (Largest Contentful Paint)**: Measures loading performance
- **FID (First Input Delay)**: Measures interactivity
- **CLS (Cumulative Layout Shift)**: Measures visual stability

#### Navigation Timing

- **TTFB (Time to First Byte)**: Server response time
- **FCP (First Contentful Paint)**: First content render
- **DOM Content Loaded**: DOM parsing completion
- **Window Load**: Full page load completion

#### Custom Metrics

- **Component Render Time**: React component performance
- **API Response Time**: Backend API performance
- **Bundle Size**: JavaScript bundle sizes
- **Memory Usage**: Browser memory consumption
- **Network Conditions**: Connection quality
- **Resource Load Times**: Asset loading performance

## Usage Examples

### Tracking Component Performance

```typescript
import { useComponentRenderTime } from '@/hooks/use-performance-monitoring';

function ExpensiveComponent({ data }) {
  useComponentRenderTime('ExpensiveComponent', {
    dataSize: data.length,
    complexity: data.length > 100 ? 'high' : 'low'
  });

  return <div>{/* Component content */}</div>;
}
```

### Monitoring API Performance

```typescript
import { useApiPerformanceMonitoring } from '@/hooks/use-performance-monitoring';

function GameLogsContainer() {
  const { measureApiCall } = useApiPerformanceMonitoring();

  const loadGameLogs = async () => {
    try {
      const logs = await measureApiCall(
        () => fetch('/api/game-logs').then(res => res.json()),
        '/api/game-logs',
        'GET'
      );
    } catch (error) {
      // Error response time also tracked
    }
  };
}
```

### Custom Performance Monitoring

```typescript
import { performanceMonitoring, performanceAlerts } from '@/lib/utils/performance-monitoring';

// Track custom metrics
performanceMonitoring.trackBundleSize('main', 245760);

// Monitor specific thresholds
performanceAlerts.monitor('apiResponseTime', 350);

// Track memory usage
performanceMonitoring.trackMemoryUsage();
```

## Performance Thresholds

The system uses Google's recommended Core Web Vitals thresholds:

### Core Web Vitals

- **LCP**: Good ≤ 2.5s, Needs Improvement ≤ 4s, Poor > 4s
- **FID**: Good ≤ 100ms, Needs Improvement ≤ 300ms, Poor > 300ms
- **CLS**: Good ≤ 0.1, Needs Improvement ≤ 0.25, Poor > 0.25

### Custom Thresholds

- **TTFB**: Good ≤ 800ms, Needs Improvement ≤ 1.8s, Poor > 1.8s
- **API Response Time**: Good ≤ 200ms, Needs Improvement ≤ 500ms, Poor > 500ms
- **Component Render Time**: Good ≤ 16ms, Needs Improvement ≤ 33ms, Poor > 33ms

## Viewing Performance Data

### Vercel Speed Insights Dashboard

1. Go to your Vercel project dashboard
2. Click the "Speed Insights" tab
3. View Core Web Vitals and performance metrics
4. Analyze performance trends over time

### Custom Analytics Dashboard

1. Go to your Vercel project dashboard
2. Click the "Analytics" tab
3. Filter by performance events
4. View custom performance metrics

## Next Steps

1. **Enable Speed Insights**: Enable Speed Insights in your Vercel dashboard
2. **Deploy**: Deploy your application to start collecting data
3. **Monitor**: Check the Speed Insights tab for performance data
4. **Optimize**: Use insights to optimize performance bottlenecks
5. **Alert**: Set up performance alerts for critical metrics

For more information, refer to the [Vercel Speed Insights documentation](https://vercel.com/docs/speed-insights).
