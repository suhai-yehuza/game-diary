'use client';

import { ArrowDown } from 'lucide-react';

export function ScrollToContentButton() {
  const handleScroll = () => {
    // Responsive scroll based on viewport height
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth < 768;

    // Calculate scroll position based on viewport height
    const targetScroll = isMobile ? viewportHeight * 0.9 : viewportHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleScroll}
        className="flex flex-col items-center gap-2 animate-bounce hover:scale-105 transition-transform duration-200 cursor-pointer group"
      >
        <ArrowDown className="w-5 h-5 text-theme-secondary group-hover:text-theme-primary transition-colors duration-200" />
        <span className="text-xs text-theme-secondary group-hover:text-theme-primary transition-colors duration-200">
          See what&apos;s happening
        </span>
      </button>
    </div>
  );
}
