'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* About Section */}
          <div>
            <h3 className="text-xs font-semibold mb-2">About</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  News
                </a>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-xs font-semibold mb-2">Help</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xs font-semibold mb-2">Follow Us</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  X
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright Section */}
          <div>
            <h3 className="text-xs font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li className="text-[10px] text-gray-500 mt-2">
                © {new Date().getFullYear()} Game Diary. All rights reserved.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
