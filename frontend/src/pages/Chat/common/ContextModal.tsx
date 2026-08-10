import React, { useState } from 'react';
import { FileText, CheckCircle2, List, Database, X, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Document } from '../../../types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OutlineModal } from './OutlineModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  selectedDocId: string | null;
  onSelect: (id: string | null, force?: boolean) => void;
}

export const ContextModal: React.FC<ContextModalProps> = ({
  isOpen,
  onClose,
  documents,
  selectedDocId,
  onSelect,
}) => {
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-lab-panel border border-lab-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between border-b border-lab-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-lab-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-lab-accent" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold tracking-[0.1em] text-lab-text uppercase">上下文变量设置</h2>
              <p className="text-[10px] font-mono text-lab-text/40">选择当前会话的分析文档，或者全局提问</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 text-lab-text/40 hover:text-lab-text transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {/* Global Search Option */}
          <div
            className={cn(
              "group w-full flex flex-col gap-1 p-4 rounded-xl transition-all cursor-pointer border",
              selectedDocId === null
                ? "bg-lab-active/10 border-lab-active/30 shadow-[0_0_15px_rgba(var(--clab-active-rgb),0.1)]"
                : "hover:bg-lab-text/5 border-lab-border/30 hover:border-lab-border"
            )}
            onClick={() => onSelect(null)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  selectedDocId === null ? "bg-lab-active text-white" : "bg-lab-text/10 text-lab-text/40"
                )}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={cn("text-sm font-bold tracking-wide", selectedDocId === null ? "text-lab-text" : "text-lab-text/60")}>全局知识库检索</h3>
                  <p className="text-[10px] text-lab-text/40 mt-0.5">对所有已上传文档进行联合搜索与分析</p>
                </div>
              </div>
              {selectedDocId === null && <CheckCircle2 className="w-5 h-5 text-lab-active" />}
            </div>
          </div>

          <div className="h-px w-full bg-lab-border/50 my-4" />

          {documents.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-lab-text/30 italic">尚未上传任何文档</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "group w-full flex flex-col gap-1 p-3 rounded-xl transition-all cursor-pointer border",
                    selectedDocId === doc.id 
                      ? "bg-lab-active/10 border-lab-active/30 shadow-[0_0_15px_rgba(var(--clab-active-rgb),0.1)]" 
                      : "hover:bg-lab-text/5 border-lab-border/30 hover:border-lab-border"
                  )}
                  onClick={() => onSelect(doc.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                      <FileText className={cn("w-4 h-4 flex-shrink-0", selectedDocId === doc.id ? "text-lab-active" : "text-lab-text/40")} />
                      <span className={cn("text-sm font-medium truncate", selectedDocId === doc.id ? "text-lab-text font-bold" : "text-lab-text/70")}>
                        {doc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {doc.status === 'ready' && doc.outline && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDoc(doc);
                            setIsOutlineOpen(true);
                          }}
                          className="p-1.5 text-lab-accent hover:bg-lab-accent/10 rounded-md transition-all"
                          title="查看大纲"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {doc.status === 'processing' && (
                    <div className="mt-2 w-full bg-lab-text/10 rounded-full h-1 overflow-hidden">
                      <div className="h-full bg-lab-accent w-full animate-pulse" />
                    </div>
                  )}
                  
                  {doc.status === 'ready' && doc.keywords && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {doc.keywords.split(',').slice(0, 3).map((kw, i) => (
                        <span key={i} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-lab-accent/5 border border-lab-accent/10 text-[9px] text-lab-accent/70 font-medium">
                          <Tag className="w-2 h-2" />
                          {kw.trim()}
                        </span>
                      ))}
                      {doc.keywords.split(',').length > 3 && (
                        <span className="text-[9px] text-lab-text/30 px-1 py-0.5">+{doc.keywords.split(',').length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-[10px] font-mono text-lab-text/40 mt-1">
                    <span>{new Date(doc.createdAt).toLocaleString('zh-CN', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                    {doc.chunkCount !== undefined && (
                      <span className="bg-lab-text/5 px-1.5 py-0.5 rounded border border-lab-text/5 uppercase">
                        {doc.chunkCount} 分块
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <OutlineModal 
        isOpen={isOutlineOpen}
        onClose={() => {
          setIsOutlineOpen(false);
          setViewingDoc(null);
        }}
        document={viewingDoc}
      />
    </div>
  );
};
