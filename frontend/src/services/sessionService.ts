import request from '../api/request';
import type { SessionMessage, Message } from '../types/chat';

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

export const sessionService = {
  async createSession(title?: string): Promise<SessionMessage> {
    const data = await request.post<any, { sessionId: string }>('/sessions/create', { title });
    return { sessionId: data.sessionId, sessionName: title ?? '新会话' };
  },

  async getSessions(): Promise<SessionMessage[]> {
    const data = await request.get<any, BackendSession[]>('/sessions');
    return data.map(mapSession);
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
};
