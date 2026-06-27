export interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  timestamp: string;
  chunkCount?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}
