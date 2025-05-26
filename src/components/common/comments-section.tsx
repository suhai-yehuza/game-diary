import { useMutation, useQuery } from '@apollo/client';
import { SignInButton, useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MessageSquare, Send, Smile, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import {
  CREATE_COMMENT,
  CREATE_REACTION,
  DELETE_REACTION,
  UPDATE_COMMENT,
  DELETE_COMMENT,
} from '@/lib/graphql/mutations';
import { GET_COMMENTS_WITH_FILTERS } from '@/lib/graphql/queries';
import { Comment, Reaction, EditingComment, CommentsSectionProps } from '@/lib/types';

export function CommentsSection({ parent_id, parent_type }: CommentsSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<EditingComment | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data, loading, error, refetch } = useQuery(GET_COMMENTS_WITH_FILTERS, {
    variables: {
      filters: {
        parent_id: parent_id,
        parent_type: parent_type,
      },
    },
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setNewComment('');
      refetch();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [updateCommentInSection] = useMutation(UPDATE_COMMENT, {
    onCompleted: () => {
      setEditingComment(null);
      refetch();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [deleteCommentInSection] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      setDeleteCommentId(null);
      refetch();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [createReaction] = useMutation(CREATE_REACTION, {
    onCompleted: () => {
      refetch();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [deleteReaction] = useMutation(DELETE_REACTION, {
    onCompleted: () => {
      refetch();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await createComment({
      variables: {
        input: {
          user_id: user.id,
          parent_id: parent_id,
          parent_type: parent_type,
          content: newComment,
        },
      },
    });
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      const comment = data?.comments?.find((c: Comment) => c.id === commentId);
      if (!comment) {
        return;
      }

      const existingReaction = comment.reactions.find(
        (r: Reaction) => r.user.id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        if (!existingReaction.id) {
          return;
        }

        await deleteReaction({
          variables: { id: existingReaction.id },
          onCompleted: () => {
            refetch();
          },
        });
      } else {
        await createReaction({
          variables: {
            input: {
              user_id: user.id,
              target_id: commentId,
              target_type: 'COMMENT',
              emoji,
            },
          },
          onCompleted: () => {
            refetch();
          },
        });
      }
    } catch (error) {
      console.error('Error creating reaction:', error);
    }
  };

  const getReactionCount = (comment: Comment, emoji: string) => {
    return comment.reactions.filter((r: Reaction) => r.emoji === emoji).length;
  };

  const getReactionUsers = (comment: Comment, emoji: string) => {
    return comment.reactions
      .filter((r: Reaction) => r.emoji === emoji)
      .map((r: Reaction) => r.user.username)
      .join(', ');
  };

  const hasUserReacted = (comment: Comment, emoji: string) => {
    return comment.reactions.some((r: Reaction) => r.user.id === user?.id && r.emoji === emoji);
  };

  const onEmojiClick = async (emojiData: EmojiClickData, commentId: string) => {
    await handleReaction(commentId, emojiData.emoji);
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;
    await updateCommentInSection({
      variables: {
        id: editingComment.id,
        input: { content: editingComment.content },
      },
    });
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    await deleteCommentInSection({
      variables: { id: deleteCommentId },
    });
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div>Error loading comments: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="flex items-center justify-center p-4">
            <SignInButton mode="modal">
              <Button>Sign in to comment</Button>
            </SignInButton>
          </div>
        ) : (
          <form onSubmit={handleSubmitComment} className="mb-4">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="mb-2"
            />
            <Button type="submit" disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {data?.comments?.map((comment: Comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={comment.user.imageUrl ?? undefined} />
                    <AvatarFallback>
                      {comment.user.username?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{comment.user.username}</div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {user?.id === comment.user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          setEditingComment({ id: comment.id, content: comment.content })
                        }
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteCommentId(comment.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {editingComment?.id === comment.id ? (
                <form onSubmit={handleUpdateComment} className="mt-2">
                  <Textarea
                    value={editingComment.content}
                    onChange={e =>
                      setEditingComment({ ...editingComment, content: e.target.value })
                    }
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingComment(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="mt-2">{comment.content}</p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <EmojiPicker onEmojiClick={emojiData => onEmojiClick(emojiData, comment.id)} />
                  </PopoverContent>
                </Popover>

                {comment.reactions.length > 0 && (
                  <div className="flex gap-1">
                    {Array.from(new Set(comment.reactions.map((r: Reaction) => r.emoji))).map(
                      emoji => (
                        <TooltipProvider key={emoji}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={hasUserReacted(comment, emoji) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleReaction(comment.id, emoji)}
                              >
                                {emoji} {getReactionCount(comment, emoji)}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getReactionUsers(comment, emoji)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this comment? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
