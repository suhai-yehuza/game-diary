'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useMounted } from '@/hooks/use-mounted';

export function HomePage() {
  const { isLoaded, isSignedIn } = useUser();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  // Don't block rendering if auth is not loaded yet
  const showAuthState = isLoaded;

  try {
    // ... existing code ...
  } catch (error) {
    if (error instanceof Error) {
      // handle error.message or similar
    } else {
      // handle unknown error
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center text-center max-w-3xl">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/logos/gamelog-large.svg"
            alt="Game Diary Logo"
            width={200}
            height={50}
            priority
          />
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Game Diary</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your personal space to track and share your pro game watching experiences
          </p>
        </div>

        <div className="flex gap-6 items-center justify-center mt-8">
          {showAuthState ? (
            isSignedIn ? (
              <Link
                href="/protected/user"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/sign-in"
                  className="px-6 py-3 bg-[#757575] text-white rounded-lg hover:bg-[#616161] border border-gray-600 transition-colors dark:bg-[#e5e5e5] dark:text-gray-800 dark:hover:bg-[#d4d4d4] dark:border-gray-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-3 border border-[#757575] text-[#757575] rounded-lg hover:bg-[#f3f3f3] transition-colors dark:border-[#e5e5e5] dark:text-[#e5e5e5] dark:hover:bg-[#232326]"
                >
                  Sign Up
                </Link>
              </div>
            )
          ) : (
            // Show default state while auth is loading
            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="px-6 py-3 bg-[#757575] text-white rounded-lg hover:bg-[#616161] border border-gray-600 transition-colors dark:bg-[#e5e5e5] dark:text-gray-800 dark:hover:bg-[#d4d4d4] dark:border-gray-300"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-3 border border-[#757575] text-[#757575] rounded-lg hover:bg-[#f3f3f3] transition-colors dark:border-[#e5e5e5] dark:text-[#e5e5e5] dark:hover:bg-[#232326]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/dashboard"
        >
          <Image aria-hidden src="/icons/file.svg" alt="File icon" width={16} height={16} />
          How to log a game
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/dashboard"
        >
          <Image aria-hidden src="/icons/window.svg" alt="Window icon" width={16} height={16} />
          Example game logs
        </Link>
      </footer>
    </div>
  );
}
