// Types file: component.types.ts

import type { HTMLAttributes, ReactNode } from 'react';
import { PropsWithChildren } from 'react';

// Types moved from src/app/components/ui/card.tsx
export type ICardProps = HTMLAttributes<HTMLDivElement>;
export type ICardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type ICardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type ICardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type ICardContentProps = HTMLAttributes<HTMLDivElement>;
export type ICardFooterProps = HTMLAttributes<HTMLDivElement>;

// Types moved from src/app/components/common/theme-toggle.tsx
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

export interface ISignUpButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export interface ISignInButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

// Types moved from src/app/components/providers/client-providers.tsx
export interface IClientProvidersProps {
  children: ReactNode;
}
