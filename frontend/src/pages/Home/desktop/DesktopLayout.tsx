import React from 'react';
import { Search } from 'lucide-react';
import { Sidebar } from '../common/Sidebar';
import { ChatArea } from '../common/ChatArea';
import { InputBar } from '../common/InputBar';
import type { Document, Message, SessionMessage } from '../../../types/chat';

interface DesktopLayoutProps {
  documents: Document[];
  selectedDocId: string | null;
  messages: Message[];
  isAsking: boolean;
  input: string;
  setInput: (v: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  onAddChat: () => void;
  onUpload: (file: File) => void;
  onSelect: (id: string) => void;
  onSend: () => void;
  onNewChat: () => void;
  sessionMessages?: any[];
  currentSessionId?: string | null;
  onSwitchSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  documents,
  selectedDocId,
  messages,
  isAsking,
  input,
  setInput,
  isUploading,
  uploadProgress,
  onUpload,
  onSelect,
  onSend,
  onNewChat,
  sessionMessages,
  currentSessionId,
  onSwitchSession,
  onDeleteSession,
}) => {
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-row h-screen w-screen bg-lab-bg overflow-hidden text-lab-text font-sans relative">
      <aside className="relative w-80 h-full border-r border-lab-border bg-lab-panel overflow-hidden">
        <Sidebar 
          documents={documents}
          selectedDocId={selectedDocId}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onUpload={onUpload}
          onSelect={onSelect}
          onNewChat={onNewChat}
          sessionMessages={sessionMessages}
          currentSessionId={currentSessionId}
          onSwitchSession={onSwitchSession}
          onDeleteSession={onDeleteSession}
        />
      </aside>

      <main className="flex-1 flex flex-col relative h-full">
        <header className="h-16 border-b border-lab-border flex items-center justify-between px-8 bg-lab-bg/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-lab-text/40" />
              <span className="text-xs font-mono text-lab-text/40 uppercase">分析模式: {selectedDocId ? '指定文档' : '全局'}</span>
            </div>
            {selectedDocId && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lab-accent/10 border border-lab-accent/20">
                <span className="text-[10px] text-lab-accent font-bold uppercase tracking-tight">
                  当前: {selectedDoc.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lab-accent animate-pulse" />
            <span className="text-[10px] font-mono text-lab-text/40 uppercase tracking-widest">Secure Connection</span>
          </div>
        </header>

        <ChatArea messages={messages} isAsking={isAsking} />

        <InputBar
          input={input}
          setInput={setInput}
          onSend={onSend}
          placeholder={selectedDocId ? "针对选定文档提问..." : "在全局知识库中检索..."}
        />
      </main>
    </div>
  );
};
