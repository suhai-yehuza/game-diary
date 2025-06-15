import type { FormEvent } from 'react';

import type {
  IWatchedSettingValue,
  IWatchedScopeValue,
  IClassificationValue,
} from '@src/lib/types/config.types';
import type { IGame } from '@src/lib/types/game.types';
import type { GameLog } from '@src/lib/types/generated/graphql';

export interface IGameLogInput {
  gameId: string;
  watchedDate: string;
  watchedLocation?: string;
  watchedSetting?: string;
  watchedScope?: string;
  ratingForGame: number;
  comment?: string;
}

export interface IGameLogFormData {
  gameId: string;
  watchedSetting: IWatchedSettingValue;
  watchedDate: Date;
  watchedLocation: string;
  ratingForGame: number;
  watchedScope: IWatchedScopeValue;
  notes: string;
  tags: string[];
  classification: IClassificationValue;
}

export interface IGameRating {
  id: string;
  gameId: string;
  averageRating: string;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGameRatingWithUser {
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
export interface IGameLogFormProps {
  onSuccess?: () => void;
  formData?: IGameLogFormData;
  setFormData?: (data: IGameLogFormData) => void;
  selectedGame?: IGame | null;
  loading?: boolean;
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export interface IGameLogModalProps {
  mode: 'create' | 'update';
  gameId?: string;
  gameLog?: GameLog;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export interface IStarRatingProps {
  ratingForGame: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onRatingChange?: (rating: number) => void;
}

export interface IReactDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
  dateFormat?: string;
  placeholderText?: string;
  disabled?: boolean;
}
