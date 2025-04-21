'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import React from 'react';
export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const { user } = useUser();
  const userName = user?.username || user?.firstName || user?.emailAddresses[0].emailAddress;
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center text-center">
        <h1 className="text-2xl font-bold">
          {isLoaded && isSignedIn
            ? `You are logged in as ${userName}`
            : '🚧 ... Work in progress ... 🚧'}
        </h1>
        <div className="flex gap-4 items-center justify-center">
          {isLoaded && isSignedIn ? (
            '🚧 ... Work in progress to enable logging games ... 🚧'
          ) : (
            <a
              href="https://game-diary-git-syehuza-demo-suhais-projects-33a81a2a.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Visit our staging site for our WIP
            </a>
          )}
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
