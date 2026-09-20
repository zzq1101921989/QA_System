export interface CreateDocumentDto {
  documentId: string;
  name: string;
  status: string;
  chunkCount: number;
  pageCount: number;
  elements: string;
  filePath?: string;
  mimeType?: string;
  summary?: string;
  keywords?: string;
  outline?: string;
  toc?: string;
}

export interface UpdateDocumentDto {
  name?: string | null;
  status?: string;
  chunkCount?: number;
  pageCount?: number;
  elements?: string | null;
  filePath?: string | null;
  mimeType?: string | null;
  summary?: string | null;
  keywords?: string | null;
  outline?: string | null;
  toc?: string | null;
}
