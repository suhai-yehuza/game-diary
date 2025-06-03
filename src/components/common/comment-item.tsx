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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/lib/config/api.config';
import { CREATE_COMMENT } from '@/lib/graphql/mutations';
import { logger } from '@/lib/logger';
import { CommentItemProps } from '@/lib/types/component.types';
import { cn } from '@/lib/utils';

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

  const canReply = (comment.depth ?? 0) < maxDepth;
  const hasReplies = (comment.childComments?.totalCount ?? 0) > 0;
  const isNested = comment.depth > 0;

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
    <div className={cn('group relative', isNested && 'ml-4 sm:ml-8')}>
      {/* Thread Line for Nested Comments */}
      {isNested && <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50" />}

      <div
        className={cn(
          'relative rounded-lg transition-all duration-200',
          isNested ? 'bg-muted/30 p-3' : 'bg-card border p-4',
          !isNested && 'hover:shadow-sm'
        )}
      >
        {/* Thread Connector */}
        {isNested && <CornerDownRight className="absolute -left-4 top-6 h-4 w-4 text-border/50" />}

        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Link
              href={`/protected/user/${comment.user?.id}`}
              className="transition-transform hover:scale-105"
            >
              <Avatar className={cn('ring-2 ring-background', isNested ? 'h-8 w-8' : 'h-10 w-10')}>
                <AvatarImage src={comment.user?.imageUrl ?? undefined} />
                <AvatarFallback className="text-sm font-medium">
                  {comment.user?.username?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/protected/user/${comment.user?.id}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {comment.user?.username ?? 'Unknown User'}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.depth > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Reply
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {user?.id === comment.user?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(comment.id, comment.content)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Content */}
        <div className={cn('text-sm leading-relaxed mb-3', isNested ? 'ml-11' : 'ml-0 sm:ml-13')}>
          <p className="whitespace-pre-wrap break-words">{comment.content}</p>
        </div>

        {/* Comment Footer */}
        <div
          className={cn('flex items-center gap-1 flex-wrap', isNested ? 'ml-11' : 'ml-0 sm:ml-13')}
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
              className="h-7 text-xs gap-1.5 px-2"
            >
              <Reply className="h-3 w-3" />
              Reply
            </Button>
          )}

          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-7 text-xs gap-1.5 px-2"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Hide {comment.childComments?.totalCount ?? 0}{' '}
                  {(comment.childComments?.totalCount ?? 0) === 1 ? 'reply' : 'replies'}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  {comment.childComments?.totalCount ?? 0}{' '}
                  {(comment.childComments?.totalCount ?? 0) === 1 ? 'reply' : 'replies'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div
            className={cn(
              'mt-3 animate-in slide-in-from-top-2 duration-200',
              isNested ? 'ml-11' : 'ml-0 sm:ml-13'
            )}
          >
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <div className="flex gap-2">
                <Avatar className="h-7 w-7 mt-0.5">
                  <AvatarImage src={user?.imageUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[80px] text-sm resize-none"
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setIsReplying(false);
                        setReplyContent('');
                      }
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmitReply(e);
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                      disabled={isSubmitting}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyContent.trim() || isSubmitting}
                      className="h-7 text-xs gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Child Comments */}
      {showReplies && hasReplies && comment.childComments && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
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
