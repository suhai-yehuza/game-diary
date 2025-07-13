'use client';

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  const isDark = resolvedTheme === 'dark';
  return (
    <footer
      className={`w-full border-t pt-2 pb-1 mt-2 ${
        isDark
          ? 'bg-neutral-100 text-neutral-900 border-neutral-200'
          : 'bg-neutral-900 text-neutral-300 border-neutral-800'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center md:text-left">
          {/* About Section */}
          <div>
            <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-100 uppercase">
              About
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="#about" className="hover:text-emerald-400 transition-colors block py-1">
                  About Us
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-emerald-400 transition-colors block py-1">
                  News
                </a>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-100 uppercase">
              Help
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="#api" className="hover:text-emerald-400 transition-colors block py-1">
                  API
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-400 transition-colors block py-1">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-100 uppercase">
              Follow Us
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors block py-1"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="inline"
                  >
                    <path d="M17.53 2.477h3.564l-7.784 8.89 9.162 10.156h-7.19l-5.64-6.25-8.09 9.25h-3.58l8.32-9.52-8.7-9.78h7.23l5.13 5.7zm-1.13 16.07h1.98l-6.36-7.06-1.98-2.2-5.13-5.7h-1.98l6.36 7.06 1.98 2.2z" />
                  </svg>
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors block py-1"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="inline"
                  >
                    <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.12C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.386.566a2.994 2.994 0 0 0-2.112 2.12C0 8.353 0 12 0 12s0 3.647.502 5.814a2.994 2.994 0 0 0 2.112 2.12C4.772 20.5 12 20.5 12 20.5s7.228 0 9.386-.566a2.994 2.994 0 0 0 2.112-2.12C24 15.647 24 12 24 12s0-3.647-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright Section */}
          <div>
            <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-100 uppercase">
              Legal
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="#privacy" className="hover:text-emerald-400 transition-colors block py-1">
                  Privacy Policy
                </a>
              </li>
              <li>
                <span className="opacity-60">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 dark:border-neutral-200 mt-2 pt-1 text-[10px] text-neutral-500 dark:text-neutral-600 text-center">
          © {new Date().getFullYear()} Game Diary. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
