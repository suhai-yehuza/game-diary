// Types file: component.types.ts

import type { HTMLAttributes } from 'react';

// Types moved from src/app/components/ui/card.tsx
export type ICardProps = Readonly<HTMLAttributes<HTMLDivElement>>;
export type ICardHeaderProps = Readonly<HTMLAttributes<HTMLDivElement>>;
export type ICardTitleProps = Readonly<HTMLAttributes<HTMLHeadingElement>>;
export type ICardDescriptionProps = Readonly<HTMLAttributes<HTMLParagraphElement>>;
export type ICardContentProps = Readonly<HTMLAttributes<HTMLDivElement>>;
export type ICardFooterProps = Readonly<HTMLAttributes<HTMLDivElement>>;

// Types moved from src/app/components/common/theme-toggle.tsx
export interface IThemeToggleProps {
  readonly className?: string;
}
