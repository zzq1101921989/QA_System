import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Sidebar } from '../common/Sidebar';
import { ChatArea } from '../common/ChatArea';
import { InputBar } from '../common/InputBar';
import { ContextModal } from '../common/ContextModal';
import type { Document, Message, SessionMessage } from '../../../types/chat';

interface DesktopLayoutProps {
  documents: Document[];
  selectedDocId: string | null;
  messages: Message[];
  isAsking: boolean;
  input: string;
  setInput: (v: string) => void;
  onSelect: (id: string | null, force?: boolean) => void;
  onSend: () => void;
  onNewChat: () => void;
  sessionMessages?: SessionMessage[];
  currentSessionId?: string | null;
  onSwitchSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onUpdateSession?: (id: string, name: string) => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  documents,
  selectedDocId,
  messages,
  isAsking,
  input,
  setInput,
  onSelect,
  onSend,
  onNewChat,
  sessionMessages,
  currentSessionId,
  onSwitchSession,
  onDeleteSession,
  onUpdateSession,
}) => {
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-row h-screen w-screen bg-lab-bg overflow-hidden text-lab-text font-sans relative">
      <aside className="relative w-80 h-full border-r border-lab-border bg-lab-panel overflow-hidden">
        <Sidebar 
          onNewChat={onNewChat}
          sessionMessages={sessionMessages}
          currentSessionId={currentSessionId}
          onSwitchSession={onSwitchSession}
          onDeleteSession={onDeleteSession}
          onUpdateSession={onUpdateSession}
        />
      </aside>

      <main className="flex-1 flex flex-col relative h-full min-w-0 min-h-0">
        <header className="h-14 border-b border-lab-border flex items-center justify-between px-8 bg-lab-bg/50 backdrop-blur-xl z-10 flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-lab-accent rotate-45" />
              <span className="text-[10px] font-display text-lab-text/50 uppercase tracking-[0.2em] font-bold">System Status: Online</span>
            </div>
            <div className="h-4 w-[1px] bg-lab-border" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsContextModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-lab-text/5 transition-colors group cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-lab-accent group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-display text-lab-text/40 uppercase tracking-wider font-medium group-hover:text-lab-text/60 transition-colors">
                  分析模式: {selectedDocId ? '目标文档' : '全局检索'}
                </span>
              </button>
              {selectedDocId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-lab-accent/5 border border-lab-accent/20 hud-notch">
                  <span className="text-[9px] text-lab-accent font-display font-bold uppercase tracking-tight">
                    当前文档: {selectedDoc?.name}
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

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <ChatArea messages={messages} isAsking={isAsking} />
          <InputBar 
            input={input}
            setInput={setInput}
            onSend={onSend}
            placeholder={selectedDocId ? "针对选定文档提问..." : "在全局知识库中检索..."}
          />
        </div>
      </main>

      <ContextModal 
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        documents={documents}
        selectedDocId={selectedDocId}
        onSelect={onSelect}
      />
    </div>
  );
};
