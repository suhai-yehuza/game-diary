/**
 * Layout Component Types
 * Type definitions for layout components
 */

import React from 'react';

// Navigation component types
export interface INavigationLinksProps {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  _setIsMenuExpanded: (expanded: boolean) => void;
  closeMenu?: () => void;
  isStacked?: boolean;
}

import type { NavItemProps } from './component.types';

export interface INavItemExtendedProps extends NavItemProps {
  onClick?: () => void;
  isStacked?: boolean;
  colorClass?: string;
  closeMenu?: () => void;
}

// Header component types
export interface IHeaderRightSectionProps {
  isMenuExpanded: boolean;
}

// Logo component types
export interface ILogoProps {
  isMenuExpanded: boolean;
}

// Mobile menu button types
export interface IMobileMenuButtonProps {
  onToggle: () => void;
}
