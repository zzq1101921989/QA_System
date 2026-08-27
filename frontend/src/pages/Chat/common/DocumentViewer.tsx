import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { documentService } from '../../../services/documentService';
import { Loader2 } from 'lucide-react';
import type { Document } from '../../../types/chat';

interface DocumentViewerProps {
  document: Document;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // 当文档 ID 改变时，重置加载状态
  React.useEffect(() => {
    setIsLoading(true);
  }, [document.id]);

  const fileUrl = documentService.getFileUrl(document.id);

  // 简单的扩展名推断
  const isPdf = document.name?.toLowerCase().endsWith('.pdf') || document.mimeType === 'application/pdf';

  return (
    <div className="w-full h-full flex flex-col bg-lab-bg/20 relative overflow-hidden">
      {/* Viewer Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-lab-bg/50 backdrop-blur-md z-10">
            <div className="w-16 h-16 rounded-3xl bg-lab-panel shadow-lg flex items-center justify-center mb-4 border border-lab-border/30">
              <Loader2 className="w-6 h-6 text-lab-accent animate-spin" />
            </div>
            <span className="text-xs font-bold text-lab-text/40 font-rounded tracking-widest uppercase">
              正在翻开课本...
            </span>
          </div>
        )}

        {isPdf ? (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <div className="absolute inset-0 overflow-auto custom-scrollbar py-12 px-8 flex flex-col items-center">
              <div className="w-full max-w-4xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden border border-lab-border/20">
                <Viewer
                  fileUrl={fileUrl}
                  theme={{
                    theme: 'light',
                  }}
                  onDocumentLoad={() => setIsLoading(false)}
                />
              </div>
            </div>
          </Worker>
        ) : (
          <iframe
            src={fileUrl}
            className="w-full h-full border-none bg-white"
            onLoad={() => setIsLoading(false)}
            title={document.name}
          />
        )}
      </div>
    </div>
  );
};

