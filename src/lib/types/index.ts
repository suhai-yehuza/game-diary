/**
 * This file serves as a centralized type export for the Game Diary application.
 * It re-exports types from our consolidated types file and generated GraphQL types.
 */

// Re-export all types from generated GraphQL types
export * from './generated/graphql';

// Re-export custom types
export * from './consolidated.types';
export * from './constant.types';
export * from './scalars.types';
export * from './ui.types';
