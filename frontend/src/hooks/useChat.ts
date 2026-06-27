import { useState, useCallback } from 'react';
import type { Document, Message } from '../types/chat';

export function useChat() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: '2024年度财务报告.pdf', status: 'ready', timestamp: '2024-06-20 14:20', chunkCount: 124 },
    { id: '2', name: '产品规格说明书_V2.pdf', status: 'processing', timestamp: '2024-06-21 09:15' },
  ]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '系统已初始化。准备就绪，请上传文档或直接开始提问。' }
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Mock AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '正在检索知识库... 这是来自 RAG 引擎的模拟回答。',
        sources: selectedDocId ? [documents.find(d => d.id === selectedDocId)?.name || ''] : []
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  }, [input, selectedDocId, documents]);

  const handleFileUpload = useCallback((file: File) => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        status: 'ready',
        timestamp: new Date().toLocaleString('zh-CN'),
        chunkCount: Math.floor(Math.random() * 200) + 50
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
    }, 2000);
  }, [documents.length]);

  const selectDocument = useCallback((id: string) => {
    setSelectedDocId(prev => (prev === id ? null : id));
  }, []);

  return {
    documents,
    selectedDocId,
    messages,
    input,
    setInput,
    isUploading,
    handleSendMessage,
    handleFileUpload,
    selectDocument,
  };
}
