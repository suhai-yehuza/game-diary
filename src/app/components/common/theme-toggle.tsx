'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

import { useMounted } from '@/hooks/use-mounted';

const themes = [
  { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
  { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
];

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className="inline-flex items-center bg-[#18181b] dark:bg-[#18181b] rounded-full p-0.5 border border-[#27272a]">
      {themes.map(themeOption => (
        <button
          key={themeOption.value}
          onClick={() => setTheme(themeOption.value)}
          className={`w-7 h-7 flex items-center justify-center rounded-full transition
            ${
              theme === themeOption.value
                ? 'bg-[#232326] border border-[#3f3f46] shadow'
                : themeOption.value === 'system' && theme === 'system'
                  ? 'bg-[#232326] border border-[#3f3f46] shadow'
                  : 'hover:bg-[#232326] border border-transparent'
            }
            text-[#a1a1aa]
          `}
          aria-label={themeOption.label}
          aria-pressed={theme === themeOption.value}
          type="button"
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}
