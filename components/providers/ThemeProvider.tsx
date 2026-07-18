'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Suppress the React 19 "Encountered a script tag" warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args);
  };
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark"
      enableSystem={true}
      storageKey="toyshop-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
