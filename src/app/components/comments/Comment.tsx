'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { MessageCircle, Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { CommentForm } from '@/app/components/comments/CommentForm';
import { CommentReplies } from '@/app/components/comments/CommentReplies';
import { ReactionPicker } from '@/app/components/reactions';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import { API_CONFIG } from '@/lib/config/app.config';
import type { ICommentProps, IComment } from '@/types';
import { ParentType } from '@/types';

export function Comment({
  comment,
  onReply,
  onEdit,
  onDelete,
  showReplies = false,
  maxDepth = API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH,
}: ICommentProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showRepliesState, setShowRepliesState] = useState(showReplies);
  const [optimisticComment, setOptimisticComment] = useState<IComment | null>(null);

  const isOwnComment = user?.id === comment.user_id;
  const canReply = comment.depth < maxDepth;

  // Use optimistic comment if available, otherwise use the original comment
  const displayComment = optimisticComment || comment;

  const handleReply = () => {
    setIsReplying(true);
    onReply?.(comment.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(comment.id);
  };

  const handleDelete = () => {
    onDelete?.(comment.id);
  };

  const handleEditSuccess = (updatedComment: IComment) => {
    setIsEditing(false);
    // Optimistically update the comment in the UI
    setOptimisticComment(updatedComment);
    // Notify parent component about the update
    onEdit?.(comment.id);
  };

  const handleReplySuccess = () => {
    setIsReplying(false);
    setShowRepliesState(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsReplying(false);
    // Clear optimistic comment on cancel
    setOptimisticComment(null);
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        <CommentForm
          parentId={comment.parent_id}
          parentType={comment.parent_type}
          onSuccess={handleEditSuccess}
          onCancel={handleCancel}
          placeholder="Edit your comment..."
          autoFocus
          initialContent={comment.content}
          commentId={comment.id}
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Card className="border-l-4 border-l-brand-primary bg-bg-theme-secondary">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-brand-primary">
                  {displayComment.user.first_name?.[0] || displayComment.user.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {displayComment.user.first_name || displayComment.user.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-theme-muted">
                    {format(new Date(displayComment.created_at as string), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {displayComment.updated_at !== displayComment.created_at && (
                    <span className="text-xs text-theme-tertiary">(edited)</span>
                  )}
                </div>
                <p className="text-sm text-theme-secondary whitespace-pre-wrap">
                  {displayComment.content}
                </p>
              </div>
            </div>
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-neutral-600 dark:text-neutral-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-semantic-error">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment actions */}
          <div className="flex items-center gap-2 mt-3">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}

            {/* Child comments count */}
            {(displayComment.totalChildCommentCount as number) &&
              (displayComment.totalChildCommentCount as number) > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRepliesState(!showRepliesState)}
                  className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {displayComment.totalChildCommentCount as number}{' '}
                    {(displayComment.totalChildCommentCount as number) === 1 ? 'reply' : 'replies'}
                  </span>
                </Button>
              )}

            {/* Reactions */}
            <ReactionPicker
              targetId={displayComment.id}
              targetType={ParentType.Comment}
              size="sm"
              showCount={true}
              onReactionSelect={(emoji: string) => {
                // Handle reaction selection
                console.log('Reaction selected:', emoji);
              }}
            />

            {/* Action menu */}
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <MoreHorizontal className="h-4 w-4 text-neutral-600 dark:text-neutral-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-semantic-error">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
              <CommentForm
                parentId={displayComment.id}
                parentType={ParentType.Comment}
                onSuccess={handleReplySuccess}
                onCancel={handleCancel}
                placeholder="Write a reply..."
                autoFocus
              />
            </div>
          )}

          {/* Show replies section only if there are replies or if replies are currently shown */}
          {((displayComment.totalChildCommentCount as number) &&
            (displayComment.totalChildCommentCount as number) > 0) ||
          showRepliesState ? (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRepliesState(!showRepliesState)}
                className="text-theme-muted hover:text-semantic-info"
              >
                {showRepliesState ? 'Hide' : 'Show'} replies
              </Button>
              {showRepliesState && (
                <div className="mt-2 space-y-2">
                  <CommentReplies
                    commentId={displayComment.id}
                    maxDepth={maxDepth}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
