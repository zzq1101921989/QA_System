import { useState, useEffect, useCallback } from 'react';

export type ThemeId = 'dark' | 'gundam' | 'doraemon' | 'luffy' | 'sasuke';

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  color: string;     // 用于切换器圆点的颜色
  color2: string;    // 第二配色圆点
  description: string;
}

export const themes: ThemeInfo[] = [
  { id: 'dark',     name: '暗夜实验室', color: '#10b981', color2: '#059669', description: '深邃暗色，极客风' },
  { id: 'gundam',   name: '元祖高达',   color: '#e62e2d', color2: '#1b4f9c', description: 'RX-78-2 红蓝白经典' },
  { id: 'doraemon', name: '哆啦A梦',    color: '#1565c0', color2: '#e65100', description: '铃铛蓝橙，童年梦' },
  { id: 'luffy',    name: '海贼王路飞', color: '#d32f2f', color2: '#fbc02d', description: '红袍金帽，伟大航路' },
  { id: 'sasuke',   name: '火影佐助',   color: '#7c3aed', color2: '#2563eb', description: '须佐能乎，紫蓝千鸟' },
];

const STORAGE_THEME_KEY = 'qa_theme';

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    // 初始化时从 localStorage 读取
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved && themes.some(t => t.id === saved)) return saved as ThemeId;
    return 'dark'; // 默认暗夜实验室
  });

  // 当 themeId 变化时，应用到 html 标签 + 持久化
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(STORAGE_THEME_KEY, themeId);
  }, [themeId]);

  const currentTheme = themes.find(t => t.id === themeId) ?? themes[0];

  const switchTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
  }, []);

  /**
   * 循环切换主题
   */
  const cycleTheme = useCallback(() => {
    const idx = themes.findIndex(t => t.id === themeId);
    const next = themes[(idx + 1) % themes.length];
    setThemeId(next.id);
  }, [themeId]);

  return {
    themeId,
    currentTheme,
    themes,
    switchTheme,
    cycleTheme,
  };
}
