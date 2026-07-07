import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from '../../../types/chat';
import { documentService } from '../../../services/documentService';

interface UseMessagesProps {
  selectedDocId: string | null;
  currentSessionId: string | null;
  getSessionMessages: (sessionId: string) => Promise<Message[]>;
  createNewSession: () => Promise<string>;
  updateSessionName: (sessionId: string, name: string) => void;
}

export function useMessages({
  selectedDocId,
  currentSessionId,
  getSessionMessages,
  createNewSession,
  updateSessionName,
}: UseMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // 切换会话时，从后端加载历史消息
  useEffect(() => {
    if (currentSessionId) {
      getSessionMessages(currentSessionId).then(setMessages);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, getSessionMessages]);

  /**
   * 处理发送消息
   */
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isAsking) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 确保有会话 ID
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await createNewSession();
    } else if (messages.length === 0) {
      updateSessionName(activeSessionId, input);
    }

    // 调用后端 API 提问（后端自动保存消息到数据库）
    if (selectedDocId) {
      setIsAsking(true);
      try {
        const response = await documentService.ask(selectedDocId, input, activeSessionId);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          sources: response.sources || [],
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        console.error('Ask failed:', error);
      } finally {
        setIsAsking(false);
      }
    }
  }, [input, isAsking, selectedDocId, currentSessionId, messages.length, createNewSession, updateSessionName]);

  return {
    messages,
    input,
    setInput,
    isAsking,
    handleSendMessage,
  };
}
