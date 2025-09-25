import { ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { FadeIn, StaggerAnimation, HoverAnimation } from './micro-interactions';
import { SkeletonCard } from './skeleton';

// Enhanced hero section with better animations
export const EnhancedHero = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    secondaryCtaText?: string;
    secondaryCtaHref?: string;
  }
>(
  (
    { className, title, subtitle, ctaText, ctaHref, secondaryCtaText, secondaryCtaHref, ...props },
    ref
  ) => (
    <section
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-background via-background to-muted/20',
        'py-16 sm:py-24 lg:py-32',
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {title}
            </h1>
          </FadeIn>

          <FadeIn delay={100}>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </FadeIn>

          <StaggerAnimation delay={200} stagger={150}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HoverAnimation>
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-brand-primary text-theme-inverse hover:bg-brand-primary-hover h-11 px-8 w-full sm:w-auto text-lg px-8 py-4 hover-lift"
                >
                  {ctaText}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </HoverAnimation>

              {secondaryCtaText && secondaryCtaHref && (
                <HoverAnimation>
                  <Link
                    href={secondaryCtaHref}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-bg-theme-secondary hover:bg-bg-theme-tertiary text-theme-primary h-11 px-8 w-full sm:w-auto text-lg px-8 py-4 hover-lift"
                  >
                    {secondaryCtaText}
                  </Link>
                </HoverAnimation>
              )}
            </div>
          </StaggerAnimation>
        </div>
      </div>
    </section>
  )
);
EnhancedHero.displayName = 'EnhancedHero';

// Enhanced stats section
export const EnhancedStats = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    stats: Array<{
      label: string;
      value: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
    loading?: boolean;
  }
>(({ className, stats, loading = false, ...props }, ref) => (
  <section ref={ref} className={cn('py-16 bg-muted/30', className)} {...props}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <StaggerAnimation delay={100}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, _i) => (
                <SkeletonCard key={`skeleton-stat-${Math.random()}`} className="text-center p-6" />
              ))
            : stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <HoverAnimation key={`stat-${stat.label}`} scale={1.05}>
                    <div className="text-center p-6 rounded-lg bg-card border hover-lift">
                      <Icon className="h-8 w-8 mx-auto mb-4 text-brand-primary" />
                      <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </HoverAnimation>
                );
              })}
        </div>
      </StaggerAnimation>
    </div>
  </section>
));
EnhancedStats.displayName = 'EnhancedStats';

// Enhanced feature cards
export const EnhancedFeatureCards = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    features: Array<{
      title: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
      color: string;
    }>;
    loading?: boolean;
  }
>(({ className, features, loading = false, ...props }, ref) => (
  <section ref={ref} className={cn('py-16', className)} {...props}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose Game Diary?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best in sports community features
          </p>
        </div>
      </FadeIn>

      <StaggerAnimation delay={200}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, _i) => (
                <SkeletonCard key={`skeleton-feature-${Math.random()}`} className="p-6" />
              ))
            : features.map(feature => {
                const Icon = feature.icon;
                return (
                  <HoverAnimation key={`feature-${feature.title}`} scale={1.02}>
                    <div className="p-6 rounded-lg border bg-card hover-lift group">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                          feature.color
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </HoverAnimation>
                );
              })}
        </div>
      </StaggerAnimation>
    </div>
  </section>
));
EnhancedFeatureCards.displayName = 'EnhancedFeatureCards';

// Enhanced content preview with better loading
export const EnhancedContentPreview = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data?: {
      trendingContent?: Array<{ id: string; title: string; description: string }>;
      recentGames?: Array<{ id: string; title: string; date: string }>;
      popularGames?: Array<{ id: string; title: string; players: number }>;
    };
    loading?: boolean;
  }
>(({ className, data, loading = false, ...props }, ref) => (
  <section ref={ref} className={cn('py-16 bg-muted/20', className)} {...props}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Live Community Activity
          </h2>
          <p className="text-lg text-muted-foreground">
            See what&apos;s happening in the sports community right now
          </p>
        </div>
      </FadeIn>

      <StaggerAnimation delay={200}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <>
              <SkeletonCard className="p-6" />
              <SkeletonCard className="p-6" />
            </>
          ) : (
            <>
              <HoverAnimation>
                <div className="p-6 rounded-lg border bg-card hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Trending Now</h3>
                  </div>
                  {data?.trendingContent ? (
                    <div className="space-y-3">{/* Trending content */}</div>
                  ) : (
                    <p className="text-muted-foreground">No trending content yet</p>
                  )}
                </div>
              </HoverAnimation>

              <HoverAnimation>
                <div className="p-6 rounded-lg border bg-card hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Recent Games</h3>
                  </div>
                  {data?.recentGames ? (
                    <div className="space-y-3">{/* Recent games */}</div>
                  ) : (
                    <p className="text-muted-foreground">No recent games</p>
                  )}
                </div>
              </HoverAnimation>
            </>
          )}
        </div>
      </StaggerAnimation>
    </div>
  </section>
));
EnhancedContentPreview.displayName = 'EnhancedContentPreview';
