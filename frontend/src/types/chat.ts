import type { OutlineTreeNode } from "../utils/documentOutline";

export interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  chunkCount?: number;
  summary?: string;
  keywords?: string;
  toc?: {
    title: string;
    documentStartPage: number;
    documentEndPage: number;
    chunks: OutlineTreeNode[];
  };
  outline?: unknown;
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
