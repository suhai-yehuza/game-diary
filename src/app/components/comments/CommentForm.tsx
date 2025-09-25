'use client';

import { useUser } from '@clerk/nextjs';
import { Send, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Textarea } from '@/app/components/ui';
import { useCreateComment, useUpdateComment } from '@/hooks/use-comments';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { IComment, ICommentFormProps, ParentType } from '@/types';

export function CommentForm({
  parentId,
  parentType,
  onSuccess,
  onCancel,
  placeholder = 'Write a comment...',
  autoFocus = false,
  initialContent = '',
  commentId,
}: ICommentFormProps) {
  const { user } = useUser();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createComment, loading: createLoading } = useCreateComment();
  const { updateComment, loading: updateLoading } = useUpdateComment();

  const loading = createLoading || updateLoading || isSubmitting;

  useEffect(() => {
    if (autoFocus) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user?.id || loading) return;

    setIsSubmitting(true);
    try {
      if (initialContent && commentId) {
        // Update existing comment
        const result = await updateComment({ id: commentId, content: content.trim() });
        if (result?.data?.updateComment?.comment) {
          onSuccess?.(result.data.updateComment.comment as IComment);
          setContent('');
        }
      } else {
        // Create new comment
        if (!parentId || !parentType) {
          throw new Error('Parent ID and type are required to create a comment');
        }
        const result = await createComment({
          parentId,
          parentType: parentType as ParentType,
          content: content.trim(),
        });
        if (result?.data?.createComment?.comment) {
          onSuccess?.(result.data.createComment.comment as IComment);
          setContent('');
        }
      }
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'React Component',
        action: 'Submit comment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleSubmit(e);
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!user) {
    return <div className="p-4 text-center text-theme-muted">Please sign in to comment.</div>;
  }

  return (
    <form
      onSubmit={e => {
        void handleSubmit(e);
      }}
      className="space-y-3"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-semantic-info/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-semantic-info">
            {user.firstName?.[0] || user.username?.[0] || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] resize-none border-theme-primary focus:border-brand-primary text-theme-primary"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-theme-muted">Press Cmd+Enter to submit, Esc to cancel</div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {initialContent ? 'Update' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
