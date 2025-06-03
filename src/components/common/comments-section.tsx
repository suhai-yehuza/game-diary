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
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CREATE_COMMENT, DELETE_COMMENT, UPDATE_COMMENT } from '@/lib/graphql/mutations';
import { GET_COMMENTS_WITH_FILTERS } from '@/lib/graphql/queries';
import { logger } from '@/lib/logger';
import { CommentEdge, CommentConnection } from '@/lib/types/component.types';
import type { Comment } from '@/lib/types/generated/graphql';
import { CommentsSectionProps, EditingComment } from '@/lib/types/social.types';
import { cn } from '@/lib/utils';

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
  const [lastSeenCount, setLastSeenCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`comments-lastseen-${parentId}`);
      return saved !== null ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const { toast } = useToast();

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_COMMENTS_WITH_FILTERS, {
    variables: {
      parentId: parentId,
      first: 10,
    },
  });

  // Update last seen count when expanding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isExpanded && data?.comments?.totalCount) {
        setLastSeenCount(data.comments.totalCount);
        localStorage.setItem(`comments-lastseen-${parentId}`, data.comments.totalCount.toString());
      }
    }
  }, [isExpanded, parentId, data?.comments?.totalCount]);

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
                parentId,
                first: 10,
                after: data.comments.pageInfo.endCursor,
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
  }, [data, loading, isFetchingMore, fetchMore, parentId]);

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
          depth: 0,
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
        __typename: 'CreateCommentPayload',
      },
    }),
    update: (cache, { data }) => {
      if (!data?.createComment?.comment) return;

      const existingData = cache.readQuery({
        query: GET_COMMENTS_WITH_FILTERS,
        variables: { parentId },
      }) as { comments: CommentConnection } | null;

      if (!existingData?.comments) return;

      const newEdge = {
        __typename: 'CommentEdge',
        cursor: `cursor-${data.createComment.comment.id}`,
        node: data.createComment.comment,
      };

      cache.writeQuery({
        query: GET_COMMENTS_WITH_FILTERS,
        variables: { parentId },
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
    },
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
    optimisticResponse: ({ id, input }) => {
      const existingData = data?.comments?.edges?.find(
        ({ node }: { node: Comment }) => node.id === id
      );
      const comment = existingData?.node;

      return {
        updateComment: {
          __typename: 'UpdateCommentResponse',
          comment: comment
            ? {
                ...comment,
                content: input.content,
                updatedAt: new Date().toISOString(),
              }
            : null,
          errors: [],
        },
      };
    },
    update: (cache, { data }) => {
      if (!data?.updateComment?.comment) return;

      const existingData = cache.readQuery({
        query: GET_COMMENTS_WITH_FILTERS,
        variables: { parentId },
      }) as { comments: CommentConnection } | null;

      if (!existingData?.comments) return;

      const newEdges = existingData.comments.edges.map((edge: CommentEdge) => {
        if (edge.node.id === data.updateComment.comment.id) {
          return {
            ...edge,
            node: data.updateComment.comment,
          };
        }
        return edge;
      });

      cache.writeQuery({
        query: GET_COMMENTS_WITH_FILTERS,
        variables: { parentId },
        data: {
          comments: {
            __typename: 'CommentConnection',
            edges: newEdges,
            totalCount: existingData.comments.totalCount,
            pageInfo: existingData.comments.pageInfo,
          },
        },
      });
    },
    onCompleted: () => {
      setEditingComment(null);
    },
    onError: error => {
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
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
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
            </AlertDialogHeader>
            <form onSubmit={handleUpdateComment}>
              <Textarea
                value={editingComment.content}
                onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                className="min-h-[100px] mb-4"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Save Changes</AlertDialogAction>
              </AlertDialogFooter>
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
