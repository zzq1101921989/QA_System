export interface DocumentMetadata {
  source: string;
  page: number;
  chunkId: string;
  documentId: string;
}

export interface ChunkDocument {
  pageContent: string;
  metadata: DocumentMetadata;
}

export interface IngestionRequestDTO {
  fileBuffer: Buffer;
  fileName: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface IngestionResponseDTO {
  success: boolean;
  documentId: string;
  totalChunks: number;
  message?: string;
}

export interface RagQueryDTO {
  query: string;
  sessionId?: string;
  topK?: number;
}

export interface RagQueryResponseDTO {
  answer: string;
  sourceDocuments: ChunkDocument[];
}