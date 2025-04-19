import type { FieldPath, FieldValues } from 'react-hook-form';

export type FormValidationError = {
  field: string;
  message: string;
  code?: string;
};

export type FormFieldContextValue = {
  name: FieldPath<FieldValues>;
};

export type FormItemContextValue = {
  id: string;
};
