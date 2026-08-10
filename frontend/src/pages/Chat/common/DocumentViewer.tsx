import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { documentService } from '../../../services/documentService';
import { FileText, Loader2 } from 'lucide-react';
import type { Document } from '../../../types/chat';

interface DocumentViewerProps {
  document: Document;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // 隐藏自带的侧边栏，因为我们有自己的 OutlineModal
  });

  const [isLoading, setIsLoading] = useState(true);
  const fileUrl = documentService.getFileUrl(document.id);

  // 简单的扩展名推断（暂不处理复杂 word/excel，先以 iframe/pdf 为主）
  const isPdf = document.name?.toLowerCase().endsWith('.pdf') || document.mimeType === 'application/pdf';

  return (
    <div className="w-full h-full flex flex-col bg-lab-panel relative overflow-hidden">
      {/* HUD Header */}
      <div className="h-10 border-b border-lab-border bg-lab-bg/50 backdrop-blur-xl flex items-center px-4 flex-shrink-0">
        <FileText className="w-4 h-4 text-lab-accent mr-2" />
        <span className="text-xs font-display text-lab-text uppercase tracking-wider truncate font-bold">
          {document.name || 'DOCUMENT_PREVIEW'}
        </span>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 relative bg-black/20">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-lab-panel z-10">
            <Loader2 className="w-8 h-8 text-lab-accent animate-spin mb-4" />
            <span className="text-[10px] font-display text-lab-text/40 uppercase tracking-[0.2em] font-bold">
              Loading Asset...
            </span>
          </div>
        )}

        {isPdf ? (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <div className="absolute inset-0" onLoad={() => setIsLoading(false)}>
              <Viewer
                fileUrl={fileUrl}
                plugins={[defaultLayoutPluginInstance]}
                theme={{
                  theme: 'dark',
                }}
                onDocumentLoad={() => setIsLoading(false)}
              />
            </div>
          </Worker>
        ) : (
          <iframe
            src={fileUrl}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            title={document.name}
          />
        )}

        {/* 覆盖一层极淡的蓝色网格以增强工业感，并且 pointer-events-none 防止影响交互 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern" />
      </div>
    </div>
  );
};
