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
        <header className="h-14 border-b border-lab-border flex items-center justify-between px-8 bg-lab-bg/50 backdrop-blur-xl z-10 flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-lab-accent rotate-45" />
              <span className="text-[10px] font-display text-lab-text/50 uppercase tracking-[0.2em] font-bold">System Status: Online</span>
            </div>
            <div className="h-4 w-[1px] bg-lab-border" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-lab-accent" />
                <span className="text-[10px] font-display text-lab-text/40 uppercase tracking-wider font-medium">Analysis Mode: {selectedDocId ? 'TARGET_DOC' : 'GLOBAL_QUERY'}</span>
              </div>
              {selectedDocId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-lab-accent/5 border border-lab-accent/20 hud-notch">
                  <span className="text-[9px] text-lab-accent font-display font-bold uppercase tracking-tight">
                    Active_Asset: {selectedDoc.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-display text-lab-text/30 uppercase tracking-[0.3em] font-bold">Sector 04-G</span>
              <div className="w-2 h-2 rounded-full bg-lab-warning animate-pulse shadow-[0_0_8px_var(--clab-warning)]" />
            </div>
            <div className="px-2 py-1 border border-lab-border/50 text-[8px] font-display text-lab-text/40 tracking-[0.1em] font-bold">
              LATENCY_SYNC: 24MS
            </div>
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
