'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';

import { usePublicComments } from '@/hooks/use-public-comments';
import type { ICommentFormProps, ParentType } from '@/types';

export function PublicCommentForm({
  parentId,
  parentType,
  onSuccess,
  onCancel,
  placeholder = 'Write a public comment...',
  autoFocus = false,
  initialContent = '',
  commentId,
}: ICommentFormProps) {
  const { user } = useUser();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { createComment, updateComment, loading } = usePublicComments({
    targetId: parentId,
    targetType: parentType as ParentType,
  });

  // Auto-focus textarea when component mounts
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (initialContent && commentId) {
        // Update existing comment
        await updateComment(commentId, content.trim());
        onSuccess?.(null);
        setContent('');
      } else {
        // Create new comment
        if (!parentId || !parentType) {
          throw new Error('Parent ID and type are required to create a comment');
        }
        await createComment(content.trim());
        onSuccess?.(null);
        setContent('');
      }
    } catch (error) {
      console.error('Error submitting public comment:', error);
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

  return (
    <form
      onSubmit={e => {
        void handleSubmit(e);
      }}
      className="space-y-3"
    >
      <div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
          rows={3}
          disabled={loading || isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {user
            ? `Commenting as ${user.username || user.firstName || 'User'}`
            : 'Commenting anonymously'}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || isSubmitting}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim() || loading || isSubmitting}
            className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </form>
  );
}
