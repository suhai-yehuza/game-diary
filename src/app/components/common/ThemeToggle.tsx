'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

import { useMounted } from '@/hooks/use-mounted';
import type { IThemeToggleProps } from '@/types';

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
        className={`inline-flex items-center rounded-full p-0.5 border bg-theme-toggle-container border-theme-toggle-border ${className ?? ''}`}
      >
        <div className="flex items-center justify-center h-11 w-11 rounded-full shadow mx-0.5 bg-brand-primary text-theme-toggle-active">
          <div className="w-4 h-4 rounded animate-pulse bg-theme-toggle-active" />
        </div>
        <div className="flex items-center justify-center h-11 w-11 rounded-full mx-0.5 text-theme-toggle-inactive">
          <div className="w-4 h-4 rounded animate-pulse bg-theme-toggle-inactive" />
        </div>
        <div className="flex items-center justify-center h-11 w-11 rounded-full mx-0.5 text-theme-toggle-inactive">
          <div className="w-4 h-4 rounded animate-pulse bg-theme-toggle-inactive" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 border bg-theme-toggle-container border-theme-toggle-border ${className ?? ''}`}
    >
      {themes.map(themeOption => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          onKeyDown={e => handleKeyDown(e, themeOption.name)}
          className={`flex items-center justify-center h-11 w-11 rounded-full transition-colors mx-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            theme === themeOption.name
              ? 'bg-brand-primary text-theme-toggle-active shadow-theme-toggle'
              : 'text-theme-toggle-inactive hover:bg-brand-primary/10 hover:text-brand-primary'
          }`}
          aria-label={themeOption.label}
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}
