// Types file: component.types.ts

import type { HTMLAttributes } from 'react';

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
