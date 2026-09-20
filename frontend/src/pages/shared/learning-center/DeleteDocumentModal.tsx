import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { Document } from '../../../types/chat';

interface DeleteDocumentModalProps {
  document: Document | null;
  onCancel: () => void;
  onConfirm: (docId: string) => void;
}

const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({
  document,
  onCancel,
  onConfirm,
}) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-lab-text/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-md bg-white p-12 shadow-2xl overflow-hidden"
        style={{ transform: 'rotate(1deg)' }}
      >
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-24 h-6 bg-red-400/20 backdrop-blur-sm" />
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-lg">
            <Trash2 className="w-10 h-10 text-red-400" />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-lab-text">要收起这本课本吗？</h3>
            <p className="text-lab-text/40 font-bold leading-relaxed">
              确定要把 <span className="text-lab-text">"{document.name}"</span> 移出书架吗？相关的学习印章也会暂时收起来哦。
            </p>
          </div>
          <div className="flex w-full gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-5 px-6 bg-lab-bg text-lab-text/30 font-black hover:bg-lab-border transition-all text-xs uppercase tracking-widest"
            >
              再读一会儿
            </button>
            <button
              onClick={() => onConfirm(document.id)}
              className="flex-1 py-5 px-6 bg-red-400 text-white font-black hover:bg-red-500 transition-all shadow-xl shadow-red-400/30 text-xs uppercase tracking-widest"
            >
              确认移出
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteDocumentModal;

