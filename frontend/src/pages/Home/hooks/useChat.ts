import { useDocuments } from './useDocuments';
import { useMessages } from './useMessages';
import useSession from './useSession';

export function useChat() {
  const {
    documents,
    selectedDocId,
    isUploading,
    uploadProgress,
    handleFileUpload,
    selectDocument,
    deleteDocument,
  } = useDocuments();

  const {
    currentSessionId,
    sessionMessages,
    createNewSession,
    switchSession,
    deleteSession,
    updateSessionName,
    getSessionMessages,
  } = useSession();

  const {
    messages,
    input,
    setInput,
    isAsking,
    handleSendMessage,
  } = useMessages({
    selectedDocId,
    currentSessionId,
    sessionMessages,
    getSessionMessages,
    createNewSession,
    updateSessionName,
  });

  return {
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
    deleteDocument,
    handleNewChat: createNewSession,
    currentSessionId,
    sessionMessages,
    switchSession,
    deleteSession,
    updateSessionName,
  };
}
