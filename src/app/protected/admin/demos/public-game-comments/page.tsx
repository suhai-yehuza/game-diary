'use client';

import React, { useState } from 'react';

import { PublicGameComments } from '@/app/components/comments/PublicGameComments';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function AdminPublicGameCommentsDemoPage() {
  const [gameId, setGameId] = useState('');
  const [showComments, setShowComments] = useState(false);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Game Comments Demo</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Demo of optimized public comments for unauthenticated users. This component provides
              public comment viewing and creation without requiring authentication.
            </p>
          </div>

          {/* Admin Notice */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Admin Demo</h3>
                <p className="mt-1 text-sm text-blue-700">
                  This demo showcases the PublicGameComments component for unauthenticated users.
                  Use it to test public comment functionality and validate the optimized public
                  comment system.
                </p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Demo Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-2">
                  Game ID
                </label>
                <input
                  id="gameId"
                  type="text"
                  value={gameId}
                  onChange={e => setGameId(e.target.value)}
                  placeholder="Enter a game ID to test public comments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter a game ID to test the public comments system.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Mode</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="displayMode"
                      checked={!showComments}
                      onChange={() => setShowComments(false)}
                      className="mr-2"
                    />
                    Count Only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="displayMode"
                      checked={showComments}
                      onChange={() => setShowComments(true)}
                      className="mr-2"
                    />
                    Show Comments
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Count Only: Shows comment count without fetching comments. Show Comments: Fetches
                  and displays actual public comments.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Benefits */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">No Auth</div>
                <p className="text-sm text-gray-600">
                  Public comments without authentication requirements
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Optimized</div>
                <p className="text-sm text-gray-600">
                  GraphQL queries with optimized public comment fragments
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">Scalable</div>
                <p className="text-sm text-gray-600">
                  Designed for high-traffic public comment systems
                </p>
              </div>
            </div>
          </div>

          {/* Demo Component */}
          {gameId ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Public Game Comments</h3>
              <div className="border border-gray-200 rounded-lg">
                <PublicGameComments gameId={gameId} showComments={showComments} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a Game ID</h3>
              <p className="text-gray-500">
                Enter a game ID above to test the public comments system.
              </p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Public Comment Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  No authentication required
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Public comment viewing and creation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Optimized GraphQL queries
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Reaction counts and reply counts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Performance monitoring
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Public game discussion pages
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Unauthenticated user engagement
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Public comment moderation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  High-traffic comment systems
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Public content engagement
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
