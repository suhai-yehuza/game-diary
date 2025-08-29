'use client';

import { Globe, Trophy, TrendingUp, Calendar, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense } from 'react';

import { CardSkeleton } from '@/app/components/common/LoadingSpinner';
import { ContentPreviewBanner } from '@/app/components/landing/ContentPreviewBanner';
import { IntegratedGameLogs } from '@/app/components/landing/IntegratedGameLogs';
import { IntegratedGames } from '@/app/components/landing/IntegratedGames';
import { useMenuContext } from '@/app/components/providers';

export default function HomePage() {
  const { isMenuExpanded } = useMenuContext();

  if (isMenuExpanded) return null;

  return (
    <div className="home-page-gradient">
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
                href="/protected/user"
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
            <div className="flex justify-center">
              <button
                onClick={() => {
                  // Responsive scroll based on viewport height
                  const viewportHeight = window.innerHeight;
                  const isMobile = window.innerWidth < 768;

                  // Calculate scroll position based on viewport height
                  const targetScroll = isMobile ? viewportHeight * 0.9 : viewportHeight;

                  window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth',
                  });
                }}
                className="flex flex-col items-center gap-2 animate-bounce hover:scale-105 transition-transform duration-200 cursor-pointer group"
              >
                <ArrowDown className="w-5 h-5 text-black group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors duration-200" />
                <span className="text-xs text-black dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200">
                  See what&apos;s happening
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Preview Banner - Integrated with hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <ContentPreviewBanner />
        </div>
      </section>

      {/* Content Sections - Reduced spacing for better flow */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        data-section="trending-latest-results"
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          data-section="main-content-grid"
        >
          {/* Trending Game Logs Section */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-brand-secondary to-brand-secondary-dark p-6 text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <h2 className="text-xl font-bold">Trending Game Logs</h2>
              </div>
              <p className="text-white/90 mt-1">See what&apos;s hot in the community</p>
            </div>

            <div className="p-6">
              <Suspense fallback={<CardSkeleton />}>
                <IntegratedGameLogs />
              </Suspense>
            </div>
          </section>

          {/* Finished Games Section */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary-light p-6 text-white">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <h2 className="text-xl font-bold">Recent Games</h2>
              </div>
              <p className="text-white/90 mt-1">Latest results and scores</p>
            </div>

            <div className="p-6">
              <Suspense fallback={<CardSkeleton />}>
                <IntegratedGames />
              </Suspense>
            </div>
          </section>
        </div>

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
                href="/protected/user"
                className="inline-block px-8 py-4 bg-white text-brand-primary rounded-lg hover:bg-neutral-100 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
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
