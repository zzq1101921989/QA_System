import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, BookText, Loader2, Plus, Trash2, X } from 'lucide-react';
import type { Document } from '../../../types/chat';
import { cn } from '../../../utils/cn';
import { hasPreferredDocumentOutline } from '../../../utils/documentOutline';
import { OutlineModal } from '../../study/common/OutlineModal';

interface BookActionModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onContinue: () => void;
  onPreview: () => void;
  onOpenOutline: () => void;
}

const BookActionModal: React.FC<BookActionModalProps> = ({
  isOpen,
  document,
  onClose,
  onContinue,
  onPreview,
  onOpenOutline,
}) => {
  if (!document) return null;

  const hasOutline = hasPreferredDocumentOutline(document);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-lab-text/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            className="relative w-full max-w-lg bg-white p-10 shadow-2xl overflow-hidden"
            style={{ transform: 'rotate(-0.5deg)' }}
          >
            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-28 h-7 bg-lab-accent/20 backdrop-blur-sm" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-lab-text/30 hover:text-lab-text hover:bg-lab-bg transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-lab-bg flex items-center justify-center text-lab-accent">
                  <BookText className="w-8 h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-black text-lab-text truncate">{document.name}</h3>
                  <p className="text-xs text-lab-text/40 font-bold mt-2">
                    入架日期：{new Date(document.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={onContinue}
                  className="w-full py-5 px-6 rounded-2xl bg-lab-accent text-white font-black hover:bg-lab-accent/90 transition-all shadow-xl shadow-lab-accent/20 flex items-center justify-center gap-2"
                >
                  <span>继续学习</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onOpenOutline}
                    disabled={!hasOutline}
                    className={cn(
                      "py-4 px-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest",
                      hasOutline
                        ? "bg-lab-bg text-lab-text/50 hover:bg-lab-border"
                        : "bg-lab-bg text-lab-text/20 cursor-not-allowed"
                    )}
                  >
                    从目录选一节
                  </button>
                  <button
                    onClick={onPreview}
                    className="py-4 px-4 rounded-2xl bg-lab-bg text-lab-text/50 font-black hover:bg-lab-border transition-all text-xs uppercase tracking-widest"
                  >
                    随便翻翻预览
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ShelfTabProps {
  documents: Document[];
  uploadProgress: number;
  onStudy: (docId: string) => void;
  onOpenUpload: () => void;
  onRequestDelete: (doc: Document) => void;
}

const ShelfTab: React.FC<ShelfTabProps> = ({
  documents,
  uploadProgress,
  onStudy,
  onOpenUpload,
  onRequestDelete,
}) => {
  const [isBookActionOpen, setIsBookActionOpen] = React.useState(false);
  const [activeDoc, setActiveDoc] = React.useState<Document | null>(null);
  const [isOutlineOpen, setIsOutlineOpen] = React.useState(false);
  const [outlineDoc, setOutlineDoc] = React.useState<Document | null>(null);

  const openBookAction = (doc: Document) => {
    if (doc.status !== 'ready') return;
    setActiveDoc(doc);
    setIsBookActionOpen(true);
  };

  const closeBookAction = () => {
    setIsBookActionOpen(false);
    setActiveDoc(null);
  };

  const openOutline = (doc: Document) => {
    if (doc.status !== 'ready') return;
    setOutlineDoc(doc);
    setIsOutlineOpen(true);
  };

  const closeOutline = () => {
    setIsOutlineOpen(false);
    setOutlineDoc(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-lab-text/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lab-accent" />
            <span className="text-xs font-black text-lab-accent uppercase tracking-[0.2em]">课本大本营</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight">我的<span className="text-lab-accent">学习书架</span></h2>
          <p className="text-lab-text/40 text-lg font-bold">每一本书都是一个待发现的新世界。</p>
        </div>
        <button
          onClick={onOpenUpload}
          className="px-10 py-5 rounded-[2.5rem] bg-lab-accent text-white font-black hover:bg-lab-accent/90 transition-all shadow-2xl shadow-lab-accent/20 active:scale-95 flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          <span>翻开新篇章</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {documents.map((doc, i) => (
          <div
            key={doc.id}
            className={cn(
              "group bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-b-8",
              doc.status === 'ready' ? "cursor-pointer" : "cursor-default",
              i % 3 === 0 ? "border-lab-accent -rotate-1" : i % 3 === 1 ? "border-lab-accent2 rotate-1" : "border-lab-warning rotate-[-0.5deg]"
            )}
            onClick={() => openBookAction(doc)}
          >
            <div className="flex items-start justify-between w-full mb-8">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl bg-lab-bg flex items-center justify-center text-lab-text/20 group-hover:bg-lab-accent group-hover:text-white transition-all duration-500",
                  doc.status === 'ready' && "cursor-pointer"
                )}
                onClick={doc.status === 'ready' ? (e) => {
                  e.stopPropagation();
                  openOutline(doc);
                } : undefined}
                role={doc.status === 'ready' ? "button" : undefined}
                aria-label={doc.status === 'ready' ? "查看目录结构" : undefined}
                tabIndex={doc.status === 'ready' ? 0 : undefined}
                onKeyDown={doc.status === 'ready' ? (e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  openOutline(doc);
                } : undefined}
              >
                <BookText className="w-8 h-8" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(doc);
                }}
                className="p-3 text-lab-text/10 hover:text-red-400 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-2xl font-black text-lab-text line-clamp-2 mb-6 group-hover:text-lab-accent transition-colors leading-tight min-h-[4rem]">
              {doc.name}
            </h3>

            {doc.status === 'processing' && (
              <div className="space-y-3 my-8">
                <div className="flex justify-between items-center text-[10px] font-black text-lab-text/30 uppercase tracking-widest">
                  <span>木木正在翻阅中...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-lab-bg rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-lab-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 flex items-center justify-between border-t border-lab-text/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-lab-text/20 font-black uppercase tracking-widest mb-1">入架日期</span>
                <span className="text-xs text-lab-text/40 font-bold">
                  {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>

              {doc.status === 'ready' ? (
                <div className="flex items-center gap-2 text-lab-accent font-black text-sm group-hover:translate-x-1 transition-transform">
                  <span>去探索</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-widest">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>准备中</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <BookActionModal
        isOpen={isBookActionOpen}
        document={activeDoc}
        onClose={closeBookAction}
        onContinue={() => {
          if (!activeDoc) return;
          onStudy(activeDoc.id);
          closeBookAction();
        }}
        onOpenOutline={() => {
          if (!activeDoc) return;
          closeBookAction();
          openOutline(activeDoc);
        }}
        onPreview={() => {
          if (!activeDoc) return;
          closeBookAction();
          openOutline(activeDoc);
        }}
      />

      <OutlineModal
        isOpen={isOutlineOpen}
        onClose={closeOutline}
        document={outlineDoc}
      />
    </div>
  );
};

export default ShelfTab;
