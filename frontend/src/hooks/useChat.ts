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
    loading: isSessionLoading,
    createNewSession,
    switchSession,
    deleteSession,
    updateSessionName,
    getSessionMessages,
    updateSessionDocument,
  } = useSession(selectedDocId);

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
    selectDocument(finalId, true);
  }, [selectDocument, selectedDocId]);

  const hasInitializedRef = useRef(false);

  // 当文档选中状态改变或会话加载完成时，同步会话上下文
  useEffect(() => {
    if (isSessionLoading) return;

    if (selectedDocId) {
      // 1. 检查当前会话是否已经是针对该文档的
      const currentSession = sessionMessages.find(s => s.sessionId === currentSessionId);
      if (currentSession?.documentId === selectedDocId) {
        hasInitializedRef.current = true;
        return;
      }

      // 2. 查找是否已有针对该文档的其他会话
      const existingSession = sessionMessages.find(s => s.documentId === selectedDocId);
      if (existingSession) {
        switchSession(existingSession.sessionId, () => {});
      } else {
        // 3. 否则创建新会话
        createNewSession(selectedDocId);
      }
      hasInitializedRef.current = true;
    } else if (currentSessionId && !hasInitializedRef.current) {
      // 4. 初始化：如果没有选中任何文档，但有当前会话，则尝试从会话中恢复文档
      const currentSession = sessionMessages.find(s => s.sessionId === currentSessionId);
      if (currentSession?.documentId) {
        selectDocument(currentSession.documentId, true);
      }
      hasInitializedRef.current = true;
    }
  }, [selectedDocId, isSessionLoading, sessionMessages, currentSessionId, switchSession, createNewSession, selectDocument]);

  const handleSwitchSession = useCallback((sessionId: string) => {
    switchSession(sessionId, (docId) => selectDocument(docId, true));
  }, [switchSession, selectDocument]);

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
