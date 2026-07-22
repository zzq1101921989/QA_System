import prisma from '../core/prisma.client';

export interface CreateDocumentDto {
  documentId: string;
  name: string;
  status: string;
  chunkCount: number;
  pageCount: number;
  elements: string;
  summary?: string;
  keywords?: string;
  outline?: string;
}

export class DocumentRepository {
  public async create(data: CreateDocumentDto) {
    return await prisma.document.create({
      data: {
        documentId: data.documentId,
        name: data.name,
        status: data.status,
        chunkCount: data.chunkCount,
        page_count: data.pageCount,
        elements: data.elements,
        summary: data.summary,
        keywords: data.keywords,
        outline: data.outline,
      },
    });
  }

  public async findAll() {
    return await prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async findByDocumentId(documentId: string) {
    return await prisma.document.findFirst({
      where: { documentId },
    });
  }

  public async deleteByDocumentId(documentId: string) {
    return await prisma.document.deleteMany({
      where: { documentId },
    });
  }

  public async updateStatus(documentId: string, status: string) {
    return await prisma.document.updateMany({
      where: { documentId },
      data: { status },
    });
  }
}

export const documentRepository = new DocumentRepository();
