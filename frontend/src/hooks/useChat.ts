import { useState, useCallback, useRef, useEffect } from 'react';
import type { Document, Message } from '../types/chat';
import { documentService } from '../services/documentService';

export function useChat() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressTimerRef = useRef<number | null>(null);

  // 初始化时从后端同步文档列表
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.list();
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };
    fetchDocuments();
  }, []);

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

  const handleFileUpload = useCallback(async (file: File) => {
    // 前端校验：限制 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('文件太大，请上传 50MB 以内的 PDF');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    const tempId = Math.random().toString(36).substr(2, 9);
    const placeholderDoc: Document = {
      id: tempId,
      name: file.name,
      status: 'processing',
      timestamp: new Date().toLocaleString('zh-CN'),
      chunkCount: 0
    };
    
    setDocuments(prev => [placeholderDoc, ...prev]);

    try {
      const newDoc = await documentService.upload(file, (percent) => {
        // 真实上传进度最高到 90%
        const realProgress = Math.min(90, percent);
        setUploadProgress(realProgress);

        // 如果上传完成（100%），开始模拟解析进度
        if (percent >= 100) {
          progressTimerRef.current = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 98) {
                if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                return 98;
              }
              return prev + 1;
            });
          }, 800); // 每 800ms 增加 1%
        }
      });
      
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setUploadProgress(100);
      
      // 用后端返回的真实数据替换占位符
      setDocuments(prev => prev.map(doc => doc.id === tempId ? newDoc : doc));
    } catch (error) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      // 上传失败，移除占位符或标记错误
      setDocuments(prev => prev.map(doc => 
        doc.id === tempId ? { ...doc, status: 'error' } : doc
      ));
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      // 延迟清除进度显示，让用户看到 100%
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

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
    uploadProgress,
    handleSendMessage,
    handleFileUpload,
    selectDocument,
  };
}
