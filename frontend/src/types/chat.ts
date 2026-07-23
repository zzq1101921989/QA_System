export interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  chunkCount?: number;
  summary?: string;
  keywords?: string;
  outline?: any[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export interface SessionMessage {
  sessionId: string;
  sessionName: string;
}
