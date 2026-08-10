import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageSquare, FolderOpen, Database } from 'lucide-react';
import { useTheme, themes } from '../hooks/useTheme';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MainLayout: React.FC = () => {
  const { themeId, switchTheme } = useTheme();

  return (
    <div className="flex h-screen w-screen bg-lab-bg overflow-hidden text-lab-text font-sans">
      {/* Navigation Rail */}
      <nav className="w-16 flex flex-col items-center py-6 bg-lab-panel border-r border-lab-border z-20 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-lab-accent/10 flex items-center justify-center mb-8">
          <Database className="w-6 h-6 text-lab-accent" />
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative",
                isActive
                  ? "bg-lab-accent text-white shadow-lg shadow-lab-accent/20"
                  : "text-lab-text/40 hover:text-lab-text hover:bg-lab-text/5"
              )
            }
            title="会话"
          >
            <MessageSquare className="w-5 h-5" />
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative",
                isActive
                  ? "bg-lab-accent text-white shadow-lg shadow-lab-accent/20"
                  : "text-lab-text/40 hover:text-lab-text hover:bg-lab-text/5"
              )
            }
            title="文档管理"
          >
            <FolderOpen className="w-5 h-5" />
          </NavLink>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <div className="flex flex-col gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTheme(t.id)}
                title={`${t.name} — ${t.description}`}
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300 border",
                  themeId === t.id
                    ? "border-lab-accent scale-125 shadow-[0_0_8px_var(--clab-accent)]"
                    : "border-transparent hover:scale-110"
                )}
                style={{
                  background: `linear-gradient(135deg, ${t.color} 50%, ${t.color2} 50%)`
                }}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative min-w-0 min-h-0 flex">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
