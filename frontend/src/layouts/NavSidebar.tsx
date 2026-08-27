import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, LayoutGrid, Settings, LogOut, Sparkles 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NavSidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-lab-panel border-r border-lab-border flex flex-col p-6 z-20 flex-shrink-0 transition-all duration-300">
      <div 
        className="flex items-center gap-3 mb-10 px-2 cursor-pointer group"
        onClick={() => navigate('/dashboard')}
      >
        <div className="w-10 h-10 rounded-2xl bg-lab-accent flex items-center justify-center shadow-lg shadow-lab-accent/20 group-hover:scale-110 transition-transform">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold font-rounded tracking-tight text-lab-text">学习精灵</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink 
          to="/dashboard"
          className={({ isActive }) => cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-rounded font-bold text-sm",
            isActive ? "bg-lab-accent text-white shadow-lg shadow-lab-accent/20" : "text-lab-text/40 hover:bg-lab-accent/10 hover:text-lab-accent"
          )}
        >
          <LayoutGrid className="w-5 h-5" />
          学习看板
        </NavLink>
        <NavLink 
          to="/shelf"
          className={({ isActive }) => cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-rounded font-bold text-sm",
            isActive ? "bg-lab-accent text-white shadow-lg shadow-lab-accent/20" : "text-lab-text/40 hover:bg-lab-accent/10 hover:text-lab-accent"
          )}
        >
          <BookOpen className="w-5 h-5" />
          我的书架
        </NavLink>
        <NavLink 
          to="/settings"
          className={({ isActive }) => cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-rounded font-bold text-sm",
            isActive ? "bg-lab-accent text-white shadow-lg shadow-lab-accent/20" : "text-lab-text/40 hover:bg-lab-accent/10 hover:text-lab-accent"
          )}
        >
          <Settings className="w-5 h-5" />
          设置中心
        </NavLink>
      </nav>

      <div className="mt-auto pt-6 border-t border-lab-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-lab-text/40 hover:text-red-400 hover:bg-red-50 transition-all font-rounded font-bold text-sm">
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </aside>
  );
};
