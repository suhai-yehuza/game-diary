'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useMenuContext } from '@/app/components/providers';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';

export default function HomePage() {
  const { isMenuExpanded } = useMenuContext();

  if (isMenuExpanded) return null;

  return (
    <section className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-[32px] row-start-2 items-center justify-center text-center max-w-3xl">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/logos/gamelog-large.svg"
            alt="Placeholder Logo"
            width={200}
            height={200}
            priority
            sizes="(max-width: 600px) 150px, 200px"
          />
          <h1 className="text-4xl font-bold tracking-tight">Placeholder</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track your gaming watching experiences, and connect with fellow sports fans
          </p>
        </div>

        <div className="flex gap-6 items-center justify-center mt-8">
          <Link
            href="/protected/user"
            className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/sports/all-sports"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Explore Sports
          </Link>
        </div>
      </div>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          href={SPORTS_CONFIG.nba ? '/sports/live' : '/sports/live'}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/icons/globe.svg"
            alt="Live games icon"
            width={16}
            height={16}
            sizes="16px"
          />
          Live Games
        </Link>
        <Link
          href={SPORTS_CONFIG.nba ? '/sports/all-sports' : '/sports/all-sports'}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/icons/shared-svg-components.svg"
            alt="Sports icon"
            width={16}
            height={16}
            sizes="16px"
          />
          All Sports
        </Link>
      </footer>
    </section>
  );
}
