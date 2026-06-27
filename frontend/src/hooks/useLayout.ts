import { useState, useEffect } from 'react';

export interface LayoutState {
  isSidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

/**
 * 响应式布局逻辑 Hook
 * 处理移动端菜单状态与窗口尺寸监听 (增加防抖优化性能)
 */
export function useLayout(): LayoutState {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false); // 切换到桌面端时重置
    };

    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    checkMobile(); // 初始执行
    window.addEventListener('resize', debouncedCheck);
    
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return {
    isSidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
  };
}
