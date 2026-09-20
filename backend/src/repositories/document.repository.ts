import prisma from '../core/prisma.client';
import type { CreateDocumentDto, UpdateDocumentDto } from './dtos/document.dto';

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
        filePath: data.filePath,
        mimeType: data.mimeType,
        summary: data.summary,
        keywords: data.keywords,
        outline: data.outline,
        toc: data.toc,
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

  public async updateByDocumentId(documentId: string, data: UpdateDocumentDto) {
    const { pageCount, ...rest } = data;

    await prisma.document.updateMany({
      where: { documentId },
      data: {
        ...rest,
        ...(pageCount === undefined ? {} : { page_count: pageCount }),
      },
    });

    return await this.findByDocumentId(documentId);
  }
}

export const documentRepository = new DocumentRepository();
