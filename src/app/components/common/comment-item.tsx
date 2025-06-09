import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  Reply,
  Loader2,
  CornerDownRight,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@src/app/components/ui/avatar';
import { Badge } from '@src/app/components/ui/badge';
import { Button } from '@src/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@src/app/components/ui/dropdown-menu';
import { Textarea } from '@src/app/components/ui/textarea';
import { useToast } from '@src/app/components/ui/use-toast';
import { API_CONFIG } from '@src/lib/config/api.config';
import { CREATE_COMMENT } from '@src/lib/graphql/mutations';
import { logger } from 'lib/core/logger';
import type { CommentItemProps } from '@src/lib/types/component.types';
import { cn } from '@src/lib/utils';

import { ReactionDisplay } from './reaction-display';
export function CommentItem({
  comment,
  onEdit,
  onDelete,
  refetchComments,
  maxDepth = API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH,
}: CommentItemProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const canReply = (comment.depth ?? 0) < maxDepth;
  const hasReplies = (comment.childComments?.totalCount ?? 0) > 0;
  const isNested = comment.depth > 0;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Close dropdown first, then open edit dialog after cleanup
    setIsDropdownOpen(false);
    setTimeout(() => {
      onEdit(comment.id, comment.content);
    }, 100);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Close dropdown first, then open delete dialog after cleanup
    setIsDropdownOpen(false);
    setTimeout(() => {
      onDelete(comment.id);
    }, 100);
  };

  const [createReply] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setTimeout(() => {
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true);
        if (refetchComments) {
          refetchComments();
        }
      }, 0);
      toast({
        title: 'Reply posted!',
        description: 'Your reply has been added to the discussion.',
      });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createReply({
        variables: {
          input: {
            parentId: comment.id,
            parentType: 'comment',
            content: replyContent,
          },
        },
      });
    } catch (error) {
      logger.error('Error creating reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('group relative', isNested && 'ml-6 sm:ml-10')}>
      {/* Thread Line for Nested Comments */}
      {isNested && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />
      )}

      <div
        className={cn(
          'relative rounded-xl transition-all duration-300',
          isNested
            ? 'bg-muted/20 border border-border/30 p-4'
            : 'bg-card/80 backdrop-blur-sm border border-border/50 p-5 hover:border-border hover:shadow-lg hover:shadow-black/5',
          'hover:bg-card/90'
        )}
      >
        {/* Thread Connector */}
        {isNested && (
          <CornerDownRight className="absolute -left-5 top-7 h-4 w-4 text-muted-foreground/40" />
        )}

        {/* Comment Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Link
              href={`/protected/user/${comment.user?.id}`}
              className="group/avatar transition-all duration-200 hover:scale-105"
            >
              <Avatar
                className={cn(
                  'ring-2 ring-background shadow-sm transition-all duration-200 group-hover/avatar:ring-primary/20',
                  isNested ? 'h-9 w-9' : 'h-11 w-11'
                )}
              >
                <AvatarImage src={comment.user?.imageUrl ?? undefined} />
                <AvatarFallback
                  className={cn(
                    'font-semibold bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-foreground',
                    isNested ? 'text-xs' : 'text-sm'
                  )}
                >
                  {comment.user?.username?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  href={`/protected/user/${comment.user?.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors duration-200 hover:underline"
                >
                  {comment.user?.username ?? 'Unknown User'}
                </Link>
                {comment.depth > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted/60">
                    Reply
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {user?.id === comment.user?.id && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted/50 rounded-lg"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Content */}
        <div className={cn('mb-4', isNested ? 'ml-13' : 'ml-0 sm:ml-15')}>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words font-medium">
            {comment.content}
          </p>
        </div>

        {/* Comment Footer */}
        <div
          className={cn('flex items-center gap-2 flex-wrap', isNested ? 'ml-13' : 'ml-0 sm:ml-15')}
        >
          <ReactionDisplay
            targetId={comment.id}
            targetType="comment"
            reactions={comment.reactions}
            onReactionChange={refetchComments}
          />

          {user && canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className={cn(
                'h-8 text-xs gap-2 px-3 rounded-full font-medium transition-all duration-200',
                'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400',
                isReplying && 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
              )}
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </Button>
          )}

          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className={cn(
                'h-8 text-xs gap-2 px-3 rounded-full font-medium transition-all duration-200',
                'hover:bg-muted/60 hover:text-foreground',
                showReplies && 'bg-muted/60 text-foreground'
              )}
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Hide</span>{' '}
                  {comment.childComments?.totalCount ?? 0}{' '}
                  <span className="hidden sm:inline">
                    {(comment.childComments?.totalCount ?? 0) === 1 ? 'reply' : 'replies'}
                  </span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  {comment.childComments?.totalCount ?? 0}{' '}
                  <span className="hidden sm:inline">
                    {(comment.childComments?.totalCount ?? 0) === 1 ? 'reply' : 'replies'}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div
            className={cn(
              'mt-4 p-4 bg-muted/30 rounded-xl border border-border/30 animate-in slide-in-from-top-2 duration-300',
              isNested ? 'ml-13' : 'ml-0 sm:ml-15'
            )}
          >
            <form onSubmit={handleSubmitReply} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1 ring-2 ring-background shadow-sm">
                  <AvatarImage src={user?.imageUrl || undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-green-500/10 to-blue-500/10">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a thoughtful reply..."
                    className="min-h-[80px] text-sm resize-none bg-background/50 border-border/50 rounded-lg focus:bg-background transition-colors"
                    onKeyDown={e => {
                      // Handle existing keyboard shortcuts
                      if (e.key === 'Escape') {
                        setIsReplying(false);
                        setReplyContent('');
                      }
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmitReply(e);
                      }

                      // Ensure spacebar works by explicitly handling it
                      if (e.key === ' ' || e.key === 'Space') {
                        e.stopPropagation();
                        // Force the textarea to include the space
                        const textarea = e.target as HTMLTextAreaElement;
                        const start = textarea.selectionStart || 0;
                        const end = textarea.selectionEnd || 0;
                        const currentValue = textarea.value;
                        const newValue =
                          currentValue.slice(0, start) + ' ' + currentValue.slice(end);

                        // Prevent default and manually handle the space
                        e.preventDefault();
                        setReplyContent(newValue);

                        // Restore cursor position after state update
                        setTimeout(() => {
                          textarea.setSelectionRange(start + 1, start + 1);
                        }, 0);
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Press Cmd+Enter to submit quickly
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsReplying(false);
                          setReplyContent('');
                        }}
                        disabled={isSubmitting}
                        className="h-8 text-xs px-3 rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!replyContent.trim() || isSubmitting}
                        className="h-8 text-xs gap-2 px-4 rounded-full bg-primary hover:bg-primary/90 transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Child Comments */}
      {showReplies && hasReplies && comment.childComments && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
          {comment.childComments.edges.map(({ node: childComment }) => (
            <CommentItem
              key={childComment.id}
              comment={childComment}
              onEdit={onEdit}
              onDelete={onDelete}
              refetchComments={refetchComments}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
