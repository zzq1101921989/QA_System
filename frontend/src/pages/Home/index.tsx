import React from 'react';
import { useLayout } from '../../hooks/useLayout';
import { useChat } from '../../hooks/useChat';
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
    uploadProgress,
    handleSendMessage,
    handleFileUpload,
    selectDocument,
  } = useChat();

  if (isMobile) {
    return (
      <MobileLayout 
        documents={documents}
        selectedDocId={selectedDocId}
        messages={messages}
        input={input}
        setInput={setInput}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onUpload={handleFileUpload}
        onSelect={selectDocument}
        onSend={handleSendMessage}
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
      input={input}
      setInput={setInput}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      onUpload={handleFileUpload}
      onSelect={selectDocument}
      onSend={handleSendMessage}
    />
  );
};

export default HomePage;
