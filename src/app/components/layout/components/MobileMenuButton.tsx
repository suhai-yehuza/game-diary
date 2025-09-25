import { Menu } from 'lucide-react';

import type { IMobileMenuButtonProps } from '@/types';

export function MobileMenuButton({ onToggle }: IMobileMenuButtonProps) {
  return (
    <button
      aria-label="Toggle menu"
      onClick={onToggle}
      className="lg:hidden mr-4 relative z-50 p-2 hover:bg-gray-600 rounded-md transition-colors"
      style={{ pointerEvents: 'auto' }}
      data-testid="mobile-menu-button"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
