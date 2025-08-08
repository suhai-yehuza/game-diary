'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { MessageCircle, Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { CommentForm } from '@/app/components/comments/CommentForm';
import { CommentReplies } from '@/app/components/comments/CommentReplies';
import { ReactionCount } from '@/app/components/reactions/ReactionCount';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import type { ICommentProps } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

export function Comment({
  comment,
  onReply,
  onEdit,
  onDelete,
  showReplies = false,
  maxDepth = 5,
}: ICommentProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showRepliesState, setShowRepliesState] = useState(showReplies);

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
    setShowRepliesState(true);
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
                    {comment.user.first_name || comment.user.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
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

          {/* Comment actions */}
          <div className="flex items-center gap-2 mt-3">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}

            {/* Child comments count */}
            {comment.totalChildCommentCount && comment.totalChildCommentCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRepliesState(!showRepliesState)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {comment.totalChildCommentCount}{' '}
                {comment.totalChildCommentCount === 1 ? 'reply' : 'replies'}
              </Button>
            )}

            {/* Reactions */}
            <ReactionCount count={comment.totalReactionCount ?? 0} size="sm" />

            {/* Action menu */}
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
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
                parentId={comment.id}
                parentType={ParentType.Comment}
                onSuccess={handleReplySuccess}
                onCancel={handleCancel}
                placeholder="Write a reply..."
                autoFocus
              />
            </div>
          )}

          {/* Always show replies section - CommentReplies will handle fetching */}
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRepliesState(!showRepliesState)}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              {showRepliesState ? 'Hide' : 'Show'} replies
            </Button>
            {showRepliesState && (
              <div className="mt-2 space-y-2">
                <CommentReplies
                  commentId={comment.id}
                  maxDepth={maxDepth}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
