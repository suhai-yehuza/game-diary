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
        className={`inline-flex items-center rounded-full p-0.5 border bg-gray-700 border-gray-600 ${className ?? ''}`}
      >
        <div className="flex items-center justify-center h-11 w-11 rounded-full shadow-lg shadow-black/20 mx-0.5 bg-blue-600 text-white border-2 border-blue-600">
          <div className="w-4 h-4 rounded animate-pulse bg-white" />
        </div>
        <div className="flex items-center justify-center h-11 w-11 rounded-full mx-0.5 text-gray-400">
          <div className="w-4 h-4 rounded animate-pulse bg-gray-400" />
        </div>
        <div className="flex items-center justify-center h-11 w-11 rounded-full mx-0.5 text-gray-400">
          <div className="w-4 h-4 rounded animate-pulse bg-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 border bg-gray-700 border-gray-600 ${className ?? ''}`}
    >
      {themes.map(themeOption => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          onKeyDown={e => handleKeyDown(e, themeOption.name)}
          className={`flex items-center justify-center h-11 w-11 rounded-full transition-colors mx-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            theme === themeOption.name
              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-lg shadow-black/20'
              : 'text-gray-400 hover:bg-gray-600 hover:text-white border-2 border-transparent'
          }`}
          aria-label={themeOption.label}
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}
