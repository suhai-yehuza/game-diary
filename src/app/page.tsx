import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-[32px] row-start-2 items-center justify-center text-center max-w-3xl">
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
          <Link href="/protected/user" passHref legacyBehavior>
            <a className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Go to Dashboard
            </a>
          </Link>
          <Link href="/sign-in" passHref legacyBehavior>
            <a className="px-6 py-3 bg-[#757575] text-white rounded-lg hover:bg-[#616161] border border-gray-600 transition-colors dark:bg-[#e5e5e5] dark:text-gray-800 dark:hover:bg-[#d4d4d4] dark:border-gray-300">
              Sign In
            </a>
          </Link>
          <Link href="/sign-up" passHref legacyBehavior>
            <a className="px-6 py-3 border border-[#757575] text-[#757575] rounded-lg hover:bg-[#f3f3f3] transition-colors dark:border-[#e5e5e5] dark:text-[#e5e5e5] dark:hover:bg-[#232326]">
              Sign Up
            </a>
          </Link>
        </div>
      </div>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="flex items-center gap-2 hover:underline hover:underline-offset-4">
            <Image aria-hidden src="/icons/file.svg" alt="File icon" width={16} height={16} />
            How to log a game
          </a>
        </Link>
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="flex items-center gap-2 hover:underline hover:underline-offset-4">
            <Image aria-hidden src="/icons/window.svg" alt="Window icon" width={16} height={16} />
            Example game logs
          </a>
        </Link>
      </footer>
    </section>
  );
}
