// Schema-specific constants to avoid circular dependencies
export const CLASSIFICATION = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  PROTECTED: 'PROTECTED',
} as const;

export const WATCHED_SETTING = {
  TV: 'TV',
  STREAMING: 'STREAMING',
  IN_PERSON: 'IN_PERSON',
  RADIO: 'RADIO',
  HIGHLIGHTS: 'HIGHLIGHTS',
  REPLAY: 'REPLAY',
  OTHER: 'OTHER',
} as const;

export const WATCHED_SCOPE = {
  FULL_GAME: 'FULL_GAME',
  PARTIAL: 'PARTIAL',
  HIGHLIGHTS_ONLY: 'HIGHLIGHTS_ONLY',
  REPLAY_ONLY: 'REPLAY_ONLY',
  OTHER: 'OTHER',
} as const;

export const FRIENDSHIP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  BLOCKED: 'BLOCKED',
} as const;

export const REACTION_EMOJIS = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  HEART: '❤️',
  FIRE: '🔥',
  EYES: '👀',
  CLAP: '👏',
  CELEBRATE: '🎉',
  SAD: '😢',
  ANGRY: '😠',
  LAUGH: '😂',
} as const;

export const TARGET_TYPES = {
  GAME_LOG: 'GAME_LOG',
  COMMENT: 'COMMENT',
} as const;
