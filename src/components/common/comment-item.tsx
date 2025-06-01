import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { API_CONFIG } from '@/lib/config/api.config';
import { CREATE_COMMENT, UPDATE_COMMENT } from '@/lib/graphql/mutations';
import type { Comment } from '@/lib/types/generated/graphql';
import { ReactionDisplay } from './reaction-display';

// Extend Comment type to include new fields
interface CommentWithNesting extends Comment {
  depth: number;
  childComments?: {
    edges: Array<{ node: CommentWithNesting }>;
    totalCount: number;
  };
}

interface CommentItemProps {
  comment: CommentWithNesting;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  refetchComments?: () => void;
  maxDepth?: number;
}

export function CommentItem({ 
  comment, 
  onEdit, 
  onDelete, 
  refetchComments,
  maxDepth = API_CONFIG.pagination.MAX_CHILD_COMMENT_DEPTH 
}: CommentItemProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const canReply = (comment.depth ?? 0) < maxDepth;
  const hasReplies = (comment.childComments?.totalCount ?? 0) > 0;

  const [createReply] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      // Defer state updates to avoid updating during render
      setTimeout(() => {
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true);
        if (refetchComments) {
          refetchComments();
        }
      }, 0);
      toast({
        title: 'Reply posted',
        description: 'Your reply has been posted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

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
      console.error('Error creating reply:', error);
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4",
      comment.depth > 0 && "ml-8 mt-2"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {comment.user?.id ? (
            <Link 
              href={`/protected/user/${comment.user.id}`}
              className="transition-opacity hover:opacity-80"
            >
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={comment.user?.imageUrl ?? undefined} />
                <AvatarFallback>
                  {comment.user?.username?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.imageUrl ?? undefined} />
              <AvatarFallback>
                {comment.user?.username?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {comment.user?.id ? (
              <Link 
                href={`/protected/user/${comment.user.id}`}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {comment.user?.username ?? 'Unknown User'}
              </Link>
            ) : (
              <div className="font-semibold text-sm">
                {comment.user?.username ?? 'Unknown User'}
              </div>
            )}
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              {comment.depth > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  • Level {comment.depth}
                </span>
              )}
            </div>
          </div>
        </div>
        {user?.id === comment.user?.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(comment.id, comment.content)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(comment.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <p className="text-sm">{comment.content}</p>

      <div className="flex items-center gap-2 mt-3">
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
            className="text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
        
        {hasReplies && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide {comment.childComments?.totalCount ?? 0} {(comment.childComments?.totalCount ?? 0) === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show {comment.childComments?.totalCount ?? 0} {(comment.childComments?.totalCount ?? 0) === 1 ? 'reply' : 'replies'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {isReplying && (
        <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[60px] text-sm"
            autoFocus
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
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!replyContent.trim()}>
              <Send className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        </form>
      )}

      {/* Child Comments */}
      {showReplies && hasReplies && comment.childComments && (
        <div className="mt-3">
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