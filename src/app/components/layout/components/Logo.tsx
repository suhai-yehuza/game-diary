import Image from 'next/image';
import Link from 'next/link';

interface ILogoProps {
  isMenuExpanded: boolean;
}

export function Logo({ isMenuExpanded }: ILogoProps) {
  // Logo - Left (hide when menu is open as overlay, and only show on large screens)
  if (isMenuExpanded) {
    return null;
  }

  return (
    <div className="pl-10 hidden lg:flex items-center">
      <Link href="/" className="min-w-[44px] min-h-[44px] flex items-center justify-center">
        <Image
          src="/logos/gamelog-large.svg"
          alt="Game Diary Logo"
          width={44}
          height={44}
          sizes="(max-width: 600px) 36px, 44px"
          loading="eager"
          priority
          className="w-11 h-11 cursor-pointer"
        />
      </Link>
    </div>
  );
}
