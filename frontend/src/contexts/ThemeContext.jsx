import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultThemes = {
  default: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    card: '#F8FAFC',
    text: '#1F2937',
  },
  dark: {
    primary: '#2563eb',      // vibrant blue for accents
    secondary: '#334155',    // slate for secondary elements
    accent: '#38bdf8',       // cyan for highlights
    background: '#18181b',   // deep dark background
    card: '#232336',         // slightly lighter for cards
    text: '#e5e7eb',         // soft light gray for text
  },
  forest: {
    primary: '#059669',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#F0FDF4',
    card: '#D1FAE5',
    text: '#064E3B',
  },
  ocean: {
    primary: '#0284C7',
    secondary: '#6B7280',
    accent: '#0EA5E9',
    background: '#F0F9FF',
    card: '#E0F2FE',
    text: '#0C4A6E',
  },
  sunset: {
    primary: '#EA580C',
    secondary: '#FBBF24',
    accent: '#F97316',
    background: '#FFF7ED',
    card: '#FED7AA',
    text: '#7C2D12',
  },
  candy: {
    primary: '#EC4899',
    secondary: '#F472B6',
    accent: '#A21CAF',
    background: '#FFF0F6',
    card: '#FCE7F3',
    text: '#701A75',
  },
  sunrise: {
    primary: '#F59E42',
    secondary: '#FDE68A',
    accent: '#F43F5E',
    background: '#FFF7ED',
    card: '#FEF3C7',
    text: '#7C2D12',
  },
  midnight: {
    primary: '#6366F1',
    secondary: '#0F172A',
    accent: '#A5B4FC',
    background: '#18181B',
    card: '#1E293B',
    text: '#F1F5F9',
  },
  aqua: {
    primary: '#06B6D4',
    secondary: '#67E8F9',
    accent: '#0EA5E9',
    background: '#ECFEFF',
    card: '#CFFAFE',
    text: '#134E4A',
  },
  grape: {
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    accent: '#A21CAF',
    background: '#F5F3FF',
    card: '#DDD6FE',
    text: '#4B006E',
  },
};

// Helper to set CSS variables on :root
const setThemeCSSVariables = (colors) => {
  if (!colors) return;
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--card', colors.card || colors.background);
  root.style.setProperty('--popover', colors.card || colors.background);
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--foreground', colors.text);
  // Optionally set more variables as needed
};

export const ThemeProvider = ({ children }) => {
  const [themes, setThemes] = useState(() => {
    const saved = localStorage.getItem('projectThemes');
    return saved ? JSON.parse(saved) : defaultThemes;
  });

  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('activeTheme');
    return saved || 'default';
  });

  // Load themes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('projectThemes');
    if (saved) {
      setThemes(JSON.parse(saved));
    }
  }, []);

  // Save themes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projectThemes', JSON.stringify(themes));
  }, [themes]);

  // Save active theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTheme', activeTheme);
  }, [activeTheme]);

  // Apply theme CSS variables whenever activeTheme or themes change
  useEffect(() => {
    const colors = themes[activeTheme] || themes.default;
    setThemeCSSVariables(colors);
  }, [activeTheme, themes]);

  const addTheme = (name, colors) => {
    setThemes((prev) => ({
      ...prev,
      [name]: colors,
    }));
  };

  const updateTheme = (name, colors) => {
    setThemes((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...colors },
    }));
  };

  const deleteTheme = (name) => {
    if (name === 'default' || name === 'dark') {
      return; // Prevent deleting default themes
    }
    setThemes((prev) => {
      const newThemes = { ...prev };
      delete newThemes[name];
      return newThemes;
    });
    if (activeTheme === name) {
      setActiveTheme('default');
    }
  };

  const setTheme = (name) => {
    if (themes[name]) {
      setActiveTheme(name);
    }
  };

  const getThemeColors = (name) => {
    return themes[name] || themes.default;
  };

  const getCurrentTheme = () => {
    return themes[activeTheme] || themes.default;
  };

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        addTheme,
        updateTheme,
        deleteTheme,
        setTheme,
        getThemeColors,
        getCurrentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 