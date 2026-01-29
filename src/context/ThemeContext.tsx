import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarHover: string;
}

const themes: Record<Theme, ThemeColors> = {
  light: {
    primary: '#0ea5e9',
    primaryDark: '#0284c7',
    primaryLight: '#38bdf8',
    secondary: '#06b6d4',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    sidebarBg: '#ffffff',
    sidebarText: '#475569',
    sidebarActive: '#0ea5e9',
    sidebarHover: '#f1f5f9',
  },
  dark: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#334155',
    sidebarBg: '#1e293b',
    sidebarText: '#cbd5e1',
    sidebarActive: '#3b82f6',
    sidebarHover: '#334155',
  },
  blue: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    secondary: '#06b6d4',
    background: '#eff6ff',
    surface: '#ffffff',
    text: '#1e3a8a',
    textSecondary: '#3b82f6',
    border: '#bfdbfe',
    sidebarBg: '#1e3a8a',
    sidebarText: '#dbeafe',
    sidebarActive: '#3b82f6',
    sidebarHover: '#1e40af',
  },
  green: {
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    secondary: '#14b8a6',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#065f46',
    textSecondary: '#10b981',
    border: '#bbf7d0',
    sidebarBg: '#065f46',
    sidebarText: '#d1fae5',
    sidebarActive: '#10b981',
    sidebarHover: '#047857',
  },
  purple: {
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#ec4899',
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#5b21b6',
    textSecondary: '#8b5cf6',
    border: '#e9d5ff',
    sidebarBg: '#5b21b6',
    sidebarText: '#e9d5ff',
    sidebarActive: '#8b5cf6',
    sidebarHover: '#6d28d9',
  },
  orange: {
    primary: '#f59e0b',
    primaryDark: '#d97706',
    primaryLight: '#fbbf24',
    secondary: '#ef4444',
    background: '#fffbeb',
    surface: '#ffffff',
    text: '#92400e',
    textSecondary: '#f59e0b',
    border: '#fde68a',
    sidebarBg: '#92400e',
    sidebarText: '#fef3c7',
    sidebarActive: '#f59e0b',
    sidebarHover: '#b45309',
  },
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved && themes[saved] ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme colors to CSS variables
    const colors = themes[theme];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-sidebar-bg', colors.sidebarBg);
    root.style.setProperty('--theme-sidebar-text', colors.sidebarText);
    root.style.setProperty('--theme-sidebar-active', colors.sidebarActive);
    root.style.setProperty('--theme-sidebar-hover', colors.sidebarHover);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: themes[theme],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
