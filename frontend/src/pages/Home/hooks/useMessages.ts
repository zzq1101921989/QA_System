import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from '../../../types/chat';
import { documentService } from '../../../services/documentService';

interface UseMessagesProps {
  selectedDocId: string | null;
  currentSessionId: string | null;
  getSessionMessages: (sessionId: string) => Message[];
  saveSessionMessages: (sessionId: string, messages: Message[]) => void;
  createNewSession: (firstMessage?: string) => string;
  updateSessionName: (sessionId: string, name: string) => void;
}

export function useMessages({
  selectedDocId,
  currentSessionId,
  getSessionMessages,
  saveSessionMessages,
  createNewSession,
  updateSessionName
}: UseMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesRef = useRef<Message[]>([]);

  // 同步 messages 到 ref，方便在异步回调中使用最新值
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 当切换会话时，从本地加载消息
  useEffect(() => {
    if (currentSessionId) {
      const history = getSessionMessages(currentSessionId);
      setMessages(history);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, getSessionMessages]);

  /**
   * 处理发送消息
   */
  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // 确定当前的 sessionId
    let activeSessionId = currentSessionId;
    
    // 如果没有当前会话，则创建一个
    if (!activeSessionId) {
      activeSessionId = createNewSession(input);
    } else if (messages.length === 0) {
      // 如果是第一条消息，更新会话名称
      updateSessionName(activeSessionId, input);
    }

    // 调用后端 API 提问
    if (selectedDocId) {
      setIsAsking(true);
      documentService.ask(selectedDocId, input, activeSessionId).then(response => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          sources: response.sources || [],
        };
        const updatedMessages = [...newMessages, aiMsg];
        setMessages(updatedMessages);
        // 保存到本地
        saveSessionMessages(activeSessionId!, updatedMessages);
      }).catch(error => {
        console.error('Ask failed:', error);
      }).finally(() => {
        setIsAsking(false);
      });
    } else {
      // 如果没选文档，也可以在这里做全局检索（目前先不处理）
      saveSessionMessages(activeSessionId!, newMessages);
    }

  }, [input, selectedDocId, currentSessionId, messages, createNewSession, updateSessionName, saveSessionMessages]);

  return {
    messages,
    input,
    setInput,
    isAsking,
    handleSendMessage,
  };
}

