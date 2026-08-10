import React, { useState } from 'react';
import { FileText, Plus, Trash2, List, Loader2, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocuments } from '../../hooks/useDocuments';
import { UploadModal } from '../Chat/common/UploadModal';
import { OutlineModal } from '../Chat/common/OutlineModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '../../types/chat';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DocumentsPage: React.FC = () => {
  const {
    documents,
    isUploading,
    uploadProgress,
    handleFileUpload,
    deleteDocument,
  } = useDocuments();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-lab-panel text-lab-text overflow-hidden relative battle-hud-corners">
      {/* HUD Background Decorations */}
      <div className="battle-hud-bg" />
      <div className="battle-hud-scanline" />
      
      <header className="min-h-[5rem] py-4 border-b border-lab-border flex items-center justify-between px-8 bg-lab-panel z-10 flex-shrink-0 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-lab-accent/10 flex items-center justify-center border border-lab-accent/20">
              <FileText className="w-6 h-6 text-lab-accent" />
            </div>
            <div>
              <h1 className="text-xl hud-header">文档资产管理</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-lab-active animate-pulse" />
                <span className="text-[10px] font-mono text-lab-text/40 uppercase tracking-wider">System Online // Intelligence Node</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 px-6 border-l border-lab-border/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-lab-text/30 uppercase">Assets Count</span>
              <span className="text-sm font-bold font-mono">{documents.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-lab-text/30 uppercase">Status</span>
              <span className="text-xs font-bold text-lab-active uppercase tracking-tighter">Synchronized</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="hud-notch flex items-center gap-2 px-6 py-2.5 bg-lab-accent text-white hover:bg-lab-accent/90 transition-all shadow-lg shadow-lab-accent/20 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Plus className="w-4 h-4 relative z-10" />
          <span className="text-sm font-bold relative z-10 uppercase tracking-widest">上传新文档</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-lab-accent/5 flex items-center justify-center border border-lab-accent/10 relative">
                <FileText className="w-10 h-10 text-lab-accent/20" />
                {/* Decorative scanning circle */}
                <motion.div 
                  className="absolute inset-0 border-2 border-lab-accent/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-mono uppercase animate-pulse">
                No Assets Found
              </div>
            </div>
            
            <div className="max-w-xs space-y-2">
              <h2 className="text-xl hud-header text-lab-text/80 tracking-widest">知识库暂无数据</h2>
              <p className="text-xs font-mono text-lab-text/40 leading-relaxed uppercase tracking-tighter">
                [SYSTEM_ALERT]: Intelligence repository is currently empty. Please initiate data uplink by uploading new tactical documents.
              </p>
            </div>

            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-8 py-3 bg-lab-accent/10 border border-lab-accent/30 text-lab-accent hover:bg-lab-accent hover:text-white transition-all duration-300 hud-notch font-bold uppercase tracking-widest text-xs"
            >
              Initialize Upload Sequence
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="group hud-card hud-notch flex flex-col gap-3 p-5 hover:border-lab-accent/50 transition-all duration-300"
              >
                {/* Decoration: Corner Accent */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lab-accent/20 group-hover:border-lab-accent/50 transition-colors" />
                
                <div className="flex items-start justify-between w-full relative z-10">
                  <div className="flex flex-col gap-1 truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="hud-tag bg-lab-accent/10 text-lab-accent border border-lab-accent/20">
                        DOC-{String(index + 1).padStart(3, '0')}
                      </span>
                      {doc.status === 'processing' && (
                        <span className="text-[9px] font-mono text-amber-500 animate-pulse uppercase">Syncing...</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 truncate mt-1">
                      <FileText className="w-4 h-4 text-lab-accent flex-shrink-0" />
                      <span className="text-sm font-bold text-lab-text truncate tracking-tight">
                        {doc.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {doc.status === 'ready' && doc.outline && (
                      <button
                        onClick={() => {
                          setViewingDoc(doc);
                          setIsOutlineOpen(true);
                        }}
                        className="p-1.5 text-lab-accent hover:bg-lab-accent/10 rounded-md transition-all border border-transparent hover:border-lab-accent/20"
                        title="查看大纲"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-lab-text/30 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all border border-transparent hover:border-red-400/20"
                      title="删除文档"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {doc.status === 'processing' && (
                  <div className="space-y-1.5 mt-2 relative z-10">
                    <div className="flex justify-between items-center text-[9px] font-mono text-lab-text/40">
                      <span>DATA_INGESTION_PROGRESS</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-lab-text/5 border border-lab-border/50 rounded-none h-1.5 overflow-hidden p-[1px]">
                      <motion.div 
                        className={cn(
                          "h-full transition-all duration-300 relative",
                          uploadProgress >= 90 ? "bg-amber-500 animate-pulse" : "bg-lab-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                )}
                
                {doc.status === 'ready' && doc.keywords && (
                  <div className="flex flex-wrap gap-1.5 mt-2 relative z-10">
                    {doc.keywords.split(',').slice(0, 3).map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-lab-text/5 border border-lab-border/50 text-[9px] text-lab-text/60 font-mono uppercase tracking-tighter group-hover:border-lab-accent/30 transition-colors">
                        <Tag className="w-2.5 h-2.5 opacity-50" />
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-lab-border/30 relative z-10">
                  <span className="text-[9px] font-mono text-lab-text/30">
                    [{new Date(doc.createdAt).toLocaleDateString('zh-CN')} {new Date(doc.createdAt).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}]
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {doc.chunkCount !== undefined && (
                      <span className="text-[9px] font-mono text-lab-accent/70 bg-lab-accent/5 px-1.5 py-0.5 border border-lab-accent/10 uppercase tracking-tighter">
                        CHUNKS: {doc.chunkCount}
                      </span>
                    )}
                    {doc.status === 'ready' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-mono text-lab-active uppercase tracking-tighter">Verified</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-lab-active shadow-[0_0_8px_var(--clab-active)]" />
                      </div>
                    ) : doc.status === 'error' ? (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <span className="text-[8px] font-mono uppercase tracking-tighter">Failure</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <span className="text-[8px] font-mono uppercase tracking-tighter">Processing</span>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                          <Loader2 className="w-2.5 h-2.5" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal 
        documents={documents}
        uploadProgress={uploadProgress}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        isUploading={isUploading}
      />

      <OutlineModal 
        isOpen={isOutlineOpen}
        onClose={() => {
          setIsOutlineOpen(false);
          setViewingDoc(null);
        }}
        document={viewingDoc}
      />

      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDocToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-lab-panel border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-lab-text">确认删除文档？</h3>
                    <p className="text-xs text-lab-text/40 font-mono">WARNING: DESTRUCTIVE ACTION</p>
                  </div>
                </div>
                <p className="text-sm text-lab-text/70 leading-relaxed mb-6">
                  即将删除 <span className="font-bold text-red-400">"{docToDelete.name}"</span>。
                  <br />
                  此操作将从数据库和向量库中永久移除该文档的所有解析内容，且不可恢复。
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDocToDelete(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-lab-border text-lab-text/60 font-bold hover:bg-lab-text/5 hover:text-lab-text transition-all"
                  >
                    取消 (CANCEL)
                  </button>
                  <button
                    onClick={() => {
                      deleteDocument(docToDelete.id);
                      setDocToDelete(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    确认删除 (CONFIRM)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;