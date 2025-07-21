import { Menu } from 'lucide-react';

interface IMobileMenuButtonProps {
  onToggle: () => void;
}

export function MobileMenuButton({ onToggle }: IMobileMenuButtonProps) {
  return (
    <button
      aria-label="Toggle menu"
      onClick={onToggle}
      className="lg:hidden mr-4 relative z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      style={{ pointerEvents: 'auto' }}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
