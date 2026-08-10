import React, { useState } from 'react';
import { Database, X, MessageSquarePlus, MessageSquare, Trash2, Pencil, Check } from 'lucide-react';
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
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  return (
    <div className="flex flex-col h-full bg-lab-panel overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-lab-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lab-accent/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-lab-accent" />
          </div>
          <h1 className="text-lg font-display font-bold tracking-[0.1em] text-lab-text uppercase">知识库</h1>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && onClose && (
            <button onClick={onClose} className="p-2 text-lab-text/40 hover:text-lab-text transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-lab-accent text-white font-bold hover:bg-lab-accent/90 transition-all group shadow-lg shadow-lab-accent/20"
        >
          <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>开启新会话</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-6">
        {/* 会话区 */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-lab-text/40 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            最近会话
          </div>
          {sessionMessages.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-lab-text/30 italic">暂无历史会话</p>
            </div>
          ) : (
            sessionMessages.map((session) => {
              const isEditing = editingSessionId === session.sessionId;
              return (
              <div
                key={session.sessionId}
                className={cn(
                  "group w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                  currentSessionId === session.sessionId 
                    ? "bg-lab-active/10 border border-lab-active/30" 
                    : "hover:bg-lab-text/5 border border-transparent"
                )}
              >
                <button
                  onClick={() => !isEditing && onSwitchSession?.(session.sessionId)}
                  className="flex-1 flex items-center gap-2 truncate min-w-0"
                >
                  <MessageSquare className={cn("w-4 h-4 flex-shrink-0", currentSessionId === session.sessionId ? "text-lab-active" : "text-lab-text/40")} />
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
                      className="flex-1 bg-lab-bg border border-lab-accent/50 rounded px-2 py-0.5 text-sm text-lab-text outline-none min-w-0"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className={cn("text-sm font-medium truncate", currentSessionId === session.sessionId ? "text-lab-text" : "text-lab-text/60")}>
                      {session.sessionName}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                  {isEditing ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSession?.(session.sessionId, editTitle);
                        setEditingSessionId(null);
                      }}
                      className="p-1 text-lab-accent hover:text-lab-accent/80 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.sessionId);
                        setEditTitle(session.sessionName);
                      }}
                      className="p-1 text-lab-text/30 hover:text-lab-text/60 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession?.(session.sessionId);
                    }}
                    className={cn("p-1 text-lab-text/30 hover:text-red-400 transition-all", isEditing ? "" : "opacity-0 group-hover:opacity-100")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )})
          )}
        </div>

      </div>

      <div className="p-4 border-t border-lab-border space-y-3">
        <div className="text-[10px] font-mono text-lab-text/30 flex justify-between">
          <span>系统状态: 运行中</span>
          <span>V1.1.0</span>
        </div>
      </div>
    </div>
  );
};
