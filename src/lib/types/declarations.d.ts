/**
 * Type Declarations
 * Global type declarations, module definitions, and scalar types
 */

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />
/// <reference lib="es2015" />

// ========================================
// GLOBAL TYPES
// ========================================

declare global {
  type IEmptyObject = Record<string, never>;
  interface IGlobalThis {
    gc?: () => void;
  }
}

// ========================================
// MODULE DECLARATIONS
// ========================================

declare module 'react-hook-form' {
  export * from 'react-hook-form';
}

declare module 'react-datepicker' {
  export * from 'react-datepicker';
}

declare module '@src/*' {
  const content: unknown;
  export default content;
}

declare module '@utils/*' {
  const content: unknown;
  export default content;
}

declare module '@lib/*' {
  const content: unknown;
  export default content;
}

// ========================================
// SCALAR TYPES
// ========================================

export type DateTime = string;
export type Any = unknown;
export type IDateTimeScalar = string;
export type IAnyScalar = unknown;

export {};
