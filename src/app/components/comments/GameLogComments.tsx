'use client';

import { MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Comment } from '@/app/components/comments/Comment';
import { CommentForm } from '@/app/components/comments/CommentForm';
import { Button } from '@/app/components/ui/button';
import { useGameLogComments, useDeleteComment, useUpdateComment } from '@/hooks/use-comments';
import type { IGameLog, IComment } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

interface IGameLogCommentsProps {
  gameLog: IGameLog;
  showComments?: boolean;
  onToggleComments?: (expanded: boolean) => void;
}

export function GameLogComments({
  gameLog,
  showComments = false,
  onToggleComments,
}: IGameLogCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(showComments);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [optimisticDeletedComments, setOptimisticDeletedComments] = useState<Set<string>>(
    new Set()
  );
  const [_optimisticUpdatedComments, _setOptimisticUpdatedComments] = useState<
    Map<string, IComment>
  >(new Map());

  // Only load comments when expanded to reduce initial load
  const {
    comments,
    loading,
    commentsHasNextPage: hasNextPage,
    loadMoreComments,
    refetch,
    commentsTotalCount,
  } = useGameLogComments(gameLog.id, isExpanded ? 5 : 0);

  const { deleteComment } = useDeleteComment();
  const { updateComment: _updateComment } = useUpdateComment();

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleComments?.(newExpanded);
  };

  const handleLoadMore = () => {
    void loadMoreComments();
  };

  const handleCommentSuccess = () => {
    setShowCommentForm(false);
    // Refetch to get the latest comments
    void refetch();
  };

  const handleCommentCancel = () => {
    setShowCommentForm(false);
  };

  const handleReply = (_commentId: string) => {
    // This will be handled by individual Comment components
  };

  const handleEdit = (_commentId: string) => {
    // This will be handled by the Comment component's optimistic updates
    // The Comment component will call onEdit when the edit is successful
  };

  const handleDelete = async (commentId: string) => {
    try {
      // Optimistically remove the comment from the UI
      setOptimisticDeletedComments(prev => new Set([...prev, commentId]));

      await deleteComment(commentId);

      // If successful, keep it removed. If failed, the refetch will restore it
      setTimeout(() => {
        setOptimisticDeletedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }, 1000); // Remove from optimistic set after 1 second
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Restore the comment if deletion failed
      setOptimisticDeletedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // Apply optimistic updates to comments
  const visibleComments = comments
    .filter(comment => !optimisticDeletedComments.has(comment.id))
    .map(comment => {
      const optimisticUpdate = _optimisticUpdatedComments.get(comment.id);
      return optimisticUpdate || comment;
    });

  // Get comment count from game log data or from loaded comments
  const commentCount =
    isExpanded && commentsTotalCount !== undefined
      ? commentsTotalCount
      : (gameLog.totalCommentCount ?? 0);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Comments ({commentCount})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-0">
          {/* Comment Form */}
          {showCommentForm && (
            <div className="mb-4">
              <CommentForm
                parentId={gameLog.id}
                parentType={ParentType.GameLog}
                onSuccess={handleCommentSuccess}
                onCancel={handleCommentCancel}
                placeholder="Write a comment about this game log..."
                autoFocus
              />
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {visibleComments.map(comment => (
              <div
                key={comment.id}
                className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0"
              >
                <Comment
                  comment={comment}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={commentId => {
                    void handleDelete(commentId);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading comments...</div>
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && !loading && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  void handleLoadMore();
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Load more comments
              </Button>
            </div>
          )}

          {/* Show Comment Form Button */}
          {!showCommentForm && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowCommentForm(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Add a comment
              </Button>
            </div>
          )}

          {/* Empty State */}
          {comments.length === 0 && !loading && !showCommentForm && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
