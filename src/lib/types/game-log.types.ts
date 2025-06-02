// Types for Game Log feature

export interface GameLogByIdResponse {
  gameLogById: import('./generated/graphql').GameLog;
}

export interface TeamSummary {
  id: string;
  code: string;
  logo: string;
  name: string;
  nickname: string;
}

export interface Arena {
  name?: string;
  city?: string;
  state?: string;
}

export interface TeamDisplayProps {
  team: TeamSummary | null;
  score?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (id: string) => void;
  gameId?: string;
} 