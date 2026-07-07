'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-cyan-400 transition-transform duration-300 hover:rotate-180" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600 transition-transform duration-300 hover:rotate-180" />
      )}
    </button>
  );
}
