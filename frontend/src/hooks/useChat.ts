import { useCallback, useEffect, useRef } from 'react';
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
    updateSessionDocument,
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

  const handleSelectDocument = useCallback((docId: string | null, force: boolean = false) => {
    const finalId = force ? docId : (selectedDocId === docId ? null : docId);
    selectDocument(docId, force);
    if (currentSessionId) {
      updateSessionDocument(currentSessionId, finalId);
    }
  }, [selectDocument, selectedDocId, currentSessionId, updateSessionDocument]);

  const handleSwitchSession = useCallback((sessionId: string) => {
    switchSession(sessionId, (docId) => selectDocument(docId, true));
  }, [switchSession, selectDocument]);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && sessionMessages.length > 0 && currentSessionId) {
      hasInitializedRef.current = true;
      const currentSession = sessionMessages.find(s => s.sessionId === currentSessionId);
      if (currentSession) {
        selectDocument(currentSession.documentId || null, true);
      }
    }
  }, [sessionMessages, currentSessionId, selectDocument]);

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
    selectDocument: handleSelectDocument,
    deleteDocument,
    handleNewChat: createNewSession,
    currentSessionId,
    sessionMessages,
    switchSession: handleSwitchSession,
    deleteSession,
    updateSessionName,
  };
}
