'use client';

import Link from 'next/link';
import React from 'react';

import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function AdminDemosPage() {
  const demos = [
    {
      title: 'Comments',
      description: 'View individual comments with their reactions and child comments',
      href: '/protected/admin/demos/individual-comments',
      features: [
        'Protected and public comment viewing',
        'Reaction grouping by emoji',
        'Paginated replies loading',
        'Comment counts',
        'Performance metrics display',
      ],
      status: 'Available',
      category: 'Comments & Reactions',
    },
    {
      title: 'Optimized Game Log Comments',
      description: 'Demo of optimized game log comments with GraphQL + DataLoader',
      href: '/protected/admin/demos/game-log-comments',
      features: [
        '60-70% performance improvement over REST API',
        'Count-only mode for table views',
        'Paginated comment loading',
        'Optimistic updates for deletions',
        'Real-time performance metrics',
      ],
      status: 'Available',
      category: 'Comments & Reactions',
    },
    {
      title: 'Public Game Comments',
      description: 'Demo of optimized public comments for unauthenticated users',
      href: '/protected/admin/demos/public-game-comments',
      features: [
        'No authentication required',
        'Public comment viewing and creation',
        'Optimized GraphQL queries',
        'Reaction counts and reply counts',
        'Performance monitoring',
      ],
      status: 'Available',
      category: 'Comments & Reactions',
    },
    {
      title: 'Public Reaction Picker',
      description: 'Demo of optimized public reactions with emoji grouping',
      href: '/protected/admin/demos/public-reaction-picker',
      features: [
        'Public reaction viewing and creation',
        'Emoji grouping and counting',
        '50-60% performance improvement',
        'Interactive reaction picker',
        'Real-time reaction updates',
      ],
      status: 'Available',
      category: 'Comments & Reactions',
    },
    {
      title: 'Optimized Friends Table',
      description: 'Demo of optimized friends table with GraphQL + DataLoader',
      href: '/protected/admin/demos/optimized-friends-table',
      features: [
        '60-70% performance improvement over REST API',
        'Optimized friendship queries and fragments',
        'Real-time friend request management',
        'User search with debouncing',
        'Performance metrics display',
      ],
      status: 'Available',
      category: 'Comments & Reactions',
    },
    {
      title: 'Admin Experimental Tools',
      description: 'Comprehensive admin tools for testing and development',
      href: '/protected/admin/experimental',
      features: [
        'API endpoint testing',
        'Cache management and warming',
        'Database refresh tools',
        'Performance monitoring',
        'Search and data validation',
      ],
      status: 'Available',
      category: 'Admin Tools',
    },
  ];

  const categories = demos.reduce<Record<string, typeof demos>>((acc, demo) => {
    if (!acc[demo.category]) {
      acc[demo.category] = [];
    }
    acc[demo.category].push(demo);
    return acc;
  }, {});

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Demo Components</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Interactive demos showcasing optimized GraphQL queries and React hooks for the Game
              Diary application. These components are available to admins for testing and validation
              purposes.
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
                <h3 className="text-sm font-medium text-blue-800">Admin Access Required</h3>
                <p className="mt-1 text-sm text-blue-700">
                  These demo components are only available to users with admin privileges. They
                  provide interactive examples of the optimized GraphQL queries and React hooks for
                  testing and validation.
                </p>
              </div>
            </div>
          </div>

          {/* Demos by Category */}
          {Object.entries(categories).map(([category, categoryDemos]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryDemos.map(demo => (
                  <div key={demo.href} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{demo.title}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {demo.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{demo.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {demo.features.map(feature => (
                          <li key={feature} className="flex items-center text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href={demo.href}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Demo
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Usage Instructions */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use These Demos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Testing</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Test new GraphQL queries and hooks</li>
                  <li>• Validate data structures and performance</li>
                  <li>• Monitor real-time data flow and loading states</li>
                  <li>• Test error handling and edge cases</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Validation</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Verify UI/UX patterns and styling</li>
                  <li>• Monitor performance metrics</li>
                  <li>• Test admin-specific features</li>
                  <li>• Validate production-ready components</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Benefits */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Single Query</div>
                <p className="text-sm text-gray-600">
                  Fetch comment, reactions, and replies in one optimized GraphQL query
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Count Fragments</div>
                <p className="text-sm text-gray-600">
                  Use optimized fragments to get counts without fetching full data
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">Reaction Groups</div>
                <p className="text-sm text-gray-600">
                  Automatically group reactions by emoji for better UX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
