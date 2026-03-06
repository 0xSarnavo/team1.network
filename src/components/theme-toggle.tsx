'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-800 dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 group-hover:scale-110 dark:-rotate-90 dark:scale-0 dark:group-hover:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 group-hover:scale-0 dark:rotate-0 dark:scale-100 dark:group-hover:scale-110" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
