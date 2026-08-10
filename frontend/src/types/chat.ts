export interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  chunkCount?: number;
  summary?: string;
  keywords?: string;
  outline?: any[];
  filePath?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  readDocumentIds?: string;
}

export interface SessionMessage {
  sessionId: string;
  sessionName: string;
  documentId?: string;
}
