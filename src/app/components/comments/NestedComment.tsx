'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { MessageCircle, Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { CommentForm } from '@/app/components/comments/CommentForm';
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
import type { INestedCommentProps } from '@/types';
import { ParentType } from '@/types';

export function NestedComment({
  comment,
  onReply,
  onEdit,
  onDelete,
  maxDepth = API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH,
}: INestedCommentProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const isOwnComment = user?.id === comment.user_id;
  const canReply = comment.depth < maxDepth;

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

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const handleReplySuccess = () => {
    setIsReplying(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsReplying(false);
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
      <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {comment.user.first_name?.[0] || comment.user.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {comment.user.first_name || comment.user.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-theme-muted">
                    {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-theme-tertiary">(edited)</span>
                  )}
                </div>
                <p className="text-sm text-theme-secondary whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit} data-testid="edit-menu-item">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReply}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  data-testid="reply-button"
                >
                  <Reply className="mr-1 h-4 w-4" />
                  Reply
                </Button>
              )}
              {/* Only show reply indicator if there are replies */}
              {comment.totalChildCommentCount && comment.totalChildCommentCount > 0 && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">← Reply</span>
                </div>
              )}
            </div>

            {/* Reactions */}
            <ReactionPicker
              targetId={comment.id}
              targetType={ParentType.Comment}
              size="sm"
              showCount={true}
            />
          </div>

          {isReplying && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
              <CommentForm
                parentId={comment.id}
                parentType={ParentType.Comment}
                onSuccess={handleReplySuccess}
                onCancel={handleCancel}
                placeholder="Write a reply..."
                autoFocus
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
