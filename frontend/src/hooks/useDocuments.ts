import { useState, useCallback, useRef, useEffect } from 'react';
import type { Document } from '../types/chat';
import { documentService } from '../services/documentService';

export function useDocuments(initialSelectedDocId: string | null) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialSelectedDocId);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressTimerRef = useRef<number | null>(null);
  const statusPollTimerRef = useRef<number | null>(null);
  const pollAttemptsRef = useRef(0);

  const startStatusPolling = useCallback(() => {
    if (statusPollTimerRef.current) return;
    pollAttemptsRef.current = 0;

    statusPollTimerRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      try {
        const docs = await documentService.list();
        setDocuments(docs);

        const hasProcessing = docs.some(d => d.status === 'processing');
        if (!hasProcessing || pollAttemptsRef.current >= 180) {
          if (statusPollTimerRef.current) clearInterval(statusPollTimerRef.current);
          statusPollTimerRef.current = null;
        }
      } catch (error) {
        if (pollAttemptsRef.current >= 10) {
          if (statusPollTimerRef.current) clearInterval(statusPollTimerRef.current);
          statusPollTimerRef.current = null;
        }
        console.error('Failed to poll documents:', error);
      }
    }, 2000);
  }, []);

  const stopStatusPolling = useCallback(() => {
    if (!statusPollTimerRef.current) return;
    clearInterval(statusPollTimerRef.current);
    statusPollTimerRef.current = null;
  }, []);

  useEffect(() => {
    if (initialSelectedDocId !== selectedDocId) {
      setSelectedDocId(initialSelectedDocId);
    }
  }, [initialSelectedDocId, selectedDocId]);

  // 初始化时从后端同步文档列表
  useEffect(() => {
    let cancelled = false;

    const fetchDocuments = async () => {
      try {
        const docs = await documentService.list();
        if (cancelled) return;
        setDocuments(docs);
        if (docs.some(d => d.status === 'processing')) startStatusPolling();
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };

    void fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, [startStatusPolling]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      stopStatusPolling();
    };
  }, [stopStatusPolling]);

  /**
   * 处理文件上传并解析为文档
   */
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
      createdAt: new Date().toISOString(),
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
      startStatusPolling();
    } catch (error) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      stopStatusPolling();
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

  /**
   * 选择文档进行问答
   */
  const selectDocument = useCallback((id: string | null, force: boolean = false) => {
    setSelectedDocId(prev => force ? id : (prev === id ? null : id));
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await documentService.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  }, []);

  return {
    documents,
    selectedDocId,
    isUploading,
    uploadProgress,
    handleFileUpload,
    selectDocument,
    deleteDocument,
  };
}
