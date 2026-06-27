import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading
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
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleConfirmUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      // We don't close here, we wait for isUploading to finish if we want, 
      // but usually we close and show progress in sidebar.
      // For this requirement, let's just trigger and let the parent handle state.
      setSelectedFile(null);
      onClose();
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
            className="relative w-full max-w-lg bg-lab-panel border border-lab-border rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-lab-border flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lab-accent/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-lab-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">上传知识文档</h3>
                  <p className="text-xs text-zinc-500 font-mono">SUPPORTED_FORMAT: PDF_ONLY</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-300",
                    dragActive 
                      ? "border-lab-accent bg-lab-accent/5 scale-[1.02]" 
                      : "border-lab-border hover:border-zinc-700 bg-white/2"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className={cn("w-8 h-8 transition-colors", dragActive ? "text-lab-accent" : "text-zinc-500")} />
                  </div>
                  <p className="text-sm font-medium text-zinc-300 mb-1">拖拽文件至此处，或点击上传</p>
                  <p className="text-xs text-zinc-600">仅支持 PDF 格式 (MAX 50MB)</p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-lab-accent/5 border border-lab-accent/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-lab-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-lab-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-lab-border text-zinc-400 font-bold hover:bg-white/5 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 py-3 px-4 rounded-xl bg-lab-accent text-lab-bg font-bold hover:bg-lab-accent/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  确认上传
                </button>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-white/2 border-t border-lab-border flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Security Scan: Active</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
