import request from '../api/request';
import type { Document } from '../types/chat';

export const documentService = {
  /**
   * 上传 PDF 文档
   */
  async upload(file: File, onProgress?: (percent: number) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    return request.post<any, Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  /**
   * 获取所有已上传文档
   */
  async list(): Promise<Document[]> {
    return request.get<any, Document[]>('/documents');
  },

  async delete(documentId: string): Promise<void> {
    await request.delete(`/documents/${documentId}`);
  },

  /**
   * 向文档提问
   */
  async ask(documentId: string, question: string, sessionId?: string): Promise<{ message: string; sources: string[]; sessionId: string }> {
    return request.post<any, { message: string; sources: string[]; sessionId: string }>(`/documents/${documentId}/ask`, { question, sessionId });
  },

};
