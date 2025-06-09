import { useMutation, useQuery } from '@apollo/client';
import { SignInButton, useUser } from '@clerk/nextjs';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@src/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar';
import { Button } from '@src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/components/ui/card';
import { Textarea } from '@src/components/ui/textarea';
import { useToast } from '@src/components/ui/use-toast';
import { clientCache, CLIENT_CACHE_KEYS } from '@src/lib/cache/client';
import { CREATE_COMMENT, DELETE_COMMENT, UPDATE_COMMENT } from '@src/lib/graphql/mutations';
import { GET_COMMENTS_WITH_FILTERS } from '@src/lib/graphql/queries';
import { logger } from 'lib/core/logger';
import type { CommentEdge, CommentConnection } from '@src/lib/types/component.types';
import type { Comment } from '@src/lib/types/generated/graphql';
import type { CommentsSectionProps, EditingComment } from '@src/lib/types/social.types';
import { cn } from '@src/lib/utils';

import { CommentItem } from './comment-item';

export function CommentsSection({ parentId, parentType, initialExpanded }: CommentsSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<EditingComment | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize expanded state
  const [isExpanded, setIsExpanded] = useState(initialExpanded ?? false);

  // State for comment input visibility
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track last seen comment count
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [isLastSeenLoaded, setIsLastSeenLoaded] = useState(false);

  const { toast } = useToast();

  // Load last seen count from Redis cache on mount
  useEffect(() => {
    const loadLastSeenCount = async () => {
      if (!clientCache.isClientSide()) {
        setIsLastSeenLoaded(true);
        return;
      }

      try {
        const cacheKey = CLIENT_CACHE_KEYS.COMMENTS_LAST_SEEN(parentId);
        const saved = await clientCache.getItem<string>(cacheKey);
        const count = saved !== null ? parseInt(saved, 10) : 0;
        setLastSeenCount(isNaN(count) ? 0 : count);
      } catch (error) {
        console.error('Failed to load last seen count from cache:', error);
      } finally {
        setIsLastSeenLoaded(true);
      }
    };

    loadLastSeenCount();
  }, [parentId]);

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_COMMENTS_WITH_FILTERS, {
    variables: {
      filters: {
        parentId: parentId,
        parentType: parentType,
      },
      pagination: {
        first: 10,
      },
    },
  });

  // Update last seen count when expanding
  useEffect(() => {
    const updateLastSeenCount = async () => {
      if (!isLastSeenLoaded || !clientCache.isClientSide()) return;

      if (isExpanded && data?.comments?.totalCount) {
        const newCount = data.comments.totalCount;
        setLastSeenCount(newCount);

        try {
          const cacheKey = CLIENT_CACHE_KEYS.COMMENTS_LAST_SEEN(parentId);
          await clientCache.setItem(
            cacheKey,
            newCount.toString(),
            60 * 60 * 24 * 7 // 7 days TTL
          );
        } catch (error) {
          console.error('Failed to save last seen count to cache:', error);
        }
      }
    };

    updateLastSeenCount();
  }, [isExpanded, parentId, data?.comments?.totalCount, isLastSeenLoaded]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    adjustHeight(); // Initial adjustment

    return () => textarea.removeEventListener('input', adjustHeight);
  }, [showCommentInput]);

  // Intersection Observer for infinite scrolling
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      async entries => {
        const [target] = entries;
        if (
          target.isIntersecting &&
          !loading &&
          !isFetchingMore &&
          data?.comments?.pageInfo?.hasNextPage
        ) {
          setIsFetchingMore(true);
          try {
            await fetchMore({
              variables: {
                filters: {
                  parentId,
                  parentType,
                },
                pagination: {
                  first: 10,
                  after: data.comments.pageInfo.endCursor,
                },
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;

                const existingIds = new Set(
                  prev.comments.edges.map((edge: CommentEdge) => edge.node.id)
                );

                const newEdges = fetchMoreResult.comments.edges.filter(
                  (edge: CommentEdge) => !existingIds.has(edge.node.id)
                );

                return {
                  comments: {
                    ...fetchMoreResult.comments,
                    edges: [...prev.comments.edges, ...newEdges],
                  },
                };
              },
            });
          } catch (error) {
            logger.error('Error loading more comments:', error);
          } finally {
            setIsFetchingMore(false);
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [data, loading, isFetchingMore, fetchMore, parentId, parentType]);

  const [createComment] = useMutation(CREATE_COMMENT, {
    optimisticResponse: ({ input }) => ({
      createComment: {
        comment: {
          __typename: 'Comment',
          id: `temp-${Date.now()}`,
          content: input.content,
          userId: user?.id || '',
          parentId: input.parentId,
          parentType: input.parentType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
          depth: input.parentType === 'comment' ? 1 : 0, // Set depth based on parent type
          user: {
            __typename: 'UserSummary',
            id: user?.id || '',
            username: user?.username || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            emailAddress: user?.emailAddresses?.[0]?.emailAddress || '',
            imageUrl: user?.imageUrl || null,
          },
          reactions: [],
          childComments: {
            __typename: 'CommentConnection',
            edges: [],
            totalCount: 0,
          },
        },
        errors: [],
        __typename: 'CreateCommentResponse',
      },
    }),
    update: (cache, { data }) => {
      if (!data?.createComment?.comment) return;

      try {
        // Use the same variables as the original query
        const existingData = cache.readQuery({
          query: GET_COMMENTS_WITH_FILTERS,
          variables: {
            filters: {
              parentId: parentId,
              parentType: parentType,
            },
            pagination: {
              first: 10,
            },
          },
        }) as { comments: CommentConnection } | null;

        if (!existingData?.comments) return;

        const newEdge = {
          __typename: 'CommentEdge',
          cursor: `cursor-${data.createComment.comment.id}`,
          node: data.createComment.comment,
        };

        cache.writeQuery({
          query: GET_COMMENTS_WITH_FILTERS,
          variables: {
            filters: {
              parentId: parentId,
              parentType: parentType,
            },
            pagination: {
              first: 10,
            },
          },
          data: {
            comments: {
              __typename: 'CommentConnection',
              edges: [newEdge, ...existingData.comments.edges],
              totalCount: existingData.comments.totalCount + 1,
              pageInfo: existingData.comments.pageInfo || {
                __typename: 'PageInfo',
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
              },
            },
          },
        });
      } catch (error) {
        // If cache update fails, fallback to refetch
        console.warn('Cache update failed, will refetch:', error);
      }
    },
    refetchQueries: [
      {
        query: GET_COMMENTS_WITH_FILTERS,
        variables: {
          filters: {
            parentId: parentId,
            parentType: parentType,
          },
          pagination: {
            first: 10,
          },
        },
      },
    ],
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      refetch();
    },
  });

  const [updateCommentInSection] = useMutation(UPDATE_COMMENT, {
    onCompleted: (data) => {
      console.log('Comment update completed:', data);
      setEditingComment(null);
      // Always refetch to ensure we have the latest data
      refetch();
    },
    onError: (error) => {
      console.error('Comment update error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      refetch();
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComment({
        variables: {
          input: {
            parentId: parentId,
            parentType: parentType,
            content: newComment,
          },
        },
      });
      setNewComment('');
      setShowCommentInput(false);
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added to the discussion.',
      });
    } catch (error) {
      logger.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment) return;
    
    console.log('Updating comment:', editingComment.id, 'with content:', editingComment.content);
    
    try {
      const result = await updateCommentInSection({
        variables: {
          id: editingComment.id,
          input: { 
            content: editingComment.content,
            parentId: parentId,
            parentType: parentType
          },
        },
      });
      
      console.log('Update result:', result);
      
      if (result.data?.updateComment?.errors && result.data.updateComment.errors.length > 0) {
        console.error('Update errors:', result.data.updateComment.errors);
        toast({
          title: 'Update Failed',
          description: result.data.updateComment.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Comment Updated',
        description: 'Your comment has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    await deleteCommentInSection({
      variables: { id: deleteCommentId },
    });
  };

  const totalComments = data?.comments?.totalCount || 0;
  const newCommentsCount = Math.max(0, totalComments - lastSeenCount);

  if (loading && !data) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading comments...</span>
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

  return (
    <>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader
          className={cn(
            'cursor-pointer select-none bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/60 hover:to-muted/40 transition-colors',
            isExpanded && 'border-b'
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
          <CardContent className={cn('p-0', isExpanded && 'p-4')}>
            {!user ? (
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
                        'w-full justify-start gap-3 h-auto py-4 px-5',
                        'bg-muted/30 backdrop-blur-sm',
                        'border-2 border-dashed border-muted-foreground/20',
                        'hover:border-solid hover:border-primary/30 hover:bg-muted/50',
                        'hover:shadow-sm',
                        'transition-all duration-300',
                        'group'
                      )}
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage src={user.imageUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground font-normal text-base">
                        Share your thoughts...
                      </span>
                      <MessageCircle className="h-4 w-4 text-muted-foreground/50 ml-auto transition-transform group-hover:scale-110" />
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmitComment} className="space-y-3">
                      <div className="flex gap-3 p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50 shadow-sm">
                        <Avatar className="h-10 w-10 mt-1 ring-2 ring-background shadow-sm">
                          <AvatarImage src={user.imageUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="relative">
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
                                  const newValue = currentValue.slice(0, start) + ' ' + currentValue.slice(end);
                                  
                                  // Prevent default and manually handle the space
                                  e.preventDefault();
                                  setNewComment(newValue);
                                  
                                  // Restore cursor position after state update
                                  setTimeout(() => {
                                    textarea.setSelectionRange(start + 1, start + 1);
                                  }, 0);
                                }
                              }}
                              placeholder="Share your thoughts..."
                              className={cn(
                                'min-h-[100px] resize-none rounded-lg',
                                'bg-background/50 backdrop-blur-sm',
                                'border-2 border-transparent',
                                'focus:border-primary/50 focus:ring-4 focus:ring-primary/10',
                                'placeholder:text-muted-foreground/60',
                                'transition-all duration-200',
                                'text-base leading-relaxed'
                              )}
                              disabled={isSubmitting}
                            />
                            {newComment.length > 0 && (
                              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/50">
                                {newComment.length} characters
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>Markdown supported</span>
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
                                className="hover:bg-muted/50"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                size="sm"
                                disabled={!newComment.trim() || isSubmitting}
                                className={cn(
                                  'gap-2 min-w-[120px]',
                                  'bg-primary hover:bg-primary/90',
                                  'shadow-sm hover:shadow-md',
                                  'transition-all duration-200'
                                )}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Posting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Post Comment</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Comments List */}
                {totalComments === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Be the first to comment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.comments?.edges?.map(({ node }: { node: Comment }) => (
                      <CommentItem
                        key={node.id}
                        comment={node}
                        onEdit={(id, content) => setEditingComment({ id, content })}
                        onDelete={setDeleteCommentId}
                        refetchComments={refetch}
                      />
                    ))}

                    {/* Load More Indicator */}
                    <div ref={loadMoreRef} className="py-2">
                      {isFetchingMore && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading more comments...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Edit Comment Dialog */}
      {editingComment && (
        <AlertDialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Comment</AlertDialogTitle>
              <AlertDialogDescription>
                Make changes to your comment below. Click save when you're done.
              </AlertDialogDescription>
            </AlertDialogHeader>
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingComment(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </AlertDialogContent>
        </AlertDialog>
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
