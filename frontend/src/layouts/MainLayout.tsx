import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavSidebar } from './NavSidebar';

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  // 判断是否在沉浸式学习模式下
  const isStudyMode = location.pathname.startsWith('/study/');

  return (
    <div className="flex h-screen w-screen bg-lab-bg overflow-hidden text-lab-text font-sans">
      {/* 全局功能导航侧边栏 (在学习模式下隐藏，以保持纯净) */}
      {!isStudyMode && <NavSidebar />}

      {/* 主内容区域 */}
      <main className="flex-1 relative min-w-0 min-h-0 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
