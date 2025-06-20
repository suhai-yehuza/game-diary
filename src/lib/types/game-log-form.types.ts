import type { IGameData } from './game-log.types';
import type { CreateGameLogInput } from './generated/graphql';

export interface IReactDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholderText?: string;
  dateFormat?: string;
  className?: string;
}

export interface IGameLogFormProps {
  formData: CreateGameLogInput;
  selectedGame: IGameData | null;
  loading: boolean;
  onSubmit: (formData: CreateGameLogInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}
