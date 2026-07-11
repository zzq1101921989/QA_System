import { Document } from '@langchain/core/documents';
import type { ParserResult } from './parser.service';
import { getChromaInstance } from '../core/chroma.client';

export class IngestionService {
  /**
   * Step 1: Load - 将解析后的 Markdown 字符串包装为 LangChain Document 对象
   */
  public async loadDocument(parseResult: ParserResult, documentId: string): Promise<Document> {
    return new Document({
      pageContent: parseResult.markdown,
      metadata: {
        source: parseResult.filename,
        content_type: parseResult.content_type,
        documentId,
        ...parseResult.metadata,
      },
    });
  }

  /**
   * Step 3&4: Embedding + Chroma 存储
   * 将分块后的 Document[] 向量化并存入向量数据库
   * 注意：阿里云 DashScope API (v4) 限制单次 Batch 大小为 10，这里使用 6 以保稳
   * @returns 实际入库的块数
   */
  public async embedAndStore(chunks: Document[], documentId: string): Promise<number> {
    const chroma = await getChromaInstance();
    const batchSize = 6; // 进一步降低 batchSize 以适配 v4 模型限制
    
    // 为每个 chunk 注入 documentId 元数据
    const tagged = chunks.map((chunk) => {
      const meta = { ...chunk.metadata, documentId };
      return new Document({ pageContent: chunk.pageContent, metadata: meta });
    });

    // 分批次入库（会调用 DashScope API 进行向量化，每个批次 6 个块）
    for (let i = 0; i < tagged.length; i += batchSize) {
      const batch = tagged.slice(i, i + batchSize);
      console.log(`[IngestionService] 正在处理第 ${Math.floor(i / batchSize) + 1} 批数据 (${batch.length} 个块)...`);
      await chroma.addDocuments(batch);
    }

    return tagged.length;
  }

  /**
   * 获取所有已上传的文档列表
   * 使用单例 getChromaInstance 确保初始化完成
   */
  public async getUploadedDocuments(): Promise<any[]> {
    try {
      const chroma = await getChromaInstance();
      const collection = await chroma.collection;

      if (!collection) return [];

      // 获取所有分块的元数据
      const response = await collection.get({
        include: ["metadatas"] as any
      });

      if (!response.metadatas || response.metadatas.length === 0) return [];

      // 按 documentId 进行聚合去重
      const docMap = new Map<string, any>();
      
      response.metadatas.forEach((meta: any) => {
        if (meta && meta.documentId && !docMap.has(meta.documentId)) {
          docMap.set(meta.documentId, {
            id: meta.documentId,
            name: meta.source || "未知文档",
            status: "ready",
            timestamp: meta.timestamp || "未知时间",
            chunkCount: 0 
          });
        }
        
        if (meta && meta.documentId) {
          const doc = docMap.get(meta.documentId);
          doc.chunkCount += 1;
        }
      });

      return Array.from(docMap.values());
    } catch (error: any) {
      if (error.message?.includes("does not exist")) return [];
      console.error(`[IngestionService] 获取文档列表失败:`, error.message);
      throw error;
    }
  }

  /**
   * 删除指定 documentId 的所有分块
   */
  public async deleteDocument(documentId: string): Promise<void> {
    const chroma = await getChromaInstance();
    const collection = await chroma.collection;
    await collection?.delete({
      where: { documentId },
    })
  }
}
