import { useState, useEffect, useCallback } from 'react';

export type ThemeId = 'warm';

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  color: string;     
  color2: string;    
  description: string;
}

export const themes: ThemeInfo[] = [
  { id: 'warm',     name: '治愈温和',   color: '#7FB3B7', color2: '#E08E58', description: '柔和奶油纸，温馨陪伴' },
];

const STORAGE_THEME_KEY = 'qa_theme';

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>('warm');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'warm');
    localStorage.setItem(STORAGE_THEME_KEY, 'warm');
  }, []);

  const currentTheme = themes[0];

  const switchTheme = useCallback((id: ThemeId) => {
    // 仅保留一个主题，不做实际切换
  }, []);

  const cycleTheme = useCallback(() => {
    // 仅保留一个主题，不做实际切换
  }, []);

  return {
    themeId: 'warm' as const,
    currentTheme,
    themes,
    switchTheme,
    cycleTheme,
  };
}
