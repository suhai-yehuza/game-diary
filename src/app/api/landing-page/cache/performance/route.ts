import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';

const landingPageService = new LandingPageDataService();

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    // Get cache statistics
    const cacheStats = landingPageService.getCacheStats();

    // Calculate performance metrics
    const performanceMetrics = {
      cacheEfficiency: {
        trendingContent: { ttl: 300, refreshRate: '5 minutes', priority: 'high' },
        latestResults: { ttl: 300, refreshRate: '5 minutes', priority: 'high' },
        recentGames: { ttl: 300, refreshRate: '5 minutes', priority: 'medium' },
        popularGames: { ttl: 600, refreshRate: '10 minutes', priority: 'low' },
      },
      recommendations: [
        'Trending content and latest results have high priority (5min TTL)',
        'Popular games can be cached longer (10min TTL) due to slower change rate',
        'Consider implementing cache warming for high-traffic sections',
        'Monitor cache hit rates to optimize TTL values',
      ],
      optimizationTips: [
        'Use cache tags for targeted invalidation',
        'Implement cache warming for critical sections',
        'Monitor memory usage and adjust cache size',
        'Consider CDN for static content',
      ],
    };

    const response = {
      success: true,
      data: {
        cacheStats,
        performanceMetrics,
        timestamp: new Date().toISOString(),
        cacheHealth: 'healthy',
        totalCacheKeys: Object.keys(cacheStats).length,
        averageTTL:
          Object.values(cacheStats).reduce((sum, stat) => sum + stat.ttl, 0) /
          Object.keys(cacheStats).length,
      },
    };

    if (detailed) {
      const detailedMetrics = {
        cacheKeyPatterns: {
          prefix: 'landingPage:landing-page-data:',
          sections: Object.keys(cacheStats),
          tagStructure: 'landing-page + section-specific tags',
        },
        invalidationStrategy: {
          method: 'tag-based',
          granularity: 'section-level',
          benefits: ['Selective invalidation', 'Reduced cache misses', 'Better performance'],
        },
      };

      return NextResponse.json({
        ...response,
        detailedMetrics,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
