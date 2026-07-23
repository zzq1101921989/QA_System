import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronRight, List } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '../../../types/chat';

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

const OutlineItem: React.FC<{ item: OutlineNode; level: number }> = ({ item, level }) => {
  return (
    <div className="space-y-1">
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg hover:bg-lab-text/5 transition-colors group",
          level === 0 ? "bg-lab-text/[0.03] border border-lab-text/5" : ""
        )}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
      >
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          level === 0 ? "bg-lab-accent" : "bg-lab-text/20"
        )} />
        <span className={cn(
          "text-sm",
          level === 0 ? "font-bold text-lab-text" : "text-lab-text/60"
        )}>
          {item.label.title}
        </span>
      </div>
      {item.children && item.children.length > 0 && (
        <div className="space-y-1">
          {item.children.map((child, idx) => (
            <OutlineItem key={idx} item={child} level={level + 1} />
          ))}
        </div>
      )}
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
            className="relative w-full max-w-2xl bg-lab-panel border border-lab-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh]"
          >
            <div className="p-6 border-b border-lab-border flex items-center justify-between bg-lab-text/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lab-accent/10 flex items-center justify-center">
                  <List className="w-5 h-5 text-lab-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-lab-text">文档大纲</h3>
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

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {document.outline && document.outline.length > 0 ? (
                <div className="space-y-4">
                  {document.outline.map((item, idx) => (
                    <OutlineItem key={idx} item={item} level={0} />
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
              <div className="p-6 bg-lab-text/[0.02] border-t border-lab-border">
                <h4 className="text-xs font-bold text-lab-text/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  摘要总结
                </h4>
                <p className="text-sm text-lab-text/70 leading-relaxed italic">
                  "{document.summary}"
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
