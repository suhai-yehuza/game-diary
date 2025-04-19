'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import useMounted from '@/hooks/use-mounted';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center text-center max-w-3xl">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/gamelog-large.svg"
            alt="Game Diary Logo"
            width={64}
            height={64}
            className="w-16 h-16"
          />
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Game Diary</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your personal space to track and share your pro game watching experiences
          </p>
        </div>

        <div className="flex gap-6 items-center justify-center mt-8">
          {isLoaded &&
            mounted &&
            (isSignedIn ? (
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          How to log a game
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Example game logs
        </a>
      </footer>
    </div>
  );
}
