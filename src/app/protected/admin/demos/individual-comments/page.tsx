'use client';

import React, { useState } from 'react';

import { CommentViewer } from '@/app/components/comments/CommentViewer';
import { PublicCommentViewer } from '@/app/components/comments/PublicCommentViewer';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function AdminCommentsDemoPage() {
  const [commentId, setCommentId] = useState('');
  const [publicCommentId, setPublicCommentId] = useState('');
  const [activeTab, setActiveTab] = useState<'protected' | 'public'>('protected');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Comment Viewer Demo</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View comments with their reactions and child comments. This demonstrates optimized
              GraphQL queries for fetching complete comment data.
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
                  This demo is available to admins for testing and validating the optimized comment
                  system. Use it to test GraphQL queries, monitor performance, and validate data
                  structures.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('protected')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'protected'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Protected Comments
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'public'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Public Comments
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Enter Comment ID</h2>

            {activeTab === 'protected' ? (
              <div>
                <label htmlFor="commentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Protected Comment ID
                </label>
                <input
                  id="commentId"
                  type="text"
                  value={commentId}
                  onChange={e => setCommentId(e.target.value)}
                  placeholder="Enter a comment ID to view its details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter a comment ID to view its reactions and child comments (replies).
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="publicCommentId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Public Comment ID
                </label>
                <input
                  id="publicCommentId"
                  type="text"
                  value={publicCommentId}
                  onChange={e => setPublicCommentId(e.target.value)}
                  placeholder="Enter a public comment ID to view its details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter a public comment ID to view its reactions and child comments (replies). No
                  authentication required.
                </p>
              </div>
            )}
          </div>

          {/* Comment Viewer */}
          {activeTab === 'protected' && commentId && <CommentViewer commentId={commentId} />}

          {activeTab === 'public' && publicCommentId && (
            <PublicCommentViewer commentId={publicCommentId} />
          )}

          {/* Empty State */}
          {((activeTab === 'protected' && !commentId) ||
            (activeTab === 'public' && !publicCommentId)) && (
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a Comment ID</h3>
              <p className="text-gray-500">
                {activeTab === 'protected'
                  ? 'Enter a protected comment ID above to view its details, reactions, and replies.'
                  : 'Enter a public comment ID above to view its details, reactions, and replies.'}
              </p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Protected Comments</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Requires authentication
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  View reactions and replies
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Comment counts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Paginated replies loading
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Reaction grouping by emoji
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Public Comments</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  No authentication required
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  View public reactions and replies
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Public comment counts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Paginated public replies loading
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Public reaction grouping by emoji
                </li>
              </ul>
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
