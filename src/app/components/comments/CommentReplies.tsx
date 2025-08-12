'use client';

// import { useState } from 'react';

import { NestedComment } from '@/app/components/comments/NestedComment';
import { Button } from '@/app/components/ui/button';
import { useCommentReplies } from '@/hooks/use-comments';
import { API_CONFIG } from '@/lib/config/app.config';
import type { ICommentRepliesProps } from '@/lib/types';

export function CommentReplies({
  commentId,
  maxDepth = API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH,
  onReply,
  onEdit,
  onDelete,
}: ICommentRepliesProps) {
  const {
    comments: replies,
    loading,
    commentsHasNextPage: hasNextPage,
    loadMoreComments,
  } = useCommentReplies(commentId, 2);

  const handleLoadMore = () => {
    void loadMoreComments();
  };

  if (replies.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="space-y-2">
      {replies.map(reply => (
        <div key={reply.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
          <NestedComment
            comment={reply}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            maxDepth={maxDepth - 1}
          />
          {/* Render replies to this reply if we haven't reached max depth */}
          {maxDepth > 1 && reply.totalChildCommentCount && reply.totalChildCommentCount > 0 && (
            <CommentReplies
              commentId={reply.id}
              maxDepth={maxDepth - 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}

      {loading && (
        <div className="ml-4 pl-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading replies...</div>
        </div>
      )}

      {hasNextPage && !loading && (
        <div className="ml-4 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadMore}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Load more replies
          </Button>
        </div>
      )}
    </div>
  );
}
