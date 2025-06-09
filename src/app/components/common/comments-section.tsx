'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@src/app/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@src/app/components/ui/avatar';
import { Button } from '@src/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@src/app/components/ui/dialog';
import { Textarea } from '@src/app/components/ui/textarea';
import { CREATE_COMMENT, UPDATE_COMMENT, DELETE_COMMENT } from '@src/lib/graphql/mutations';
import { GET_COMMENTS_WITH_FILTERS } from '@src/lib/graphql/queries';
import { API_CONFIG } from '@src/lib/config/api.config';
import type { CommentConnection } from '@src/lib/types/component.types';
import type { CommentsSectionProps } from '@src/lib/types/social.types';
import type { Comment, CreateCommentInput } from '@src/lib/types/generated/graphql';
import { cn } from '@src/lib/utils';

import { CommentItem } from './comment-item';

export function CommentsSection({
  parentId,
  parentType,
  initialExpanded = false,
  embedded = false,
}: CommentsSectionProps & { embedded?: boolean }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(
    null
  );
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchMore, refetch } = useQuery<{ comments: CommentConnection }>(
    GET_COMMENTS_WITH_FILTERS,
    {
      variables: {
        filters: { parentId, parentType },
        pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
    }
  );

  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [
      {
        query: GET_COMMENTS_WITH_FILTERS,
        variables: {
          filters: { parentId, parentType },
          pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  const [updateComment] = useMutation(UPDATE_COMMENT, {
    refetchQueries: [
      {
        query: GET_COMMENTS_WITH_FILTERS,
        variables: {
          filters: { parentId, parentType },
          pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    refetchQueries: [
      {
        query: GET_COMMENTS_WITH_FILTERS,
        variables: {
          filters: { parentId, parentType },
          pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  const totalComments = data?.comments?.totalCount || 0;

  useEffect(() => {
    const loadLastSeenCount = async () => {
      try {
        const stored = localStorage.getItem(`comments_last_seen_${parentId}`);
        if (stored) {
          setLastSeenCount(parseInt(stored, 10));
        }
      } catch (error) {
        console.error('Error loading last seen count:', error);
      }
    };
    loadLastSeenCount();
  }, [parentId]);

  useEffect(() => {
    if (totalComments > lastSeenCount) {
      setNewCommentsCount(totalComments - lastSeenCount);
    }
  }, [totalComments, lastSeenCount]);

  useEffect(() => {
    if (isExpanded && totalComments > 0) {
      const updateLastSeenCount = async () => {
        try {
          localStorage.setItem(`comments_last_seen_${parentId}`, totalComments.toString());
          setLastSeenCount(totalComments);
          setNewCommentsCount(0);
        } catch (error) {
          console.error('Error updating last seen count:', error);
        }
      };
      updateLastSeenCount();
    }
  }, [isExpanded, totalComments, parentId]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [newComment]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && data?.comments?.pageInfo?.hasNextPage && !isFetchingMore) {
          setIsFetchingMore(true);
          fetchMore({
            variables: {
              pagination: {
                first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
                after: data.comments.pageInfo.endCursor,
              },
            },
          }).finally(() => {
            setIsFetchingMore(false);
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [data, fetchMore, isFetchingMore]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const input: CreateCommentInput = {
        parentId,
        parentType,
        content: newComment.trim(),
      };

      await createComment({ variables: { input } });
      setNewComment('');
      setShowCommentInput(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment || !editingComment.content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const input: CreateCommentInput = {
        parentId,
        parentType,
        content: editingComment.content.trim(),
      };

      await updateComment({
        variables: { id: editingComment.id, input },
      });
      setEditingComment(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteComment({ variables: { id: deleteCommentId } });
      setDeleteCommentId(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <Card className="overflow-hidden border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden border-destructive/50">
        <CardHeader className="bg-destructive/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Error loading comments: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const commentsContent = !user ? (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4 text-center">Join the conversation</p>
      <SignInButton mode="modal">
        <Button className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Sign in to comment
        </Button>
      </SignInButton>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="relative">
        {!showCommentInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCommentInput(true)}
            className={cn(
              'w-full justify-start gap-4 h-auto py-4 px-6 rounded-xl',
              'bg-muted/30 hover:bg-muted/50',
              'border border-border/50 hover:border-border',
              'transition-all duration-200',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">Add a comment...</span>
          </Button>
        ) : (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="rounded-xl bg-muted/20 border border-border/50 p-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={user.imageUrl || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => {
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
                        setNewComment(newValue);

                        // Restore cursor position after state update
                        setTimeout(() => {
                          textarea.setSelectionRange(start + 1, start + 1);
                        }, 0);
                      }
                    }}
                    placeholder="Write a comment..."
                    className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                    disabled={isSubmitting}
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {newComment.length > 0 && `${newComment.length} characters`}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCommentInput(false);
                          setNewComment('');
                        }}
                        disabled={isSubmitting}
                        className="h-8 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || isSubmitting}
                        className="h-8 px-4 text-xs"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Posting...
                          </>
                        ) : (
                          'Post'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      {totalComments === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {data?.comments?.edges?.map(({ node }: { node: Comment }, index: number) => (
            <div
              key={node.id}
              className={cn(
                'animate-in slide-in-from-bottom-2 fill-mode-both',
                `delay-[${index * 50}ms]`
              )}
            >
              <CommentItem
                comment={node}
                onEdit={(id, content) => setEditingComment({ id, content })}
                onDelete={setDeleteCommentId}
                refetchComments={refetch}
              />
            </div>
          ))}

          {/* Load More Indicator */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingMore && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-3">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading more comments...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <>
        {/* Comments Content - Completely Seamless Integration */}
        <div>{commentsContent}</div>

        {/* Edit Comment Dialog */}
        {editingComment && (
          <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Comment</DialogTitle>
                <DialogDescription>
                  Make changes to your comment below. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateComment}>
                <Textarea
                  value={editingComment.content}
                  onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                  onKeyDown={e => {
                    // Ensure spacebar works by explicitly handling it
                    if (e.key === ' ' || e.key === 'Space') {
                      e.stopPropagation();
                      // Force the textarea to include the space
                      const textarea = e.target as HTMLTextAreaElement;
                      const start = textarea.selectionStart || 0;
                      const end = textarea.selectionEnd || 0;
                      const currentValue = textarea.value;
                      const newValue = currentValue.slice(0, start) + ' ' + currentValue.slice(end);

                      // Prevent default and manually handle the space
                      e.preventDefault();
                      setEditingComment({ ...editingComment, content: newValue });

                      // Restore cursor position after state update
                      setTimeout(() => {
                        textarea.setSelectionRange(start + 1, start + 1);
                      }, 0);
                    }
                  }}
                  className="min-h-[100px] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingComment(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Comment Dialog */}
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
              <AlertDialogAction
                onClick={handleDeleteComment}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader
          className={cn(
            'cursor-pointer select-none bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 hover:from-muted/60 hover:via-muted/50 hover:to-muted/60 transition-all duration-300',
            isExpanded && 'border-b border-border/30'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="h-5 w-5" />
                {totalComments > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {totalComments > 99 ? '99+' : totalComments}
                  </span>
                )}
              </div>
              <span>Comments</span>
              {!isExpanded && newCommentsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  {newCommentsCount} new
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 transition-transform" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>

        <div
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <CardContent className={cn('p-0', isExpanded && 'p-6')}>{commentsContent}</CardContent>
        </div>
      </Card>

      {/* Edit Comment Dialog */}
      {editingComment && (
        <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Comment</DialogTitle>
              <DialogDescription>
                Make changes to your comment below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateComment}>
              <Textarea
                value={editingComment.content}
                onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                onKeyDown={e => {
                  // Ensure spacebar works by explicitly handling it
                  if (e.key === ' ' || e.key === 'Space') {
                    e.stopPropagation();
                    // Force the textarea to include the space
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart || 0;
                    const end = textarea.selectionEnd || 0;
                    const currentValue = textarea.value;
                    const newValue = currentValue.slice(0, start) + ' ' + currentValue.slice(end);

                    // Prevent default and manually handle the space
                    e.preventDefault();
                    setEditingComment({ ...editingComment, content: newValue });

                    // Restore cursor position after state update
                    setTimeout(() => {
                      textarea.setSelectionRange(start + 1, start + 1);
                    }, 0);
                  }
                }}
                className="min-h-[100px] mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingComment(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Comment Dialog */}
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
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
