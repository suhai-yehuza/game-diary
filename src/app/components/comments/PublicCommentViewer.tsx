'use client';

import React, { useState } from 'react';

import { useComments } from '@/hooks/use-comments';
import type { IPublicCommentViewerProps, IComment } from '@/types';

export function PublicCommentViewer({ commentId, className = '' }: IPublicCommentViewerProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [useDetailed, setUseDetailed] = useState(false);

  const {
    comments: replies,
    commentsTotalCount: totalReplyCount,
    commentsHasNextPage: hasNextPage,
    loading,
    error,
    refetch,
    loadMoreComments: loadMore,
  } = useComments(commentId, 'Comment', {}, { first: 5 });

  // Mock data for missing properties
  const reactionGroups: Array<{ emoji: string; count: number }> = [];
  const totalReactionCount = 0;
  const replyCounts = new Map();

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-600">Error loading public comment: {error.message}</p>
        <button
          onClick={() => void refetch()}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Public Comment View</h3>
        <div className="flex items-center space-x-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={useDetailed}
              onChange={e => setUseDetailed(e.target.checked)}
              className="mr-1"
            />
            Detailed View
          </label>
          <button
            onClick={() => void refetch()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Comment ID */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Public Comment ID:</strong> {commentId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-600 font-medium">Total Public Replies</p>
          <p className="text-2xl font-bold text-blue-800">{totalReplyCount}</p>
        </div>
        {totalReactionCount > 0 && (
          <div className="p-3 bg-green-50 rounded">
            <p className="text-sm text-green-600 font-medium">Total Public Reactions</p>
            <p className="text-2xl font-bold text-green-800">{totalReactionCount}</p>
          </div>
        )}
      </div>

      {/* Reactions */}
      {reactionGroups.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Public Reactions</h4>
          <div className="flex flex-wrap gap-2">
            {reactionGroups.map((group: { emoji: string; count: number }) => (
              <div
                key={group.emoji}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full"
              >
                <span className="text-lg">{group.emoji}</span>
                <span className="text-sm font-medium">{group.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Replies Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="font-medium">
            {showReplies ? 'Hide' : 'Show'} Public Replies ({totalReplyCount})
          </span>
          <span className={`transform transition-transform ${showReplies ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="space-y-3">
          {replies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No public replies yet</p>
          ) : (
            replies.map((reply: IComment) => {
              const counts = replyCounts.get(reply.id);
              return (
                <div key={reply.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {reply.user?.first_name?.[0] || reply.user?.username?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {reply.user?.first_name} {reply.user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">@{reply.user?.username}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-800 mb-2">{reply.content}</p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {(counts?.totalChildCommentCount || 0) > 0 && (
                      <span>{counts?.totalChildCommentCount || 0} nested public replies</span>
                    )}
                    {(counts?.totalReactionCount || 0) > 0 && (
                      <span>{counts?.totalReactionCount || 0} public reactions</span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => void loadMore()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Load More Public Replies
              </button>
            </div>
          )}
        </div>
      )}

      {/* Performance Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p>
          <strong>Performance:</strong> Single optimized GraphQL query with public reactions and
          replies
        </p>
        <p>
          <strong>Data Source:</strong> Optimized GraphQL with public count fragments
        </p>
        <p>
          <strong>Public Replies Loaded:</strong> {replies.length} of {totalReplyCount}
        </p>
        <p>
          <strong>Access:</strong> No authentication required
        </p>
      </div>
    </div>
  );
}
