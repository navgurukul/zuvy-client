import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isThemeLocked: boolean;
  lockTheme: () => void;
  unlockTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isThemeLocked, setIsThemeLocked] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = systemPrefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  // Set theme with persistence
  const handleSetTheme = (newTheme: Theme) => {
    if (isThemeLocked) {
      console.log('Theme is locked during assessment/coding challenge');
      return;
    }
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Toggle theme
  const toggleTheme = () => {
    if (isThemeLocked) {
      console.log('Theme is locked during assessment/coding challenge');
      return;
    }
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  // Lock theme during assessments and coding challenges
  const lockTheme = () => {
    setIsThemeLocked(true);
  };

  // Unlock theme when leaving assessments
  const unlockTheme = () => {
    setIsThemeLocked(false);
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    toggleTheme,
    isThemeLocked,
    lockTheme,
    unlockTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 