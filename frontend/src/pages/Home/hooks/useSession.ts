import { useState, useEffect, useCallback } from 'react';
import type { SessionMessage, Message } from '../../../types/chat';
import { documentService } from '../../../services/documentService';

export default function useSession() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化：从后端加载会话列表
  useEffect(() => {
    documentService.getSessions()
      .then(data => {
        setSessions(data);
        if (data.length > 0) {
          setCurrentSessionId(data[0].sessionId);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * 开启新会话（后端生成 UUID）
   */
  const createNewSession = useCallback(async (): Promise<string> => {
    const newSession = await documentService.createSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.sessionId);
    return newSession.sessionId;
  }, []);

  /**
   * 切换会话
   */
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  /**
   * 删除会话
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
    await documentService.deleteSession(sessionId);
  }, [currentSessionId]);

  /**
   * 更新会话名称（仅本地状态，后端在首次提问时自动设置标题）
   */
  const updateSessionName = useCallback((sessionId: string, name: string) => {
    setSessions(prev => prev.map(s =>
      s.sessionId === sessionId
        ? { ...s, sessionName: name.slice(0, 20) + (name.length > 20 ? '...' : '') }
        : s
    ));
  }, []);

  /**
   * 从后端加载会话历史消息
   */
  const getSessionMessages = useCallback(async (sessionId: string): Promise<Message[]> => {
    return documentService.getSessionHistory(sessionId);
  }, []);

  return {
    currentSessionId,
    sessionMessages: sessions,
    loading,
    createNewSession,
    switchSession,
    deleteSession,
    updateSessionName,
    getSessionMessages,
  };
}
