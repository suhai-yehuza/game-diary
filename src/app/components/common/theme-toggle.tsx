'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useMounted } from '@/hooks/use-mounted';
import type { IThemeToggleProps } from '@/lib/types/componentTypes';

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

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center bg-[#18181b] dark:bg-[#18181b] rounded-full p-0.5 border border-[#27272a] ${className ?? ''}`}
    >
      {themes.map(themeOption => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          className={`flex items-center justify-center h-11 w-11 rounded-full transition-colors mx-0.5
            ${theme === themeOption.name ? 'bg-[#232329] text-white shadow' : 'text-[#71717a] hover:text-white'}
          `}
          aria-label={themeOption.label}
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}
