'use client';
import React, { createContext, useContext, useState } from 'react';

import type { IMenuContextType } from '@/lib/types';

// Menu context for global menu state
const MenuContext = createContext<IMenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  return (
    <MenuContext.Provider value={{ isMenuExpanded, setIsMenuExpanded }}>
      {children}
    </MenuContext.Provider>
  );
};

export function useMenuContext(): IMenuContextType {
  const ctx = useContext(MenuContext);
  // Always return a valid IMenuContextType
  const defaultContext: IMenuContextType = {
    isMenuExpanded: false,
    setIsMenuExpanded: () => {
      // Intentionally empty - fallback when context is not available
    },
  };

  return ctx ?? defaultContext;
}
