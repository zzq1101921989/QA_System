import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Trash2, Database, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '../../../types/chat';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  documents: Document[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
  documents
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("不支持的文件格式，仅支持 PDF, Word, Excel");
      }
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("不支持的文件格式，仅支持 PDF, Word, Excel");
      }
    }
  }, []);

  const handleConfirmUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-4xl bg-lab-panel border border-lab-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]"
          >
            {/* 左侧：已上传文档列表 */}
            <div className="w-full md:w-80 border-r border-lab-border bg-black/20 flex flex-col">
              <div className="p-6 border-b border-lab-border flex items-center gap-3">
                <Database className="w-5 h-5 text-lab-text/40" />
                <h3 className="text-sm font-bold text-lab-text/60 uppercase tracking-wider">已存储文档</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {documents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-lab-text/30 opacity-50 p-8 text-center">
                    <FileText className="w-8 h-8 mb-2" />
                    <p className="text-xs">暂无已上传文档</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-3 rounded-xl bg-lab-text/5 border border-lab-text/5 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-lab-text/40 flex-shrink-0" />
                          <span className="text-xs font-medium text-lab-text/60 truncate">{doc.name}</span>
                        </div>
                        {doc.status === 'ready' ? (
                          <CheckCircle2 className="w-3 h-3 text-lab-accent flex-shrink-0" />
                        ) : (
                          <Loader2 className="w-3 h-3 text-amber-500 animate-spin flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-lab-text/30 font-mono">
                        <span>{new Date(doc.createdAt).toLocaleDateString('zh-CN')}</span>
                        {doc.chunkCount !== undefined && <span>{doc.chunkCount} 分块</span>}
                      </div>
                      {doc.keywords && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doc.keywords.split(',').slice(0, 3).map((kw, i) => (
                            <span key={i} className="px-1 py-0.5 rounded bg-lab-text/5 text-[8px] text-lab-text/40">
                              {kw.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 右侧：上传区域 */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-lab-border flex items-center justify-between bg-lab-text/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lab-accent/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-lab-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-lab-text">上传新文档</h3>
                    <p className="text-xs text-lab-text/40 font-mono">SUPPORTED: PDF, DOCX, XLSX</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-lab-text/40 hover:text-lab-text transition-colors rounded-lg hover:bg-lab-text/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar">
                {!selectedFile ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "relative flex-1 group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-300 min-h-[250px]",
                      dragActive 
                        ? "border-lab-accent bg-lab-accent/5 scale-[1.01]" 
                        : "border-lab-border hover:border-zinc-700 bg-lab-text/[0.02]"
                    )}
                  >
                    <input
                      type="file"
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-lab-text/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className={cn("w-8 h-8 transition-colors", dragActive ? "text-lab-accent" : "text-lab-text/40")} />
                    </div>
                    <p className="text-sm font-medium text-lab-text/60 mb-1">拖拽文件至此处，或点击上传</p>
                    <p className="text-xs text-lab-text/30">支持 PDF, Word, Excel (MAX 50MB)</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full p-8 rounded-2xl bg-lab-accent/5 border border-lab-accent/20 flex flex-col items-center gap-4 max-w-sm">
                      <div className="w-16 h-16 rounded-2xl bg-lab-accent/10 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-lab-accent" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-lab-text truncate max-w-[250px]">{selectedFile.name}</p>
                        <p className="text-sm text-lab-text/40 font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
                      >
                        更换文件
                      </button>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-lab-text/40">
                      <span>正在处理文档...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-lab-text/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        className="h-full bg-lab-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-8 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-lab-border text-lab-text/40 font-bold hover:bg-lab-text/5 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 py-3 px-4 rounded-xl bg-lab-accent text-lab-bg font-bold hover:bg-lab-accent/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {isUploading ? '正在上传...' : '确认上传'}
                  </button>
                </div>
              </div>

              <div className="px-8 py-4 bg-lab-text/[0.02] border-t border-lab-border flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-lab-text/40" />
                <span className="text-[10px] text-lab-text/40 font-mono uppercase tracking-widest">Security Scan: Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
