import { useMutation, useQuery } from '@apollo/client';
import { SignInButton, useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { ReactionDisplay } from '@/components/common/reaction-display';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CREATE_COMMENT, DELETE_COMMENT, UPDATE_COMMENT } from '@/lib/graphql/mutations';
import { GET_COMMENTS_WITH_FILTERS } from '@/lib/graphql/queries';
import { EditingComment, CommentsSectionProps } from '@/lib/types/comment.types';
import { Comment } from '@/lib/types/generated/graphql';
import { cn } from '@/lib/utils';

export function CommentsSection({ parentId, parentType, initialExpanded }: CommentsSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<EditingComment | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  
  // Initialize expanded state - always starts collapsed on page load
  const [isExpanded, setIsExpanded] = useState(initialExpanded ?? false);
  
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
      first: 10, // Load 10 comments at a time
    },
  });

  // Update last seen count when expanding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Update last seen count when expanding
      if (isExpanded && data?.comments?.totalCount) {
        setLastSeenCount(data.comments.totalCount);
        localStorage.setItem(`comments-lastseen-${parentId}`, data.comments.totalCount.toString());
      }
    }
  }, [isExpanded, parentId, data?.comments?.totalCount]);

  // Intersection Observer for infinite scrolling
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      async (entries) => {
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
                
                // Create a Set of existing comment IDs for efficient lookup
                const existingIds = new Set(
                  prev.comments.edges.map((edge: any) => edge.node.id)
                );
                
                // Filter out any duplicate comments from the new results
                const newEdges = fetchMoreResult.comments.edges.filter(
                  (edge: any) => !existingIds.has(edge.node.id)
                );
                
                return {
                  comments: {
                    ...fetchMoreResult.comments,
                    edges: [
                      ...prev.comments.edges,
                      ...newEdges,
                    ],
                  },
                };
              },
            });
          } catch (error) {
            console.error('Error loading more comments:', error);
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
      }) as { comments: { edges: any[]; totalCount: number; pageInfo: any } } | null;

      if (!existingData?.comments) return;

      // Add the new comment to the cache
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
            edges: [...existingData.comments.edges, newEdge],
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
    onCompleted: () => {
      // Remove refetch() - the optimistic update handles it
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      // Only refetch on error
      refetch();
    },
  });

  const [updateCommentInSection] = useMutation(UPDATE_COMMENT, {
    optimisticResponse: ({ id, input }) => {
      // Find the comment being edited from the cached data
      const existingData = data?.comments?.edges?.find(
        ({ node }: { node: Comment }) => node.id === id
      );
      const comment = existingData?.node;
      
      return {
        updateComment: {
          __typename: 'UpdateCommentResponse',
          comment: comment ? {
            __typename: 'Comment',
            id: comment.id,
            userId: comment.userId,
            parentId: comment.parentId,
            parentType: comment.parentType,
            content: input.content,
            createdAt: comment.createdAt,
            updatedAt: new Date().toISOString(),
            deletedAt: comment.deletedAt,
            user: {
              __typename: 'UserSummary',
              id: comment.user.id,
              username: comment.user.username,
              firstName: comment.user.firstName || '',
              lastName: comment.user.lastName || '',
              emailAddress: comment.user.emailAddress,
              imageUrl: comment.user.imageUrl,
            },
            reactions: comment.reactions ? comment.reactions.map((reaction: any) => ({
              __typename: 'Reaction',
              id: reaction.id,
              emoji: reaction.emoji,
              userId: reaction.userId,
              targetId: reaction.targetId,
              targetType: reaction.targetType,
              createdAt: reaction.createdAt,
              updatedAt: reaction.updatedAt,
              user: reaction.user ? {
                __typename: 'UserSummary',
                id: reaction.user.id,
                username: reaction.user.username,
                firstName: reaction.user.firstName || '',
                lastName: reaction.user.lastName || '',
                emailAddress: reaction.user.emailAddress,
                imageUrl: reaction.user.imageUrl,
              } : null,
            })) : [],
          } : {
            __typename: 'Comment',
            id,
            content: input.content,
            userId: user?.id || '',
            parentId,
            parentType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
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
          },
          errors: [],
        },
      };
    },
    update: (cache, { data }) => {
      if (!data?.updateComment?.comment) return;

      const existingData = cache.readQuery({
        query: GET_COMMENTS_WITH_FILTERS,
        variables: { parentId },
      }) as { comments: { edges: any[]; totalCount: number; pageInfo: any } } | null;

      if (!existingData?.comments) return;

      // Update the comment in the cache
      const newEdges = existingData.comments.edges.map((edge: any) => {
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
      // Remove refetch() - the optimistic update handles it
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      // Only refetch on error
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
    if (!newComment.trim() || !user) return;

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
    } catch (error) {
      console.error('Error creating comment:', error);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading comments...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">Error loading comments: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
            {totalComments > 0 ? (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalComments})
              </span>
            ) : (
              <span className="text-sm font-normal text-muted-foreground">
                (No comments yet)
              </span>
            )}
            {!isExpanded && newCommentsCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground animate-pulse">
                {newCommentsCount} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className={cn(isExpanded ? "pt-0" : "")}>
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
            {data?.comments?.edges?.map(({ node: comment }: { node: Comment }) => (
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
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
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
                  <ReactionDisplay 
                    targetId={comment.id} 
                    targetType="comment" 
                    reactions={comment.reactions} 
                  />
                </div>
              </div>
            ))}
            
            {/* Infinite scroll trigger and loading indicator */}
            {data?.comments?.pageInfo?.hasNextPage && (
              <div 
                ref={loadMoreRef} 
                className="flex justify-center py-4"
              >
                {isFetchingMore && (
                  <div className="text-sm text-muted-foreground">
                    Loading more comments...
                  </div>
                )}
              </div>
            )}
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
      </div>
    </Card>
  );
}
