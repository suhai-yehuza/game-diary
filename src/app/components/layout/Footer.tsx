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
      <footer className="w-full border-t border-border bg-background text-foreground py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center md:text-left">
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-muted-foreground uppercase">
                About
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#about" className="hover:text-primary transition-colors block py-0.5">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#news" className="hover:text-primary transition-colors block py-0.5">
                    News
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-muted-foreground uppercase">
                Help
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#api" className="hover:text-primary transition-colors block py-0.5">
                    API
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-primary transition-colors block py-0.5">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-muted-foreground uppercase">
                Follow Us
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#twitter" className="hover:text-primary transition-colors block py-0.5">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#github" className="hover:text-primary transition-colors block py-0.5">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 tracking-wide text-muted-foreground uppercase">
                Legal
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="#privacy" className="hover:text-primary transition-colors block py-0.5">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-primary transition-colors block py-0.5">
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

  // Hydrated: Use inverted theme colors
  const isDark = resolvedTheme === 'dark';
  return (
    <footer
      className={`w-full border-t py-4 ${
        isDark
          ? 'bg-white text-gray-900 border-gray-200'
          : 'bg-gray-900 text-gray-100 border-gray-700'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-center md:text-left">
          {/* About Section */}
          <div>
            <h3
              className={`text-xs font-bold mb-2 tracking-wide uppercase ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              About
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="#about"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#news"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  News
                </a>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3
              className={`text-xs font-bold mb-2 tracking-wide uppercase ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              Help
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="#api"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3
              className={`text-xs font-bold mb-2 tracking-wide uppercase ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              Follow Us
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="#twitter"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#github"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className={`text-xs font-bold mb-2 tracking-wide uppercase ${
                isDark ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              Legal
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a
                  href="#privacy"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className={`hover:text-blue-600 transition-colors block py-0.5 ${
                    isDark ? 'text-gray-900' : 'text-gray-100'
                  }`}
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
