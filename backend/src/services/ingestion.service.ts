import { Document } from '@langchain/core/documents';
import type { ParserResult } from './parser.service';
import { vectorRepository } from '../repositories/vector.repository';
import { documentRepository } from '../repositories/document.repository';

export class IngestionService {
  /**
   * Step 1: Load - 将解析后的 Markdown 字符串包装为 LangChain Document 对象
   */
  public async loadDocument(parseResult: ParserResult, documentId: string): Promise<Document> {
    return new Document({
      pageContent: parseResult.markdown,
      metadata: {
        content_type: parseResult.content_type,
        documentId,
        ...parseResult.metadata,
      },
    });
  }

  public async uploadDocument(parseResult: ParserResult & { documentId: string, chunkCount: number }) {
    return await documentRepository.create({
      documentId: parseResult.documentId,
      name: parseResult.metadata.source,
      status: 'ready',
      chunkCount: parseResult.chunkCount || 0,
      pageCount: parseResult.metadata.page_count || 0,
      elements: JSON.stringify(parseResult.elements),
    });
  }

  /**
   * Step 3&4: Embedding + Chroma 存储
   * 将分块后的 Document[] 向量化并存入向量数据库
   * 注意：阿里云 DashScope API (v4) 限制单次 Batch 大小为 10，这里使用 6 以保稳
   * @returns 实际入库的块数
   */
  public async embedAndStore(chunks: Document[], documentId: string): Promise<number> {
    const batchSize = 6; 
    
    // 为每个 chunk 注入 documentId 元数据
    const tagged = chunks.map((chunk) => {
      const meta = { ...chunk.metadata, documentId };
      return new Document({ pageContent: chunk.pageContent, metadata: meta });
    });

    // 分批次入库
    for (let i = 0; i < tagged.length; i += batchSize) {
      const batch = tagged.slice(i, i + batchSize);
      await vectorRepository.saveDocuments(batch);
    }

    return tagged.length;
  }

  /**
   * 获取所有已上传的文档列表 (从数据库获取)
   */
  public async getUploadedDocuments(): Promise<any[]> {
    const docs = await documentRepository.findAll();
    return docs.map(doc => ({
      id: doc.documentId, // 保持向后兼容，前端使用 documentId 作为标识
      name: doc.name || "未知文档",
      status: doc.status,
      createdAt: doc.createdAt,
      chunkCount: doc.chunkCount
    }));
  }

  /**
   * 删除指定 documentId 的所有分块及数据库记录
   */
  public async deleteDocument(documentId: string): Promise<void> {
    // 1. 删除向量库分块
    await vectorRepository.deleteDocumentsByFilter({ documentId });
    // 2. 删除数据库记录
    await documentRepository.deleteByDocumentId(documentId);
  }
}
