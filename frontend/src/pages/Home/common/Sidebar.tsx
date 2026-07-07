import React, { useState } from 'react';
import { Database, Plus, FileText, CheckCircle2, X, Loader2, MessageSquarePlus, MessageSquare, Trash2, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Document, SessionMessage } from '../../../types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UploadModal } from './UploadModal';
import { useTheme, themes } from '../../../hooks/useTheme';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  documents: Document[];
  selectedDocId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => void;
  onSelect: (id: string) => void;
  onNewChat?: () => void;
  sessionMessages?: SessionMessage[];
  currentSessionId?: string | null;
  onSwitchSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  selectedDocId,
  isUploading,
  uploadProgress,
  onUpload,
  onSelect,
  onNewChat,
  sessionMessages = [],
  currentSessionId,
  onSwitchSession,
  onDeleteSession,
  isMobile,
  onClose
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { themeId, switchTheme } = useTheme();

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-lab-accent2 text-white hover:bg-lab-accent2/90 transition-all rounded-lg shadow-sm group"
            title="上传文档"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
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

      <UploadModal 
        documents={documents}
        uploadProgress={uploadProgress}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={onUpload}
        isUploading={isUploading}
      />

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
            sessionMessages.map((session) => (
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
                  onClick={() => onSwitchSession?.(session.sessionId)}
                  className="flex-1 flex items-center gap-2 truncate"
                >
                  <MessageSquare className={cn("w-4 h-4 flex-shrink-0", currentSessionId === session.sessionId ? "text-lab-active" : "text-lab-text/40")} />
                  <span className={cn("text-sm font-medium truncate", currentSessionId === session.sessionId ? "text-lab-text" : "text-lab-text/60")}>
                    {session.sessionName}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession?.(session.sessionId);
                  }}
                  className="p-1 text-lab-text/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 文档区 */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-lab-text/40 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3 h-3" />
            文档存储
          </div>
          {documents.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-lab-text/30 italic">尚未上传文档</p>
            </div>
          ) : (
            documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={cn(
                  "w-full flex flex-col gap-1 p-3 rounded-xl transition-all text-left group",
                  selectedDocId === doc.id 
                    ? "bg-lab-active/10 border border-lab-active/30" 
                    : "hover:bg-lab-text/5 border border-transparent"
                )}
              >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={cn("w-4 h-4 flex-shrink-0", selectedDocId === doc.id ? "text-lab-active" : "text-lab-text/40")} />
                      <span className={cn("text-sm font-medium truncate", selectedDocId === doc.id ? "text-lab-text" : "text-lab-text/60")}>
                        {doc.name}
                      </span>
                    </div>
                    {doc.status === 'ready' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-lab-active flex-shrink-0" />
                    ) : doc.status === 'error' ? (
                      <div className="w-3.5 h-3.5 text-red-500 flex-shrink-0 font-bold">!</div>
                    ) : (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Loader2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      </motion.div>
                    )}
                  </div>
                  {doc.status === 'processing' && (
                    <div className="mt-2 w-full bg-lab-text/10 rounded-full h-1 overflow-hidden">
                      <motion.div 
                        className={cn(
                          "h-full transition-all duration-300",
                          uploadProgress >= 90 ? "bg-amber-500 animate-pulse" : "bg-lab-accent"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                <div className="flex items-center gap-3 text-[10px] font-mono text-lab-text/40 mt-1">
                  <span>{doc.timestamp}</span>
                  {doc.chunkCount && (
                    <span className="bg-lab-text/5 px-1.5 py-0.5 rounded border border-lab-text/5 uppercase">
                      {doc.chunkCount} 分块
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-lab-border space-y-3">
        {/* 主题切换器 — 双色渐变圆点 */}
        <div className="flex items-center justify-center gap-3">
          <Palette className="w-3.5 h-3.5 text-lab-text/30" />
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTheme(t.id)}
              title={`${t.name} — ${t.description}`}
              className={cn(
                "w-6 h-3 rounded-full transition-all duration-300 border",
                themeId === t.id
                  ? "border-lab-accent scale-125 shadow-[0_0_8px_var(--clab-accent)]"
                  : "border-transparent hover:scale-110"
              )}
              style={{
                background: `linear-gradient(90deg, ${t.color} 50%, ${t.color2} 50%)`
              }}
            />
          ))}
        </div>
        <div className="text-[10px] font-mono text-lab-text/30 flex justify-between">
          <span>系统状态: 运行中</span>
          <span>V1.1.0</span>
        </div>
      </div>
    </div>
  );
};
