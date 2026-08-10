import React from 'react';
import { useLayout } from '../../hooks/useLayout';
import { useChat } from '../../hooks/useChat';
import { DesktopLayout } from './desktop/DesktopLayout';
import { MobileLayout } from './mobile/MobileLayout';

const ChatPage: React.FC = () => {
  const { isSidebarOpen, isMobile, toggleSidebar, closeSidebar } = useLayout();
  const {
    documents,
    selectedDocId,
    messages,
    input,
    setInput,
    isAsking,
    handleSendMessage,
    selectDocument,
    handleNewChat,
    currentSessionId,
    sessionMessages,
    switchSession,
    deleteSession,
    updateSessionName,
  } = useChat();

  if (isMobile) {
    return (
      <MobileLayout 
        documents={documents}
        selectedDocId={selectedDocId}
        messages={messages}
        isAsking={isAsking}
        input={input}
        setInput={setInput}
        onSelect={selectDocument}
        onSend={handleSendMessage}
        onNewChat={handleNewChat}
        sessionMessages={sessionMessages}
        currentSessionId={currentSessionId}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
        onUpdateSession={updateSessionName}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
    );
  }

  return (
    <DesktopLayout 
      documents={documents}
      selectedDocId={selectedDocId}
      messages={messages}
      isAsking={isAsking}
      input={input}
      setInput={setInput}
      onSelect={selectDocument}
      onSend={handleSendMessage}
      onNewChat={handleNewChat}
      sessionMessages={sessionMessages}
      currentSessionId={currentSessionId}
      onSwitchSession={switchSession}
      onDeleteSession={deleteSession}
      onUpdateSession={updateSessionName}
    />
  );
};

export default ChatPage;
