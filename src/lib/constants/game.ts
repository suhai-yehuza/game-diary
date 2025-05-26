export const GAME_STATUS = {
  FINISHED: 'Finished',
  LIVE: 'Live',
  SCHEDULED: 'Scheduled',
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
