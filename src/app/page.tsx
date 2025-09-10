import { Globe, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense } from 'react';

import { CardSkeleton } from '@/app/components/common/LoadingSpinner';
import { BackgroundCacheWarmer } from '@/app/components/landing/BackgroundCacheWarmer';
import { ContentPreviewBannerOptimized } from '@/app/components/landing/ContentPreviewBannerOptimized';
import { LandingPageDataSection } from '@/app/components/landing/LandingPageDataSection';
import { ScrollToContentButton } from '@/app/components/landing/ScrollToContentButton';

export default function HomePage() {
  return (
    <div className="home-page-gradient">
      {/* Background cache warmer - runs after page loads */}
      <BackgroundCacheWarmer />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/logos/gamelog-large.svg"
                alt="Game Diary Logo"
                width={200}
                height={200}
                priority={true}
                sizes="(max-width: 600px) 150px, 200px"
                className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] drop-shadow-lg"
              />
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Game Diary
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed home-description px-4 sm:px-0">
              Track your gaming watching experiences, connect with fellow sports fans, and share
              your thoughts on live games across NBA, NFL, MLB, NHL, and MLS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center mb-12">
              <Link
                href="/protected/dashboard"
                className="px-8 py-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 font-medium shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/sports/all-sports"
                className="px-8 py-4 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary-dark transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 font-medium shadow-lg hover:shadow-xl"
              >
                Explore Sports
              </Link>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-6 items-center justify-center text-sm mb-8">
              <Link
                href="/sports/live"
                className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200 text-black dark:text-white hover:text-brand-primary dark:hover:text-brand-primary"
              >
                <Globe className="w-4 h-4" aria-hidden />
                Live Games
              </Link>
              <Link
                href="/sports/all-sports"
                className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200 text-black dark:text-white hover:text-brand-secondary dark:hover:text-brand-secondary"
              >
                <Trophy className="w-4 h-4" aria-hidden />
                All Sports
              </Link>
            </div>

            {/* Clickable Scroll Indicator */}
            <ScrollToContentButton />
          </div>
        </div>

        {/* Content Preview Banner - Integrated with hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <ContentPreviewBannerOptimized />
        </div>
      </section>

      {/* Content Sections - Progressive loading with immediate UI */}
      <div
        className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8"
        data-section="trending-latest-results"
      >
        <Suspense fallback={<CardSkeleton />}>
          <LandingPageDataSection />
        </Suspense>

        {/* Connecting Element */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        </div>

        {/* Call to Action Section - Enhanced with better flow */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-secondary rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Start Your Game Diary?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of sports fans who are already tracking their game experiences and
                connecting with the community.
              </p>
              <Link
                href="/protected/dashboard"
                className="inline-block px-8 py-4 bg-white !text-black rounded-lg hover:bg-neutral-100 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
