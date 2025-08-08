'use client';

import { MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Comment } from '@/app/components/comments/Comment';
import { CommentForm } from '@/app/components/comments/CommentForm';
import { ReactionPicker } from '@/app/components/reactions';
import { ReactionCount } from '@/app/components/reactions/ReactionCount';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { useGameLogComments, useDeleteComment } from '@/hooks/use-comments';
import type { IGameLog } from '@/lib/types';
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
  const [hasLoadedComments, setHasLoadedComments] = useState(false);

  // Only load comments when expanded to reduce initial load
  const {
    comments,
    loading,
    commentsHasNextPage: hasNextPage,
    loadMoreComments,
    refetch,
  } = useGameLogComments(gameLog.id, isExpanded ? 5 : 0); // Reduced initial limit from 3 to 5, and only load when expanded

  const { deleteComment } = useDeleteComment();

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    setHasLoadedComments(true); // Mark as loaded when user expands
    onToggleComments?.(newExpanded);
  };

  const handleLoadMore = () => {
    void loadMoreComments();
  };

  const handleCommentSuccess = () => {
    setShowCommentForm(false);
    void refetch();
  };

  const handleCommentCancel = () => {
    setShowCommentForm(false);
  };

  const handleReply = (_commentId: string) => {
    // This will be handled by individual Comment components
  };

  const handleEdit = (_commentId: string) => {
    // This will be handled by individual Comment components
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      void refetch();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Get comment count from game log data or from loaded comments
  const commentCount =
    isExpanded && hasLoadedComments ? comments.length : (gameLog.totalCommentCount ?? 0);

  return (
    <Card className="mt-4 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({commentCount})</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Game Log Reactions */}
            {isExpanded ? (
              <ReactionPicker
                targetId={gameLog.id}
                targetType={ParentType.GameLog}
                size="sm"
                showCount={true}
              />
            ) : (
              <ReactionCount count={gameLog.totalReactionCount ?? 0} size="sm" />
            )}
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
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
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
            {comments.map(comment => (
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
        </CardContent>
      )}
    </Card>
  );
}
