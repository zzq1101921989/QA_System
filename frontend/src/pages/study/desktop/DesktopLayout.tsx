import React, { useState, useEffect } from 'react';
import { ChevronLeft, List, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { ChatArea } from '../common/ChatArea';
import { InputBar } from '../common/InputBar';
import { DocumentViewer } from '../common/DocumentViewer';
import { OutlineModal } from '../common/OutlineModal';
import type { Document, Message, SessionMessage } from '../../../types/chat';
import { hasPreferredDocumentOutline } from '../../../utils/documentOutline';

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
  const navigate = useNavigate();
  const { docId } = useParams();

  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isDocFullscreen, setIsDocFullscreen] = useState(false);

  useEffect(() => {
    if (docId && docId !== selectedDocId) {
      onSelect(docId, true);
    }
  }, [docId, selectedDocId, onSelect]);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-row h-screen w-screen bg-lab-bg overflow-hidden text-lab-text font-sans relative">

      {!isDocFullscreen && (
        <aside className="relative w-72 h-full bg-lab-bg overflow-hidden transition-all duration-300 flex-shrink-0 z-20">
          <Sidebar
            onNewChat={onNewChat}
            sessionMessages={sessionMessages}
            currentSessionId={currentSessionId}
            onSwitchSession={onSwitchSession}
            onDeleteSession={onDeleteSession}
            onUpdateSession={onUpdateSession}
          />
        </aside>
      )}

      <main className="flex-1 flex flex-row relative h-full min-w-0 min-h-0 bg-lab-bg p-6 gap-6">

        {selectedDoc && (
          <div className={`flex flex-col h-full soft-card transition-all duration-500 ease-in-out ${isDocFullscreen ? 'w-full' : 'w-[58%]'}`}>
            <header className="h-14 border-b border-lab-border/50 flex items-center justify-between px-4 bg-lab-panel/50 backdrop-blur-xl flex-shrink-0">
              <div className="flex items-center gap-3 truncate">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-lab-accent/10 text-lab-text/50 hover:text-lab-accent rounded-xl transition-colors"
                  title="返回学习中心"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-lab-accent/10 flex items-center justify-center flex-shrink-0 text-lab-accent">
                  📖
                </div>
                <span className="font-bold text-sm truncate font-rounded pr-4 text-lab-text/80">{selectedDoc.name}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {hasPreferredDocumentOutline(selectedDoc) && (
                  <button
                    onClick={() => setIsOutlineOpen(true)}
                    className="p-2 text-lab-text/40 hover:text-lab-accent hover:bg-lab-accent/10 rounded-xl transition-colors"
                    title="查看大纲"
                  >
                    <List className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsDocFullscreen(!isDocFullscreen)}
                  className="p-2 text-lab-text/40 hover:text-lab-accent hover:bg-lab-accent/10 rounded-xl transition-colors"
                  title={isDocFullscreen ? "退出全屏阅读" : "全屏阅读"}
                >
                  {isDocFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </header>

            <div className="flex-1 min-h-0 relative bg-white/50">
              <DocumentViewer document={selectedDoc} />
            </div>
          </div>
        )}

        {!isDocFullscreen && (
          <div className={`flex flex-col h-full soft-card transition-all duration-500 ease-in-out ${selectedDoc ? 'flex-1' : 'w-full'}`}>
            <header className="h-14 border-b border-lab-border/50 flex items-center justify-between px-6 bg-lab-panel/50 backdrop-blur-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-lab-accent rounded-full animate-pulse shadow-[0_0_8px_var(--clab-accent)]" />
                <span className="text-sm font-bold text-lab-text/70 font-rounded tracking-wide uppercase">木木陪伴中</span>
              </div>

              {!selectedDoc && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-bold text-lab-accent bg-lab-accent/10 px-4 py-1.5 rounded-full hover:bg-lab-accent hover:text-white transition-colors"
                >
                  返回学习中心
                </button>
              )}
            </header>

            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-24 h-24 rounded-3xl bg-lab-accent/10 flex items-center justify-center mb-6 shadow-inner border border-lab-accent/20">
                    <img src="/gumda.png" alt="AI" className="w-16 h-16 object-cover opacity-80" />
                  </div>
                  <h3 className="text-xl font-bold text-lab-text font-rounded mb-2">你好，我是你的木木！</h3>
                  <p className="text-sm text-lab-text/50 font-rounded max-w-sm leading-relaxed">
                    {selectedDoc
                      ? `我们现在要一起学习《${selectedDoc.name}》。在左边阅读时，有任何不懂的地方，都可以随时问我哦！`
                      : '你还没有选择课本呢。你可以先去书架选一本书，或者直接在这里问我一般性的问题。'}
                  </p>
                </div>
              ) : (
                <ChatArea messages={messages} isAsking={isAsking} />
              )}

              <InputBar
                input={input}
                setInput={setInput}
                onSend={onSend}
                placeholder={selectedDoc ? "对这本课本有什么疑问吗？" : "问问木木吧..."}
              />
            </div>
          </div>
        )}
      </main>

      <OutlineModal
        isOpen={isOutlineOpen}
        onClose={() => setIsOutlineOpen(false)}
        document={selectedDoc || null}
      />
    </div>
  );
};
