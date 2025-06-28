'use client';

import { useTheme } from 'next-themes';

import { useMounted } from '@/hooks/use-mounted';

const themes = [
  {
    name: 'light',
    icon: '☀️',
  },
  {
    name: 'dark',
    icon: '🌙',
  },
];

interface IThemeToggleProps {
  readonly className?: string;
}

export function ThemeToggle({ className }: Readonly<IThemeToggleProps>) {
  const { setTheme, theme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center bg-[#18181b] dark:bg-[#18181b] rounded-full p-0.5 border border-[#27272a] ${className ?? ''}`}
    >
      {themes.map((themeOption: Readonly<(typeof themes)[0]>) => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          className={`p-2 rounded-full transition-colors ${
            theme === themeOption.name
              ? 'bg-[#3f3f46] text-white'
              : 'text-[#71717a] hover:text-white'
          }`}
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}
