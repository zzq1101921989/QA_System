import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../common/Sidebar';
import { ChatArea } from '../common/ChatArea';
import { InputBar } from '../common/InputBar';
import { ContextModal } from '../common/ContextModal';
import type { Document, Message, SessionMessage } from '../../../types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MobileLayoutProps {
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
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
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
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
}) => {
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-screen w-screen bg-lab-bg overflow-hidden text-lab-text font-sans relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 w-[280px] bg-lab-panel border-r border-lab-border z-50 transition-transform duration-300 transform",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          onNewChat={onNewChat}
          sessionMessages={sessionMessages}
          currentSessionId={currentSessionId}
          onSwitchSession={onSwitchSession}
          onDeleteSession={onDeleteSession}
          onUpdateSession={onUpdateSession}
          isMobile
          onClose={closeSidebar}
        />
      </aside>

      <main className="flex-1 flex flex-col relative h-full min-w-0 min-h-0">
        <header className="h-16 border-b border-lab-border flex items-center justify-between px-4 bg-lab-bg/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4 truncate">
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-lab-text/40 hover:text-lab-text">
              <Menu className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsContextModalOpen(true)}
              className="flex items-center gap-1 hover:bg-lab-text/5 px-2 py-1 rounded-md transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-lab-accent" />
              <span className="text-[10px] font-mono text-lab-text/40 uppercase">分析模式: {selectedDocId ? '指定' : '全局'}</span>
            </button>
            {selectedDocId && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lab-accent/10 border border-lab-accent/20 max-w-[100px]">
                <span className="text-[10px] text-lab-accent font-bold uppercase truncate">
                  {selectedDoc?.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lab-accent animate-pulse" />
          </div>
        </header>

        <ChatArea messages={messages} isAsking={isAsking} />

        <InputBar 
          input={input}
          setInput={setInput}
          onSend={onSend}
          placeholder="输入提问..."
          isMobile
        />
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
