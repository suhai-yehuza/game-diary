import type {
  WatchedSettingValue,
  WatchedScopeValue,
  ClassificationValue,
} from '@/lib/types/config.types';
import type { Game } from '@/lib/types/game.types';
import type { GameLog } from '@/lib/types/generated/graphql';

export interface GameLogInput {
  gameId: string;
  watchedDate: string;
  watchedLocation?: string;
  watchedSetting?: string;
  watchedScope?: string;
  ratingForGame: number;
  comment?: string;
}

export interface GameLogFormData {
  watchedSetting: WatchedSettingValue;
  watchedDate: Date;
  watchedLocation: string;
  ratingForGame: number;
  watchedScope: WatchedScopeValue;
  notes: string;
  tags: string[];
  classification: ClassificationValue;
}

export interface GameRating {
  id: string;
  gameId: string;
  averageRating: string;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameRatingWithUser {
  id: string;
  ratingForGame: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    photoUrl?: string;
  };
}

// Component Props
export interface GameLogFormProps {
  onSuccess?: () => void;
  formData?: GameLogFormData;
  setFormData?: (data: GameLogFormData) => void;
  selectedGame?: Game | null;
  loading?: boolean;
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export interface GameLogViewProps {
  gameLog: {
    id: string;
    gameId: string;
    userId: string;
    watchedSetting: string;
    watchedDate: string;
    watchedLocation: string;
    ratingForGame: string;
    notes: string;
    tags: string[];
    classification: string;
    watchedScope: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GameLogModalProps {
  mode: 'create' | 'update';
  gameId?: string;
  gameLog?: GameLog;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export interface StarRatingProps {
  ratingForGame: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onRatingChange?: (rating: number) => void;
}
