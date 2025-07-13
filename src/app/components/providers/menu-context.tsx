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
  if (!ctx) throw new Error('useMenuContext must be used within a MenuProvider');
  return ctx;
}
