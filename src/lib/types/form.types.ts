// Form-related types consolidated from various files
import type { FormEvent } from 'react';
import type { IBaseInputProps } from './ui.types';

// ========================================
// BASE FORM TYPES
// ========================================

export interface IBaseFormProps {
  loading: boolean;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  className?: string;
}

export interface IFormFieldProps extends IBaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

// ========================================
// ADMIN EXPERIMENTAL FORM TYPES
// ========================================

export interface IAdminFormProps extends IBaseFormProps {
  params: Record<string, string>;
  setParams: (params: Record<string, string>) => void;
}

// GamesForm
export interface IGamesFormProps extends IBaseFormProps {
  gameParams: Record<string, string>;
  setGameParams: (params: Record<string, string>) => void;
}

// GameStatsForm
export interface IGameStatsFormProps extends IBaseFormProps {
  gameStatsId: string;
  setGameStatsId: (id: string) => void;
}

// TeamsForm
export interface ITeamsFormProps extends IBaseFormProps {
  teamParams: Record<string, string>;
  setTeamParams: (params: Record<string, string>) => void;
}

// TeamStatsForm
export interface ITeamStatsFormProps extends IBaseFormProps {
  teamStatsParams: Record<string, string>;
  setTeamStatsParams: (params: Record<string, string>) => void;
}

// PlayersForm
export interface IPlayersFormProps extends IBaseFormProps {
  playerParams: Record<string, string>;
  setPlayerParams: (params: Record<string, string>) => void;
}

// PlayerStatsForm
export interface IPlayerStatsFormProps extends IBaseFormProps {
  playerStatsParams: Record<string, string>;
  setPlayerStatsParams: (params: Record<string, string>) => void;
}

// StandingsForm
export interface IStandingsFormProps extends IBaseFormProps {
  standingsParams: Record<string, string>;
  setStandingsParams: (params: Record<string, string>) => void;
}

// ========================================
// DYNAMIC FORM TYPES
// ========================================

export interface IFieldConfig {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface IDynamicFormProps {
  fields: IFieldConfig[];
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  className?: string;
}

// ========================================
// FORM VALIDATION TYPES
// ========================================

export interface IFormValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string;
}

export interface IFormValidationErrors {
  [fieldName: string]: string;
}

export interface IFormState<T = Record<string, string>> {
  values: T;
  errors: IFormValidationErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}
