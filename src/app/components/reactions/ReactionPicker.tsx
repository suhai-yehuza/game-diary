import { useUser } from '@clerk/nextjs';
import { Smile, X } from 'lucide-react';
import React, { useState, useCallback, memo } from 'react';

import { useReactions } from '@/hooks/use-reactions';
import type { IReaction, IReactionPickerProps, ParentType } from '@/types';

import { MemoizedReactionButton } from './MemoizedReactionButton';

// Check if user has reacted with specific emoji
const hasUserReacted = (reactions: IReaction[], emoji: string, userId: string) => {
  return reactions.some(reaction => reaction.emoji === emoji && reaction.user?.id === userId);
};

export const ReactionPicker = memo(function ReactionPicker({
  targetId,
  targetType,
  skip = false,
}: IReactionPickerProps & { skip?: boolean }) {
  const { user } = useUser();
  const currentUserId = user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [showMoreReactions, setShowMoreReactions] = useState(false);

  // Use the full reactions hook with mutation capabilities
  const { reactions, reactionGroups, loading, toggleReaction } = useReactions({
    targetId,
    targetType: targetType as ParentType,
    skip,
  });

  // Toggle picker - no need to fetch, just show/hide
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Handle reaction click
  const handleReactionClick = useCallback(
    async (emoji: string) => {
      if (!currentUserId) return;

      try {
        // Use the actual toggle reaction functionality
        await toggleReaction(emoji);
        // Auto-close picker after reaction
        setIsOpen(false);
      } catch (error) {
        console.error('Error toggling reaction:', error);
      }
    },
    [currentUserId, toggleReaction, setIsOpen]
  );

  // Close picker
  const closePicker = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
  }, []);

  // Add keyboard event listener
  React.useEffect(() => {
    if (isOpen) {
      const keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', keydownHandler);
      return () => {
        document.removeEventListener('keydown', keydownHandler);
      };
    }
  }, [isOpen]);

  // Emoji categories
  const PRIMARY_REACTIONS = ['👍', '👎', '❤️', '🔥', '😂'];
  const SPORTS_REACTIONS = ['🏀', '⚽', '🏈', '⚾', '🏒'];
  const EMOTIONS_REACTIONS = ['😍', '🤔', '😮', '😢', '😡'];
  const ACTION_REACTIONS = ['👏', '🙌', '💪', '🎉', '🚀'];

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="reaction-picker">
      {/* Existing reactions displayed on the card */}
      {reactionGroups
        .filter(group => group.count > 0)
        .map(group => (
          <MemoizedReactionButton
            key={group.emoji}
            group={group}
            onClick={() => void handleReactionClick(group.emoji)}
            loading={loading}
            sizeClasses="p-1.5 text-sm"
            showCount={true}
          />
        ))}

      {/* React/Hide Button */}
      <div className="relative">
        <button
          onClick={handleToggle}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          className="flex items-center gap-1 px-2 py-1 text-sm text-theme-muted hover:text-text-inverse hover:bg-theme-muted rounded-md transition-colors"
          title={isOpen ? 'Hide Reactions' : 'Show Reactions'}
          aria-label="Add reaction"
        >
          <Smile className="w-4 h-4" />
          <span className="text-xs">{isOpen ? 'Hide' : 'React'}</span>
        </button>

        {/* Enhanced Reaction Picker Dropdown */}
        {isOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 w-80 bg-surface-card border border-theme-primary rounded-xl shadow-2xl z-[9999] backdrop-blur-sm"
            style={{
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
          >
            {/* Enhanced Content with Categories */}
            <div className="p-4">
              {/* Primary Reactions with Close Button */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                    Quick Reactions
                  </h4>
                  <button
                    onClick={closePicker}
                    className="text-theme-muted hover:text-theme-primary p-1.5 hover:bg-bg-theme-secondary rounded-lg transition-all duration-200"
                    aria-label="Close"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {PRIMARY_REACTIONS.map(emoji => {
                    const userHasReacted =
                      currentUserId && hasUserReacted(reactions, emoji, currentUserId);
                    const reactionCount =
                      reactionGroups.find(group => group.emoji === emoji)?.count || 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => void handleReactionClick(emoji)}
                        className={`group flex flex-col items-center p-2.5 hover:bg-bg-theme-secondary rounded-xl transition-all duration-200 hover:scale-105 ${
                          userHasReacted
                            ? 'bg-semantic-info/10 border-2 border-semantic-info/30 shadow-sm'
                            : 'hover:shadow-sm border border-transparent hover:border-theme-primary'
                        }`}
                        title={`${emoji} ${reactionCount > 0 ? `(${reactionCount})` : ''}`}
                        data-testid={`reaction-${emoji}`}
                        aria-label={`React with ${emoji}`}
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                          {emoji}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible More Reactions */}
              <div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    console.log('More reactions button clicked, current state:', showMoreReactions);
                    setShowMoreReactions(!showMoreReactions);
                  }}
                  className="flex items-center justify-between w-full mb-3 p-2 hover:bg-bg-theme-secondary rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-expanded={showMoreReactions}
                  aria-label={showMoreReactions ? 'Hide more reactions' : 'Show more reactions'}
                >
                  <h4 className="text-xs font-medium text-theme-muted uppercase tracking-wide">
                    More Reactions
                  </h4>
                  <span className="text-theme-muted text-sm font-medium">
                    {showMoreReactions ? '−' : '+'}
                  </span>
                </button>

                {showMoreReactions && (
                  <div className="grid grid-cols-8 gap-1.5 animate-in slide-in-from-top-2 duration-200 border-t border-theme-primary pt-3">
                    {[...SPORTS_REACTIONS, ...EMOTIONS_REACTIONS, ...ACTION_REACTIONS].map(
                      emoji => {
                        const userHasReacted =
                          currentUserId && hasUserReacted(reactions, emoji, currentUserId);
                        const reactionCount =
                          reactionGroups.find(group => group.emoji === emoji)?.count || 0;
                        return (
                          <button
                            key={emoji}
                            onClick={() => void handleReactionClick(emoji)}
                            className={`group flex flex-col items-center p-2 hover:bg-bg-theme-secondary rounded-lg transition-all duration-200 hover:scale-105 ${
                              userHasReacted
                                ? 'bg-semantic-info/10 border-2 border-semantic-info/30 shadow-sm'
                                : 'hover:shadow-sm border border-transparent hover:border-theme-primary'
                            }`}
                            title={`${emoji} ${reactionCount > 0 ? `(${reactionCount})` : ''}`}
                            data-testid={`reaction-${emoji}`}
                            aria-label={`React with ${emoji}`}
                          >
                            <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                              {emoji}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ReactionPicker;
