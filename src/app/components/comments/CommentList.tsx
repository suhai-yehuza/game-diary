'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

import { Comment } from '@/app/components/comments/Comment';
import { CommentForm } from '@/app/components/comments/CommentForm';
import { Button } from '@/app/components/ui/button';
import type { ICommentListProps, IComment } from '@/types';
import { ParentType } from '@/types';

export function CommentList({
  comments,
  onLoadMore,
  hasNextPage = false,
  loading = false,
  showLoadMore = true,
}: ICommentListProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleLoadMore = () => {
    onLoadMore?.();
  };

  const handleCommentSuccess = () => {
    setShowCommentForm(false);
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

  const handleDelete = (_commentId: string) => {
    // This will be handled by individual Comment components
  };

  if (comments.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-theme-muted">
        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-4">
          <CommentForm
            parentId=""
            parentType={ParentType.GameLog}
            onSuccess={handleCommentSuccess}
            onCancel={handleCommentCancel}
            placeholder="Write a comment..."
            autoFocus
          />
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment: IComment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="text-sm text-theme-muted">Loading comments...</div>
        </div>
      )}

      {/* Load More Button */}
      {showLoadMore && hasNextPage && !loading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="text-semantic-info hover:text-semantic-info/80"
          >
            Load more comments
          </Button>
        </div>
      )}

      {/* Show Comment Form Button */}
      {!showCommentForm && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowCommentForm(true)}
            className="text-semantic-info hover:text-semantic-info/80"
          >
            Add a comment
          </Button>
        </div>
      )}
    </div>
  );
}
