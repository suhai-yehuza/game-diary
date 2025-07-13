import type { HTMLAttributes, ReactNode } from 'react';
import { PropsWithChildren } from 'react';

export type ICardProps = HTMLAttributes<HTMLDivElement>;
export type ICardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type ICardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type ICardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type ICardContentProps = HTMLAttributes<HTMLDivElement>;
export type ICardFooterProps = HTMLAttributes<HTMLDivElement>;

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

export interface IClientProvidersProps {
  children: ReactNode;
}
