'use client';

import { useTheme } from 'next-themes';
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
    <div className="max-w-5xl mx-auto px-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center md:text-left">
        {/* About Section */}
        <div>
          <ul className="flex flex-col items-center md:items-start gap-1 mt-0">
            <li>
              <a href="#news" className={linkClass}>
                News
              </a>
            </li>
          </ul>
        </div>
        {/* Help Section */}
        <div>
          <ul className="flex flex-col items-center md:items-start gap-1 mt-0">
            <li>
              <a href="#contact" className={linkClass}>
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        {/* Social Links */}
        <div>
          <ul className="flex flex-col items-center md:items-start gap-1 mt-0">
            <li>
              <a
                href="https://twitter.com/yourprofile"
                className={linkClass + ' flex items-center gap-2'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterIcon className="inline-block align-middle" /> Twitter
              </a>
            </li>
          </ul>
        </div>
        {/* Legal */}
        <div>
          <ul className="flex flex-col items-center md:items-start gap-1 mt-0">
            <li>
              <a
                href="/terms-of-service"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Render a static, neutral footer to avoid empty space or flash
  if (!mounted) {
    return (
      <footer
        data-testid="footer"
        className="w-full border-t border-border bg-background text-foreground py-2 text-xs"
      >
        <FooterSections linkClass="hover:text-primary transition-colors block py-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded" />
        <div className="max-w-5xl mx-auto px-2 mt-2 text-center text-muted-foreground text-xs opacity-80">
          &copy; {new Date().getFullYear()} Placeholder. Made with{' '}
          <span aria-label="love" role="img">
            ❤️
          </span>{' '}
          by the Placeholder Team.
        </div>
      </footer>
    );
  }

  // Hydrated: Use inverted theme colors
  const isDark = resolvedTheme === 'dark';
  const bgClass = isDark
    ? 'bg-white text-gray-900 border-gray-200'
    : 'bg-gray-900 text-gray-100 border-gray-700';
  const linkClass = `hover:text-blue-600 transition-colors block py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${isDark ? 'text-gray-900' : 'text-gray-100'}`;
  const mutedTextClass = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <footer data-testid="footer" className={`w-full border-t py-2 text-xs ${bgClass}`}>
      <FooterSections linkClass={linkClass} />
      <div
        className={`max-w-5xl mx-auto px-2 mt-2 text-center ${mutedTextClass} text-xs opacity-80`}
      >
        &copy; {new Date().getFullYear()} Placeholder. Made with{' '}
        <span aria-label="love" role="img">
          ❤️
        </span>{' '}
        by the Placeholder Team.
      </div>
    </footer>
  );
}
