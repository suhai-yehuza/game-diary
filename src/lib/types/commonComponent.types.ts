/**
 * Common Component Types
 * Type definitions for common components
 */

import React from 'react';

// Error display types
export interface IErrorDisplayProps {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  className?: string;
  showRetry?: boolean;
}

// Loading spinner types
export interface ILoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

// Empty state types
export interface IEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'info' | 'warning';
  className?: string;
}
