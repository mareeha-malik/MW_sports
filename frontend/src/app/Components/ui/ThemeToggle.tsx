'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !mounted) {
    return (
      <button
        className="header_top_icon_wrapper w-5 h-5 dark:hover:bg-BrightOrange light:hover:bg-orange-100"
        disabled
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="header_top_icon_wrapper dark:hover:bg-BrightOrange light:hover:bg-orange-100"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400 hover:text-white transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 hover:text-BrightOrange transition-colors" />
      )}
    </button>
  );
}
