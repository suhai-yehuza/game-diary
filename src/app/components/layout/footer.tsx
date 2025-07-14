'use client';

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Render a static, neutral footer to avoid empty space or flash
  if (!mounted) {
    return (
      <footer className="w-full border-t pt-1 pb-1 mt-1 bg-neutral-200 text-neutral-900 border-neutral-300">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center md:text-left">
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-700 uppercase">
                About
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a
                    href="#about"
                    className="hover:text-emerald-600 transition-colors block py-0.5"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#news" className="hover:text-emerald-600 transition-colors block py-0.5">
                    News
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-700 uppercase">
                Help
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#api" className="hover:text-emerald-600 transition-colors block py-0.5">
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-emerald-600 transition-colors block py-0.5"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-700 uppercase">
                Follow Us
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a
                    href="#twitter"
                    className="hover:text-emerald-600 transition-colors block py-0.5"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#github"
                    className="hover:text-emerald-600 transition-colors block py-0.5"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-700 uppercase">
                Legal
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a
                    href="#privacy"
                    className="hover:text-emerald-600 transition-colors block py-0.5"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="hover:text-emerald-600 transition-colors block py-0.5"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Hydrated: Use the correct theme
  const isDark = resolvedTheme === 'dark';
  return (
    <footer
      className={`w-full border-t pt-1 pb-1 mt-1 ${
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
                <a href="#about" className="hover:text-emerald-400 transition-colors block py-0.5">
                  About Us
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-emerald-400 transition-colors block py-0.5">
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
                <a href="#api" className="hover:text-emerald-400 transition-colors block py-0.5">
                  API
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-emerald-400 transition-colors block py-0.5"
                >
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
                  href="#twitter"
                  className="hover:text-emerald-400 transition-colors block py-0.5"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a href="#github" className="hover:text-emerald-400 transition-colors block py-0.5">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold mb-2 tracking-wide text-neutral-100 uppercase">
              Legal
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="#privacy"
                  className="hover:text-emerald-400 transition-colors block py-0.5"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-emerald-400 transition-colors block py-0.5">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
