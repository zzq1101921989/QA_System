import React from 'react';
import { useLayout } from '../../hooks/useLayout';
import { useChat } from './hooks/useChat';
import { DesktopLayout } from '../../pages/Home/desktop/DesktopLayout';
import { MobileLayout } from '../../pages/Home/mobile/MobileLayout';

const HomePage: React.FC = () => {
  const { isSidebarOpen, isMobile, toggleSidebar, closeSidebar } = useLayout();
  const {
    documents,
    selectedDocId,
    messages,
    input,
    setInput,
    isUploading,
    isAsking,
    uploadProgress,
    handleSendMessage,
    handleFileUpload,
    selectDocument,
    handleNewChat,
    currentSessionId,
    sessionMessages,
    switchSession,
    deleteSession,
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
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onUpload={handleFileUpload}
        onSelect={selectDocument}
        onSend={handleSendMessage}
        onNewChat={handleNewChat}
        sessionMessages={sessionMessages}
        currentSessionId={currentSessionId}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
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
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      onUpload={handleFileUpload}
      onSelect={selectDocument}
      onSend={handleSendMessage}
      onNewChat={handleNewChat}
      sessionMessages={sessionMessages}
      currentSessionId={currentSessionId}
      onAddChat={handleNewChat}
      onSwitchSession={switchSession}
      onDeleteSession={deleteSession}
    />
  );
};

export default HomePage;
