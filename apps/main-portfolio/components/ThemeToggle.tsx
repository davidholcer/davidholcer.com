'use client';

import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    console.log('ThemeToggle: Button clicked, current theme:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('ThemeToggle: Switching to theme:', newTheme);
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Button
      variant="light"
      onPress={toggleTheme}
      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm min-w-[60px] min-h-[40px] px-3 py-2 touch-manipulation"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? 'dark' : 'light'}
    </Button>
  );
} 