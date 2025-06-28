'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* About Section */}
          <div>
            <h3 className="text-xs font-semibold mb-2">About</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Navigate to About Us */
                  }}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Navigate to News */
                  }}
                >
                  News
                </button>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-xs font-semibold mb-2">Help</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Navigate to API */
                  }}
                >
                  API
                </button>
              </li>
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Navigate to Contact */
                  }}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xs font-semibold mb-2">Follow Us</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Open X/Twitter */
                  }}
                >
                  X
                </button>
              </li>
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Open YouTube */
                  }}
                >
                  YouTube
                </button>
              </li>
            </ul>
          </div>

          {/* Copyright Section */}
          <div>
            <h3 className="text-xs font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>
                <button
                  className="hover:text-blue-600 text-left"
                  onClick={() => {
                    /* TODO: Navigate to Privacy Policy */
                  }}
                >
                  Privacy Policy
                </button>
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
