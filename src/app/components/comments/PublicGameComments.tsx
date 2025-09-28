'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { usePublicComments } from '@/hooks/use-public-comments';
import type { IPublicComment, IPublicGameCommentsProps } from '@/types';
import { ParentType } from '@/types';

import { PublicCommentForm } from './PublicCommentForm';

export function PublicGameComments({ gameId, showComments = false }: IPublicGameCommentsProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Use the full public comments hook with mutation capabilities
  const {
    comments,
    loading,
    createComment: _createComment,
    updateComment: _updateComment,
    deleteComment: _deleteComment,
    refetch,
    totalCommentCount,
  } = usePublicComments({
    targetId: gameId,
    targetType: ParentType.BasketballGame,
    skip: !showComments,
  });

  const handleCommentSuccess = () => {
    setShowCommentForm(false);
    // Refetch to get the latest comments
    void refetch();
  };

  const handleCommentCancel = () => {
    setShowCommentForm(false);
  };

  // Get comment count from loaded data
  const commentCount = showComments ? totalCommentCount : 0;

  return (
    <div className="p-4" data-testid="public-game-comments">
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Public Comments {commentCount > 0 ? `(${commentCount})` : ''}
          </span>
        </div>
      </div>

      <div className="pt-0">
        <div className="pt-0">
          {/* Comment Form */}
          {showCommentForm && (
            <div className="mb-4">
              <PublicCommentForm
                parentId={gameId}
                parentType={ParentType.BasketballGame}
                onSuccess={handleCommentSuccess}
                onCancel={handleCommentCancel}
                placeholder="Write a public comment about this game..."
                autoFocus
              />
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment: IPublicComment) => (
              <div key={comment.id} className="border-b border-theme-primary pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-bg-theme-secondary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-theme-secondary">
                        {comment.user?.first_name?.[0] || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-theme-primary">
                        {comment.user?.first_name} {comment.user?.last_name}
                      </p>
                      <span className="text-xs text-theme-muted">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-theme-secondary mt-1">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      {(comment.totalReactionCount || 0) > 0 && (
                        <span className="text-xs text-theme-muted">
                          {comment.totalReactionCount} reactions
                        </span>
                      )}
                      {(comment.totalChildCommentCount || 0) > 0 && (
                        <span className="text-xs text-theme-muted">
                          {comment.totalChildCommentCount} replies
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Loading public comments...
              </div>
            </div>
          )}

          {/* Load More Button - Removed for now as pagination is not implemented */}

          {/* No Comments Message */}
          {!loading && comments.length === 0 && commentCount === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400">
                No public comments yet. Be the first to comment!
              </p>
            </div>
          )}

          {/* Comment Form Toggle */}
          {!showCommentForm && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommentForm(true)}
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Add Public Comment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
