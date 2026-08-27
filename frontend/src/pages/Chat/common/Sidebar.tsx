import React, { useState } from 'react';
import { Database, X, MessageSquarePlus, MessageSquare, Trash2, Pencil, Check, Home, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SessionMessage } from '../../../types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  onNewChat?: () => void;
  sessionMessages?: SessionMessage[];
  currentSessionId?: string | null;
  onSwitchSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onUpdateSession?: (id: string, name: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  sessionMessages = [],
  currentSessionId,
  onSwitchSession,
  onDeleteSession,
  onUpdateSession,
  isMobile,
  onClose
}) => {
  const navigate = useNavigate();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden transition-all duration-300">
      <div className="p-8 pb-4 flex flex-col gap-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-lab-text/40 hover:text-lab-accent transition-colors group w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold font-rounded">返回学习中心</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lab-accent/20 flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 text-lab-accent" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-lab-text font-rounded">学习书架</h1>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && onClose && (
              <button onClick={onClose} className="p-2 text-lab-text/40 hover:text-lab-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-3xl bg-lab-accent text-white font-bold hover:bg-lab-accent/90 transition-all group shadow-xl shadow-lab-accent/20 active:scale-95"
        >
          <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-rounded tracking-wide">开始新的探索</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-6">
        {/* 会话区 */}
        <div className="space-y-1">
          <div className="px-3 py-4 text-[11px] font-bold text-lab-text/30 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1 h-3 bg-lab-accent2/40 rounded-full" />
            探索历程
          </div>
          {sessionMessages.length === 0 ? (
            <div className="px-3 py-10 text-center bg-lab-accent/5 rounded-[2rem] border border-dashed border-lab-accent/20">
              <p className="text-xs text-lab-text/30 italic">还没有开始探索呢</p>
            </div>
          ) : (
            sessionMessages.map((session) => {
              const isEditing = editingSessionId === session.sessionId;
              return (
              <div
                key={session.sessionId}
                className={cn(
                  "group w-full flex items-center justify-between p-4 rounded-3xl transition-all text-left mb-3",
                  currentSessionId === session.sessionId 
                    ? "bg-lab-panel shadow-lg shadow-lab-accent/5 border border-lab-border/50" 
                    : "hover:bg-lab-panel/50 border border-transparent"
                )}
              >
                <button
                  onClick={() => !isEditing && onSwitchSession?.(session.sessionId)}
                  className="flex-1 flex items-center gap-3 truncate min-w-0"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    currentSessionId === session.sessionId ? "bg-lab-accent text-white" : "bg-lab-bg text-lab-text/30 group-hover:bg-lab-accent/10 group-hover:text-lab-accent"
                  )}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateSession?.(session.sessionId, editTitle);
                          setEditingSessionId(null);
                        }
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      className="flex-1 bg-lab-bg border border-lab-accent/30 rounded-lg px-2 py-1 text-sm text-lab-text outline-none min-w-0 font-rounded"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className={cn("text-sm font-semibold truncate font-rounded", currentSessionId === session.sessionId ? "text-lab-text" : "text-lab-text/60")}>
                      {session.sessionName}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {isEditing ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSession?.(session.sessionId, editTitle);
                        setEditingSessionId(null);
                      }}
                      className="p-1.5 text-lab-accent hover:bg-lab-accent/10 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.sessionId);
                        setEditTitle(session.sessionName);
                      }}
                      className="p-1.5 text-lab-text/30 hover:text-lab-accent hover:bg-lab-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession?.(session.sessionId);
                    }}
                    className={cn("p-1.5 text-lab-text/30 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all", isEditing ? "" : "opacity-0 group-hover:opacity-100")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )})
          )}
        </div>

      </div>

      <div className="p-8 border-t border-lab-border/30">
        <div className="flex items-center justify-between text-[11px] font-medium text-lab-text/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lab-accent animate-pulse" />
            <span className="tracking-widest uppercase">在线</span>
          </div>
          <span className="opacity-50 font-mono">v1.2.0</span>
        </div>
      </div>
    </div>
  );
};
