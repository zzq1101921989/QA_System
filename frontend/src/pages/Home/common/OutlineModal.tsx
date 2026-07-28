import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronRight, List, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '../../../types/chat';
import { DocumentViewer } from './DocumentViewer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OutlineNode {
  label: {
    title: string;
  };
  children?: OutlineNode[];
}

interface OutlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const OutlineItem: React.FC<{ item: OutlineNode; level: number; initiallyExpanded?: boolean }> = ({ item, level, initiallyExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-colors group cursor-pointer",
          level === 0 ? "bg-lab-text/[0.03] border border-lab-text/5 hover:bg-lab-text/[0.05]" : "hover:bg-lab-text/5"
        )}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-center w-4 h-4">
          {hasChildren ? (
            <ChevronDown 
              className={cn(
                "w-3.5 h-3.5 text-lab-text/40 transition-transform duration-200",
                !isExpanded && "-rotate-90"
              )} 
            />
          ) : (
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              level === 0 ? "bg-lab-accent" : "bg-lab-text/20"
            )} />
          )}
        </div>
        <span className={cn(
          "text-sm flex-1",
          level === 0 ? "font-bold text-lab-text" : "text-lab-text/60"
        )}>
          {item.label.title}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1"
          >
            {item.children!.map((child, idx) => (
              <OutlineItem key={idx} item={child} level={level + 1} initiallyExpanded={initiallyExpanded && idx === 0} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const OutlineModal: React.FC<OutlineModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!document) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="relative w-full max-w-6xl bg-lab-panel border border-lab-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
          >
            <div className="p-4 md:p-6 border-b border-lab-border flex items-center justify-between bg-lab-text/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lab-accent/10 flex items-center justify-center">
                  <List className="w-5 h-5 text-lab-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-lab-text">文档解析详情</h3>
                  <p className="text-xs text-lab-text/40 font-mono truncate max-w-[400px]">{document.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-lab-text/40 hover:text-lab-text transition-colors rounded-lg hover:bg-lab-text/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-row overflow-hidden">
              {/* 左侧大纲区域 */}
              <div className="w-1/3 min-w-[280px] max-w-[400px] border-r border-lab-border flex flex-col bg-lab-panel/50">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                  {document.outline && document.outline.length > 0 ? (
                    <div className="space-y-4">
                      {document.outline.map((item, idx) => (
                        <OutlineItem key={idx} item={item} level={0} initiallyExpanded={idx === 0} />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-lab-text/30 opacity-50 p-8 text-center">
                      <FileText className="w-12 h-12 mb-4" />
                      <p>该文档暂无生成的大纲内容</p>
                    </div>
                  )}
                </div>

                {document.summary && (
                  <div className="p-4 md:p-6 bg-lab-text/[0.02] border-t border-lab-border flex-shrink-0">
                    <h4 className="text-xs font-bold text-lab-text/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      摘要总结
                    </h4>
                    <p className="text-sm text-lab-text/70 leading-relaxed italic line-clamp-4 hover:line-clamp-none transition-all">
                      "{document.summary}"
                    </p>
                  </div>
                )}
              </div>

              {/* 右侧原文档预览区域 */}
              <div className="flex-1 relative bg-black/20 overflow-hidden flex flex-col min-h-0">
                <DocumentViewer document={document} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
