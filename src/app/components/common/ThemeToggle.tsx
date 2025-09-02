'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

import { useMounted } from '@/hooks/use-mounted';
import { THEME_COLORS } from '@/lib/constants/colors';
import type { IThemeToggleProps } from '@/lib/types';

const themes = [
  {
    name: 'dark',
    icon: <Moon className="h-4 w-4" />,
    label: 'Dark',
  },
  {
    name: 'light',
    icon: <Sun className="h-4 w-4" />,
    label: 'Light',
  },
  {
    name: 'system',
    icon: <Monitor className="h-4 w-4" />,
    label: 'System',
  },
];

export function ThemeToggle({ className }: IThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();

  const handleKeyDown = (event: React.KeyboardEvent, themeName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setTheme(themeName);
    }
  };

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center bg-[${THEME_COLORS.dark.background}] dark:bg-[${THEME_COLORS.dark.background}] rounded-full p-0.5 border border-[${THEME_COLORS.dark.border}] ${className ?? ''}`}
      >
        <div className="flex items-center justify-center h-11 w-11 rounded-full bg-[${THEME_COLORS.dark.surface}] text-white shadow mx-0.5">
          <div className="w-4 h-4 bg-neutral-300 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-center h-11 w-11 rounded-full text-[${THEME_COLORS.dark.text.secondary}] mx-0.5">
          <div className="w-4 h-4 bg-neutral-300 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-center h-11 w-11 rounded-full text-[${THEME_COLORS.dark.text.secondary}] mx-0.5">
          <div className="w-4 h-4 bg-neutral-300 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center bg-[${THEME_COLORS.dark.background}] dark:bg-[${THEME_COLORS.dark.background}] rounded-full p-0.5 border border-[${THEME_COLORS.dark.border}] ${className ?? ''}`}
    >
      {themes.map(themeOption => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          onKeyDown={e => handleKeyDown(e, themeOption.name)}
          className={`flex items-center justify-center h-11 w-11 rounded-full transition-colors mx-0.5
            ${theme === themeOption.name ? `bg-[${THEME_COLORS.dark.surface}] text-white shadow` : `text-[${THEME_COLORS.dark.text.secondary}] hover:text-white`} focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
          `}
          aria-label={themeOption.label}
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}
