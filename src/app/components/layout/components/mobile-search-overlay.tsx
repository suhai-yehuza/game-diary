import { X } from 'lucide-react';

import { SearchBar } from '@/app/components/layout/components/search-bar';

interface IMobileSearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({ isVisible, onClose }: IMobileSearchOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 sm:hidden min-w-[44px] min-h-[44px]"
      onClick={onClose}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close search overlay"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="mt-8 w-full max-w-md bg-background rounded-full border border-[#27272a] shadow-lg flex items-center px-4 py-2 relative min-w-[44px] min-h-[44px]"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Search container"
      >
        <SearchBar autoFocus />
        <button
          className="ml-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close search"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
