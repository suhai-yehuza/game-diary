import { describe, it, expect } from 'vitest';

import {
  REACTION_EMOJIS,
  CLASSIFICATION,
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  CONFERENCES,
  DIVISIONS,
  GAME_STATUS_VALUES,
  RESOURCES,
  SORT_DIRECTION,
  isReactionEmojiKey,
  isReactionEmojiValue,
  getEmojiValue,
  getEmojiKey,
  isGraphQLReactionEmojiType,
  isValidReactionEmoji,
  isValidFriendshipStatus,
  isValidWatchedSetting,
  getEnumValues,
} from '@/lib/constants';

describe('Constants Module', () => {
  describe('REACTION_EMOJIS', () => {
    it('should contain all expected emoji keys', () => {
      expect(REACTION_EMOJIS).toHaveProperty('THUMBS_UP', '👍');
      expect(REACTION_EMOJIS).toHaveProperty('THUMBS_DOWN', '👎');
      expect(REACTION_EMOJIS).toHaveProperty('LOVE', '❤️');
      expect(REACTION_EMOJIS).toHaveProperty('LAUGH', '😂');
      expect(REACTION_EMOJIS).toHaveProperty('WOW', '😮');
      expect(REACTION_EMOJIS).toHaveProperty('SAD', '😢');
      expect(REACTION_EMOJIS).toHaveProperty('ANGRY', '😠');
      expect(REACTION_EMOJIS).toHaveProperty('FIRE', '🔥');
      expect(REACTION_EMOJIS).toHaveProperty('CLAP', '👏');
      expect(REACTION_EMOJIS).toHaveProperty('EYES', '👀');
      expect(REACTION_EMOJIS).toHaveProperty('ROCKET', '🚀');
      expect(REACTION_EMOJIS).toHaveProperty('MUSCLE', '💪');
      expect(REACTION_EMOJIS).toHaveProperty('GOAT', '🐐');
      expect(REACTION_EMOJIS).toHaveProperty('BULLSEYE', '🎯');
      expect(REACTION_EMOJIS).toHaveProperty('BASKETBALL', '🏀');
      expect(REACTION_EMOJIS).toHaveProperty('SOCCER', '⚽');
      expect(REACTION_EMOJIS).toHaveProperty('FOOTBALL', '🏈');
      expect(REACTION_EMOJIS).toHaveProperty('BASEBALL', '⚾');
      expect(REACTION_EMOJIS).toHaveProperty('TENNIS', '🎾');
      expect(REACTION_EMOJIS).toHaveProperty('GOLF', '⛳');
    });
  });

  describe('CLASSIFICATION', () => {
    it('should contain all expected classification values', () => {
      expect(CLASSIFICATION).toHaveProperty('PRIVATE', 'PRIVATE');
      expect(CLASSIFICATION).toHaveProperty('PROTECTED', 'PROTECTED');
      expect(CLASSIFICATION).toHaveProperty('PUBLIC', 'PUBLIC');
    });
  });

  describe('FRIENDSHIP_STATUS', () => {
    it('should contain all expected friendship status values', () => {
      expect(FRIENDSHIP_STATUS).toHaveProperty('ACCEPTED', 'ACCEPTED');
      expect(FRIENDSHIP_STATUS).toHaveProperty('BLOCKED', 'BLOCKED');
      expect(FRIENDSHIP_STATUS).toHaveProperty('PENDING', 'PENDING');
      expect(FRIENDSHIP_STATUS).toHaveProperty('REJECTED', 'REJECTED');
    });
  });

  describe('WATCHED_SETTING', () => {
    it('should contain all expected watched setting values', () => {
      expect(WATCHED_SETTING).toHaveProperty('TV', 'TV');
      expect(WATCHED_SETTING).toHaveProperty('ARENA', 'ARENA');
      expect(WATCHED_SETTING).toHaveProperty('PHONE', 'PHONE');
      expect(WATCHED_SETTING).toHaveProperty('LAPTOP', 'LAPTOP');
      expect(WATCHED_SETTING).toHaveProperty('BAR', 'BAR');
      expect(WATCHED_SETTING).toHaveProperty('HOME', 'HOME');
      expect(WATCHED_SETTING).toHaveProperty('OTHER', 'OTHER');
    });
  });

  describe('WATCHED_SCOPE', () => {
    it('should contain all expected watched scope values', () => {
      expect(WATCHED_SCOPE).toHaveProperty('FULL_GAME', 'FULL_GAME');
      expect(WATCHED_SCOPE).toHaveProperty('HALF_GAME', 'HALF_GAME');
      expect(WATCHED_SCOPE).toHaveProperty('HIGHLIGHTS', 'HIGHLIGHTS');
      expect(WATCHED_SCOPE).toHaveProperty('PRE_GAME', 'PRE_GAME');
      expect(WATCHED_SCOPE).toHaveProperty('POST_GAME', 'POST_GAME');
      expect(WATCHED_SCOPE).toHaveProperty('SHORTS', 'SHORTS');
      expect(WATCHED_SCOPE).toHaveProperty('OTHER', 'OTHER');
    });
  });

  describe('CONFERENCES', () => {
    it('should contain all expected conference values', () => {
      expect(CONFERENCES).toHaveProperty('EAST', 'EAST');
      expect(CONFERENCES).toHaveProperty('WEST', 'WEST');
    });
  });

  describe('DIVISIONS', () => {
    it('should contain all expected division values', () => {
      expect(DIVISIONS).toHaveProperty('ATLANTIC', 'ATLANTIC');
      expect(DIVISIONS).toHaveProperty('CENTRAL', 'CENTRAL');
      expect(DIVISIONS).toHaveProperty('SOUTHEAST', 'SOUTHEAST');
      expect(DIVISIONS).toHaveProperty('NORTHWEST', 'NORTHWEST');
      expect(DIVISIONS).toHaveProperty('PACIFIC', 'PACIFIC');
      expect(DIVISIONS).toHaveProperty('SOUTHWEST', 'SOUTHWEST');
    });
  });

  describe('GAME_STATUS_VALUES', () => {
    it('should contain all expected game status values', () => {
      expect(GAME_STATUS_VALUES).toHaveProperty('FINISHED', 'FINISHED');
      expect(GAME_STATUS_VALUES).toHaveProperty('LIVE', 'LIVE');
      expect(GAME_STATUS_VALUES).toHaveProperty('SCHEDULED', 'SCHEDULED');
    });
  });

  describe('RESOURCES', () => {
    it('should contain all expected resource values', () => {
      expect(RESOURCES).toHaveProperty('USER', 'USER');
      expect(RESOURCES).toHaveProperty('GAME_LOG', 'GAME_LOG');
      expect(RESOURCES).toHaveProperty('COMMENT', 'COMMENT');
      expect(RESOURCES).toHaveProperty('REACTION', 'REACTION');
      expect(RESOURCES).toHaveProperty('FRIENDSHIP', 'FRIENDSHIP');
      expect(RESOURCES).toHaveProperty('GAME_RATING', 'GAME_RATING');
    });
  });

  describe('SORT_DIRECTION', () => {
    it('should contain all expected sort direction values', () => {
      expect(SORT_DIRECTION).toHaveProperty('ASC', 'ASC');
      expect(SORT_DIRECTION).toHaveProperty('DESC', 'DESC');
    });
  });

  describe('isReactionEmojiKey', () => {
    it('should return true for valid emoji keys', () => {
      expect(isReactionEmojiKey('THUMBS_UP')).toBe(true);
      expect(isReactionEmojiKey('LOVE')).toBe(true);
      expect(isReactionEmojiKey('FIRE')).toBe(true);
    });

    it('should return false for invalid emoji keys', () => {
      expect(isReactionEmojiKey('INVALID')).toBe(false);
      expect(isReactionEmojiKey('')).toBe(false);
      expect(isReactionEmojiKey('thumbs_up')).toBe(false);
    });
  });

  describe('isReactionEmojiValue', () => {
    it('should return true for valid emoji values', () => {
      expect(isReactionEmojiValue('👍')).toBe(true);
      expect(isReactionEmojiValue('❤️')).toBe(true);
      expect(isReactionEmojiValue('🔥')).toBe(true);
    });

    it('should return false for invalid emoji values', () => {
      expect(isReactionEmojiValue('😀')).toBe(false);
      expect(isReactionEmojiValue('')).toBe(false);
      expect(isReactionEmojiValue('invalid')).toBe(false);
    });
  });

  describe('getEmojiValue', () => {
    it('should return correct emoji value for valid key', () => {
      expect(getEmojiValue('THUMBS_UP')).toBe('👍');
      expect(getEmojiValue('LOVE')).toBe('❤️');
      expect(getEmojiValue('FIRE')).toBe('🔥');
    });

    it('should return correct emoji value for all keys', () => {
      Object.entries(REACTION_EMOJIS).forEach(([key, value]) => {
        expect(getEmojiValue(key as any)).toBe(value);
      });
    });
  });

  describe('getEmojiKey', () => {
    it('should return correct key for valid emoji value', () => {
      expect(getEmojiKey('👍')).toBe('THUMBS_UP');
      expect(getEmojiKey('❤️')).toBe('LOVE');
      expect(getEmojiKey('🔥')).toBe('FIRE');
    });

    it('should throw error for invalid emoji value', () => {
      expect(() => getEmojiKey('😀' as any)).toThrow('Invalid emoji value: 😀');
      expect(() => getEmojiKey('' as any)).toThrow('Invalid emoji value: ');
    });
  });

  describe('isGraphQLReactionEmojiType', () => {
    it('should return true for valid GraphQL emoji types', () => {
      expect(isGraphQLReactionEmojiType('THUMBS_UP')).toBe(true);
      expect(isGraphQLReactionEmojiType('LOVE')).toBe(true);
      expect(isGraphQLReactionEmojiType('FIRE')).toBe(true);
    });

    it('should return false for invalid GraphQL emoji types', () => {
      expect(isGraphQLReactionEmojiType('INVALID')).toBe(false);
      expect(isGraphQLReactionEmojiType('')).toBe(false);
    });
  });

  describe('isValidReactionEmoji', () => {
    it('should return true for valid reaction emojis', () => {
      expect(isValidReactionEmoji('👍')).toBe(true);
      expect(isValidReactionEmoji('❤️')).toBe(true);
      expect(isValidReactionEmoji('🔥')).toBe(true);
    });

    it('should return false for invalid reaction emojis', () => {
      expect(isValidReactionEmoji('😀')).toBe(false);
      expect(isValidReactionEmoji('')).toBe(false);
      expect(isValidReactionEmoji('invalid')).toBe(false);
    });
  });

  describe('isValidFriendshipStatus', () => {
    it('should return true for valid friendship statuses', () => {
      expect(isValidFriendshipStatus('ACCEPTED')).toBe(true);
      expect(isValidFriendshipStatus('BLOCKED')).toBe(true);
      expect(isValidFriendshipStatus('PENDING')).toBe(true);
      expect(isValidFriendshipStatus('REJECTED')).toBe(true);
    });

    it('should return false for invalid friendship statuses', () => {
      expect(isValidFriendshipStatus('INVALID')).toBe(false);
      expect(isValidFriendshipStatus('')).toBe(false);
      expect(isValidFriendshipStatus('accepted')).toBe(false);
    });
  });

  describe('isValidWatchedSetting', () => {
    it('should return true for valid watched settings', () => {
      expect(isValidWatchedSetting('TV')).toBe(true);
      expect(isValidWatchedSetting('ARENA')).toBe(true);
      expect(isValidWatchedSetting('PHONE')).toBe(true);
      expect(isValidWatchedSetting('LAPTOP')).toBe(true);
      expect(isValidWatchedSetting('BAR')).toBe(true);
      expect(isValidWatchedSetting('HOME')).toBe(true);
      expect(isValidWatchedSetting('OTHER')).toBe(true);
    });

    it('should return false for invalid watched settings', () => {
      expect(isValidWatchedSetting('INVALID')).toBe(false);
      expect(isValidWatchedSetting('')).toBe(false);
      expect(isValidWatchedSetting('tv')).toBe(false);
    });
  });

  describe('getEnumValues', () => {
    it('should return correct game status values', () => {
      const values = getEnumValues.gameStatus();
      expect(values).toEqual(['FINISHED', 'LIVE', 'SCHEDULED']);
    });

    it('should return correct friendship status values', () => {
      const values = getEnumValues.friendshipStatus();
      expect(values).toEqual(['ACCEPTED', 'BLOCKED', 'PENDING', 'REJECTED']);
    });

    it('should return correct watched setting values', () => {
      const values = getEnumValues.watchedSetting();
      expect(values).toEqual(['TV', 'ARENA', 'PHONE', 'LAPTOP', 'BAR', 'HOME', 'OTHER']);
    });

    it('should return correct watched scope values', () => {
      const values = getEnumValues.watchedScope();
      expect(values).toEqual([
        'FULL_GAME',
        'HALF_GAME',
        'HIGHLIGHTS',
        'PRE_GAME',
        'POST_GAME',
        'SHORTS',
        'OTHER',
      ]);
    });

    it('should return correct classification values', () => {
      const values = getEnumValues.classification();
      expect(values).toEqual(['PRIVATE', 'PROTECTED', 'PUBLIC']);
    });

    it('should return correct reaction emoji values', () => {
      const values = getEnumValues.reactionEmojis();
      expect(values).toContain('👍');
      expect(values).toContain('❤️');
      expect(values).toContain('🔥');
      expect(values).toHaveLength(Object.keys(REACTION_EMOJIS).length);
    });

    it('should return correct resource values', () => {
      const values = getEnumValues.resources();
      expect(values).toEqual([
        'USER',
        'GAME_LOG',
        'COMMENT',
        'REACTION',
        'FRIENDSHIP',
        'GAME_RATING',
      ]);
    });

    it('should return correct sort direction values', () => {
      const values = getEnumValues.sortDirection();
      expect(values).toEqual(['ASC', 'DESC']);
    });
  });
});
