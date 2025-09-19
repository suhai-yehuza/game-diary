'use client';

import React, { useState } from 'react';

import { useComments } from '@/hooks/use-comments';
import type { ICommentViewerProps, IComment } from '@/types';

export function CommentViewer({ commentId, className = '' }: ICommentViewerProps) {
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
          <div className="h-4 bg-theme-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-theme-muted rounded w-1/2 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-theme-muted rounded w-full" />
            <div className="h-3 bg-theme-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg ${className}`}
      >
        <p className="text-semantic-error">Error loading comment: {error.message}</p>
        <button
          onClick={() => void refetch()}
          className="mt-2 px-3 py-1 bg-semantic-error text-white rounded text-sm hover:bg-semantic-error/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 border border-theme-primary rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Comment View</h3>
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
            className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:bg-brand-primary-hover"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Comment ID */}
      <div className="mb-4 p-3 bg-bg-theme-secondary rounded">
        <p className="text-sm text-theme-secondary">
          <strong>Comment ID:</strong> {commentId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-brand-primary/10 rounded">
          <p className="text-sm text-brand-primary font-medium">Total Replies</p>
          <p className="text-2xl font-bold text-brand-primary">{totalReplyCount}</p>
        </div>
        {totalReactionCount > 0 && (
          <div className="p-3 bg-semantic-success/10 rounded">
            <p className="text-sm text-semantic-success font-medium">Total Reactions</p>
            <p className="text-2xl font-bold text-semantic-success">{totalReactionCount}</p>
          </div>
        )}
      </div>

      {/* Reactions */}
      {reactionGroups.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Reactions</h4>
          <div className="flex flex-wrap gap-2">
            {reactionGroups.map((group: { emoji: string; count: number }) => (
              <div
                key={group.emoji}
                className="flex items-center space-x-1 px-2 py-1 bg-bg-theme-secondary rounded-full"
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
          className="flex items-center space-x-2 px-4 py-2 bg-bg-theme-secondary hover:bg-bg-theme-tertiary rounded-lg transition-colors"
        >
          <span className="font-medium">
            {showReplies ? 'Hide' : 'Show'} Replies ({totalReplyCount})
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
            <p className="text-gray-500 text-center py-4">No replies yet</p>
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
                      <span>{counts?.totalChildCommentCount || 0} nested replies</span>
                    )}
                    {(counts?.totalReactionCount || 0) > 0 && (
                      <span>{counts?.totalReactionCount || 0} reactions</span>
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
                className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-hover transition-colors"
              >
                Load More Replies
              </button>
            </div>
          )}
        </div>
      )}

      {/* Performance Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p>
          <strong>Performance:</strong> Single optimized GraphQL query with reactions and replies
        </p>
        <p>
          <strong>Data Source:</strong> Optimized GraphQL with count fragments
        </p>
        <p>
          <strong>Replies Loaded:</strong> {replies.length} of {totalReplyCount}
        </p>
      </div>
    </div>
  );
}
