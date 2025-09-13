'use client';

import React, { useEffect, useState } from 'react';

function TwitterIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path d="M22.46 5.924c-.793.352-1.646.59-2.542.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.08A4.48 4.48 0 0 0 11.1 9.03c0 .352.04.695.116 1.022C7.728 9.89 4.1 8.1 1.67 5.149a4.48 4.48 0 0 0-.607 2.254c0 1.555.792 2.927 2.002 3.733a4.47 4.47 0 0 1-2.03-.561v.057a4.48 4.48 0 0 0 3.6 4.393c-.193.052-.397.08-.607.08-.148 0-.292-.014-.432-.04a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.67 12.67 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.77 0-.195-.004-.39-.013-.583a9.1 9.1 0 0 0 2.24-2.3z" />
    </svg>
  );
}

function FooterSections({ linkClass }: { linkClass: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4 text-sm">
        {/* Left side links */}
        <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-1">
          <a href="#news" className={linkClass}>
            News
          </a>
          <a href="#contact" className={linkClass}>
            Contact Us
          </a>
          <a
            href="https://twitter.com/yourprofile"
            className={linkClass + ' flex items-center gap-2'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <TwitterIcon className="inline-block align-middle" />
            <span className="hidden sm:inline">Twitter</span>
          </a>
        </div>

        {/* Center - AI statement with leaf icon */}
        <div className="flex items-center gap-2 text-theme-muted order-3 sm:order-2 text-center">
          <svg
            className="w-4 h-4 text-semantic-success flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs sm:text-sm">Bringing the extra fun to sports</span>
        </div>

        {/* Right side links */}
        <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3">
          <a href="/privacy" className={linkClass}>
            Privacy
          </a>
          <a href="/terms-of-service" className={linkClass}>
            Terms
          </a>
          <a href="/settings" className={linkClass}>
            Settings
          </a>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Render a static, neutral footer to avoid empty space or flash
  if (!mounted) {
    return (
      <footer
        data-testid="footer"
        className="w-full text-theme-muted py-2 text-sm border-t border-theme-primary"
      >
        <FooterSections linkClass="hover:text-theme-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded" />
      </footer>
    );
  }

  // Hydrated: Use Google-inspired footer styling
  const linkClass = `hover:text-theme-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded text-theme-muted`;

  return (
    <footer
      data-testid="footer"
      className="w-full py-2 text-sm text-theme-muted border-t border-theme-primary"
    >
      <FooterSections linkClass={linkClass} />
    </footer>
  );
}
