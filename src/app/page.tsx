"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center text-center">
        <h1 className="text-2xl font-bold">
          {isLoaded && isSignedIn ? "You are now logged in" : "🚧 ... Work in progress ... 🚧"}
        </h1>
        <div className="flex gap-4 items-center justify-center">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://game-diary-git-syehuza-dev-suhais-projects-33a81a2a.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            {!isSignedIn && (
              <Image
                src="/gamelog.svg"
                alt="logomark"
                width={20}
                height={20}
              />
            )}
            {isLoaded && isSignedIn ? "🚧 ... You will be able to log games soon ... 🚧" : "Visit our staging site for our WIP"}
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          How to log a game
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Example game logs
        </a>
      </footer>
    </div>
  );
}
