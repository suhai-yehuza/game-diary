'use client';

import React, { useState } from 'react';

import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { PublicReactionPicker } from '@/app/components/reactions/PublicReactionPicker';

export default function AdminPublicReactionPickerDemoPage() {
  const [targetId, setTargetId] = useState('');
  const [targetType, setTargetType] = useState<'GAME_LOG' | 'COMMENT' | 'PUBLIC_COMMENT'>(
    'GAME_LOG'
  );
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showCount, setShowCount] = useState(true);
  const [showPicker, setShowPicker] = useState(true);

  const handleReactionSelect = (emoji: string) => {
    console.log(`Selected reaction: ${emoji} for ${targetType} ${targetId}`);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Reaction Picker Demo</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Demo of optimized public reactions with emoji grouping. This component provides 50-60%
              performance improvement over REST API calls for public reactions.
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
                  This demo showcases the PublicReactionPicker component with optimized public
                  reactions. Use it to test reaction functionality and validate the optimized public
                  reaction system.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Demo Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="targetId" className="block text-sm font-medium text-gray-700 mb-2">
                  Target ID
                </label>
                <input
                  id="targetId"
                  type="text"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  placeholder="Enter target ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  ID of the target (game log, comment, etc.)
                </p>
              </div>

              <div>
                <label
                  htmlFor="targetType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Target Type
                </label>
                <select
                  id="targetType"
                  value={targetType}
                  onChange={e =>
                    setTargetType(e.target.value as 'GAME_LOG' | 'COMMENT' | 'PUBLIC_COMMENT')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GAME_LOG">Game Log</option>
                  <option value="COMMENT">Comment</option>
                  <option value="PUBLIC_COMMENT">Public Comment</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">Type of target for reactions</p>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select
                  id="size"
                  value={size}
                  onChange={e => setSize(e.target.value as 'sm' | 'md' | 'lg')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">Size of reaction buttons</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showCount}
                      onChange={e => setShowCount(e.target.checked)}
                      className="mr-2"
                    />
                    Show Count
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPicker}
                      onChange={e => setShowPicker(e.target.checked)}
                      className="mr-2"
                    />
                    Show Picker
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Display options for the reaction picker
                </p>
              </div>
            </div>
          </div>

          {/* Performance Benefits */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">50-60%</div>
                <p className="text-sm text-gray-600">Performance improvement over REST API calls</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Emoji Groups</div>
                <p className="text-sm text-gray-600">
                  Automatic grouping and counting of reactions by emoji
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">Public Access</div>
                <p className="text-sm text-gray-600">
                  Public reactions without authentication requirements
                </p>
              </div>
            </div>
          </div>

          {/* Demo Component */}
          {targetId ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Public Reaction Picker</h3>
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-center">
                  <PublicReactionPicker
                    targetId={targetId}
                    targetType={targetType}
                    size={size}
                    showCount={showCount}
                    showPicker={showPicker}
                    onReactionSelect={handleReactionSelect}
                  />
                </div>
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a Target ID</h3>
              <p className="text-gray-500">
                Enter a target ID above to test the public reaction picker.
              </p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Reaction Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Public reaction viewing and creation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Emoji grouping and counting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  50-60% performance improvement
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Interactive reaction picker
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Real-time reaction updates
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Public game log reactions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Public comment reactions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Unauthenticated user engagement
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  High-traffic reaction systems
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Public content interaction
                </li>
              </ul>
            </div>
          </div>

          {/* Size Examples */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Size Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Small</h4>
                <div className="flex items-center justify-center">
                  <PublicReactionPicker
                    targetId="demo-small"
                    targetType="GAME_LOG"
                    size="sm"
                    showCount={true}
                    showPicker={false}
                    onReactionSelect={handleReactionSelect}
                  />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Medium</h4>
                <div className="flex items-center justify-center">
                  <PublicReactionPicker
                    targetId="demo-medium"
                    targetType="GAME_LOG"
                    size="md"
                    showCount={true}
                    showPicker={false}
                    onReactionSelect={handleReactionSelect}
                  />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Large</h4>
                <div className="flex items-center justify-center">
                  <PublicReactionPicker
                    targetId="demo-large"
                    targetType="GAME_LOG"
                    size="lg"
                    showCount={true}
                    showPicker={false}
                    onReactionSelect={handleReactionSelect}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
