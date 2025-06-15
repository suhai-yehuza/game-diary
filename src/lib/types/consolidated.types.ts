import type { IGame } from './game.types';

export interface IProcessedGames {
  live: IGame[];
  scheduled: IGame[];
  completed: IGame[];
}
