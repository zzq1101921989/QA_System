import request from '../api/request';
import type { SessionMessage, Message } from '../types/chat';

interface BackendChatMessage {
  role: string;
  content: string;
}

function mapMessage(msg: BackendChatMessage, index: number): Message {
  return { id: `${msg.role}-${index}`, role: msg.role as 'user' | 'assistant', content: msg.content };
}

export const sessionService = {
  async createSession(title?: string, documentId?: string | null): Promise<SessionMessage> {
    const data = await request.post<any, { sessionId: string }>('/sessions/create', { title, documentId });
    return { sessionId: data.sessionId, sessionName: title ?? '新会话', documentId: documentId || undefined };
  },

  async getSessions(documentId?: string | null): Promise<SessionMessage[]> {
    const url = documentId ? `/sessions?documentId=${documentId}` : '/sessions';
    const data = await request.get<any, SessionMessage[]>(url);
    return data;
  },

  async getSessionHistory(sessionId: string): Promise<Message[]> {
    const data = await request.get<any, BackendChatMessage[]>(`/sessions/${sessionId}/history`);
    return data.map(mapMessage);
  },

  async deleteSession(sessionId: string): Promise<void> {
    await request.delete(`/sessions/${sessionId}`);
  },

  async updateSessionName(sessionId: string, name: string): Promise<void> {
    await request.put(`/sessions/${sessionId}/name`, { name });
  },

  async updateSessionDocument(sessionId: string, documentId: string | null): Promise<void> {
    await request.put(`/sessions/${sessionId}/document`, { documentId });
  },
};
