import request from '../api/request';
import type { Document, SessionMessage, Message } from '../types/chat';

interface BackendSession {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendChatMessage {
  role: string;
  content: string;
}

function mapSession(s: BackendSession): SessionMessage {
  return { sessionId: s.id, sessionName: s.title ?? '新会话' };
}

function mapMessage(msg: BackendChatMessage, index: number): Message {
  return { id: `${msg.role}-${index}`, role: msg.role as 'user' | 'assistant', content: msg.content };
}

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

  /**
   * 向文档提问
   */
  async ask(documentId: string, question: string, sessionId?: string): Promise<{ message: string; sources: string[]; sessionId: string }> {
    return request.post<any, { message: string; sources: string[]; sessionId: string }>(`/documents/${documentId}/ask`, { question, sessionId });
  },

  // ── 会话管理 API ──────────────────────────────────────────

  /**
   * 创建会话（后端生成 UUID）
   */
  async createSession(title?: string): Promise<SessionMessage> {
    const data = await request.post<any, { sessionId: string }>('/sessions/create', { title });
    return { sessionId: data.sessionId, sessionName: title ?? '新会话' };
  },

  /**
   * 获取所有会话列表
   */
  async getSessions(): Promise<SessionMessage[]> {
    const data = await request.get<any, BackendSession[]>('/sessions');
    return data.map(mapSession);
  },

  /**
   * 获取会话历史消息
   */
  async getSessionHistory(sessionId: string): Promise<Message[]> {
    const data = await request.get<any, BackendChatMessage[]>(`/sessions/${sessionId}/history`);
    return data.map(mapMessage);
  },

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<void> {
    await request.delete(`/sessions/${sessionId}`);
  },
};
