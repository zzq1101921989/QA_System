import React, { useState } from 'react';
import { Database, Plus, Clock, FileText, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Document } from '../../../types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UploadModal } from './UploadModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  documents: Document[];
  selectedDocId: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onSelect: (id: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  selectedDocId,
  isUploading,
  onUpload,
  onSelect,
  isMobile,
  onClose
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-lab-panel overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-lab-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lab-accent/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-lab-accent" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase">知识库</h1>
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-lab-accent text-lab-bg font-bold hover:bg-lab-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isUploading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Clock className="w-5 h-5" />
            </motion.div>
          ) : (
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          {isUploading ? '处理中...' : '上传 PDF 文档'}
        </button>
      </div>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={onUpload}
        isUploading={isUploading}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">文档列表</div>
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={cn(
              "w-full flex flex-col gap-1 p-3 rounded-xl transition-all text-left group",
              selectedDocId === doc.id 
                ? "bg-lab-accent/10 border border-lab-accent/30" 
                : "hover:bg-white/5 border border-transparent"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 truncate">
                <FileText className={cn("w-4 h-4 flex-shrink-0", selectedDocId === doc.id ? "text-lab-accent" : "text-zinc-500")} />
                <span className={cn("text-sm font-medium truncate", selectedDocId === doc.id ? "text-white" : "text-zinc-300")}>
                  {doc.name}
                </span>
              </div>
              {doc.status === 'ready' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-lab-accent flex-shrink-0" />
              ) : (
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 mt-1">
              <span>{doc.timestamp}</span>
              {doc.chunkCount && (
                <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                  {doc.chunkCount} 分块
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-lab-border text-[10px] font-mono text-zinc-600 flex justify-between">
        <span>系统状态: 运行中</span>
        <span>V1.0.4</span>
      </div>
    </div>
  );
};
