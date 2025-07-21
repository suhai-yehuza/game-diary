import type { HTMLAttributes, ReactNode } from 'react';
import { PropsWithChildren } from 'react';
import type { IBaseButtonProps, IBaseInputProps } from '@/lib/types/ui.types';

// ========================================
// CARD COMPONENT TYPES
// ========================================

export type ICardProps = HTMLAttributes<HTMLDivElement>;
export type ICardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type ICardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type ICardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type ICardContentProps = HTMLAttributes<HTMLDivElement>;
export type ICardFooterProps = HTMLAttributes<HTMLDivElement>;

// ========================================
// THEME & NAVIGATION TYPES
// ========================================

export interface IThemeToggleProps {
  className?: string;
}

export interface IComponentProps {
  className?: string;
}

export type NavItemProps = PropsWithChildren<{
  href: string;
  isActive: boolean;
  className?: string;
}>;

// ========================================
// AUTHENTICATION BUTTON TYPES
// ========================================

export interface ISignUpButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface ISignInButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// ========================================
// PROVIDER TYPES
// ========================================

export interface IClientProvidersProps {
  children: ReactNode;
}

export interface ISignInModalTriggerProps {
  autoTrigger?: boolean;
}
