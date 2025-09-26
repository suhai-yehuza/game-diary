import { Globe, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense } from 'react';

import { BackgroundCacheWarmer } from '@/app/components/landing/BackgroundCacheWarmer';
import { ContentPreviewBannerOptimized } from '@/app/components/landing/ContentPreviewBannerOptimized';
import { LandingPageDataSection } from '@/app/components/landing/LandingPageDataSection';
import { LiveGamesIndicator } from '@/app/components/landing/LiveGamesIndicator';
import { ScrollToContentButton } from '@/app/components/landing/ScrollToContentButton';
import { FadeIn, HoverAnimation } from '@/app/components/ui/micro-interactions';
import { SkeletonCard } from '@/app/components/ui/skeleton';

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* Background cache warmer - runs after page loads */}
      <BackgroundCacheWarmer />

      {/* Hero Section with enhanced animations */}
      <FadeIn>
        <section className="relative overflow-hidden py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <FadeIn delay={100}>
                <div className="flex justify-center mb-6 sm:mb-8">
                  <Image
                    src="/logos/gamelog-large.svg"
                    alt="Game Diary Logo"
                    width={200}
                    height={200}
                    priority={true}
                    sizes="(max-width: 480px) 120px, (max-width: 768px) 150px, 200px"
                    className="w-[120px] h-[120px] xs:w-[150px] xs:h-[150px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] drop-shadow-lg"
                  />
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
                  Game Diary
                </h1>
              </FadeIn>

              <FadeIn delay={300}>
                <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-theme-primary max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed home-description px-4 sm:px-0">
                  Track your gaming watching experiences, connect with fellow sports fans, and share
                  your thoughts on live games across NBA, NFL, MLB, NHL, and MLS.
                </p>
              </FadeIn>

              <div className="mobile-button-container justify-center items-center mb-8 sm:mb-12">
                {/* Primary CTA - Most prominent */}
                <FadeIn delay={400}>
                  <HoverAnimation>
                    <Link
                      href="/sports/all-sports"
                      className="mobile-button px-4 xs:px-6 sm:px-10 py-3 xs:py-4 sm:py-5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/30 focus:ring-offset-2 font-semibold text-sm xs:text-base sm:text-xl shadow-2xl hover:shadow-3xl min-h-touch-xl text-center hover-lift"
                    >
                      Explore Sports
                    </Link>
                  </HoverAnimation>
                </FadeIn>

                {/* Secondary CTA - Less prominent */}
                <FadeIn delay={550}>
                  <HoverAnimation>
                    <Link
                      href="/protected/dashboard"
                      className="mobile-button px-3 xs:px-5 sm:px-8 py-2 xs:py-3 sm:py-4 bg-transparent border-2 border-brand-secondary text-brand-secondary rounded-xl hover:bg-brand-secondary hover:text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-secondary/30 focus:ring-offset-2 font-medium text-sm xs:text-base sm:text-lg shadow-lg hover:shadow-xl min-h-touch text-center hover-lift"
                    >
                      Go to Dashboard
                    </Link>
                  </HoverAnimation>
                </FadeIn>
              </div>

              <FadeIn delay={500}>
                {/* Dynamic live games indicator */}
                <LiveGamesIndicator />
              </FadeIn>

              <FadeIn delay={600}>
                {/* Quick Links */}
                <div className="flex flex-wrap gap-6 items-center justify-center text-sm mb-8">
                  <HoverAnimation>
                    <Link
                      href="/sports/live"
                      className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200 text-theme-secondary hover:text-brand-primary font-medium"
                    >
                      <Globe className="w-4 h-4" aria-hidden />
                      Live Games
                    </Link>
                  </HoverAnimation>
                  <HoverAnimation>
                    <Link
                      href="/sports/all-sports"
                      className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200 text-theme-secondary hover:text-brand-secondary font-medium"
                    >
                      <Trophy className="w-4 h-4" aria-hidden />
                      All Sports
                    </Link>
                  </HoverAnimation>
                </div>
              </FadeIn>

              <FadeIn delay={700}>
                {/* Clickable Scroll Indicator */}
                <ScrollToContentButton />
              </FadeIn>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Content Preview Banner */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContentPreviewBannerOptimized />
        </div>
      </section>

      {/* Content Sections - Progressive loading with immediate UI */}
      <div
        className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8"
        data-section="trending-latest-results"
      >
        <Suspense fallback={<SkeletonCard />}>
          <LandingPageDataSection />
        </Suspense>

        {/* Connecting Element */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="w-px h-16 bg-border" />
        </div>

        {/* Call to Action Section - Enhanced with better flow */}
        <section className="text-center">
          <div className="bg-brand-primary rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Ready to Start Your Game Diary?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Join thousands of sports fans who are already tracking their game experiences and
              connecting with the community.
            </p>
            <Link
              href="/protected/dashboard"
              className="inline-block px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
