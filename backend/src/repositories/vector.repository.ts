import { Document } from '@langchain/core/documents';
import { getChromaInstance } from '../core/chroma.client';

export interface VectorSearchOptions {
  k?: number;
  filter?: Record<string, any>;
}

export class VectorRepository {
  /**
   * 搜索相关文档片段 (RAG 核心检索)
   */
  public async searchSimilarDocuments(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<Document[]> {
    const { k = 5, filter } = options;
    const chroma = await getChromaInstance();
    
    // 执行相似度搜索
    return chroma.similaritySearch(query, k, filter);
  }

  /**
   * 批量保存文档片段到向量库
   */
  public async saveDocuments(documents: Document[]): Promise<void> {
    const chroma = await getChromaInstance();
    await chroma.addDocuments(documents);
  }

  /**
   * 获取集合中的所有文档元数据 (用于聚合列表)
   */
  public async getAllMetadatas() {
    const chroma = await getChromaInstance();
    const collection = await chroma.collection;
    if (!collection) return { metadatas: [] };

    return collection.get({
      include: ["metadatas"] as any
    });
  }

  /**
   * 根据条件删除向量库中的文档
   */
  public async deleteDocumentsByFilter(filter: Record<string, any>): Promise<void> {
    const chroma = await getChromaInstance();
    const collection = await chroma.collection;
    if (collection) {
      await collection.delete({
        where: filter as any,
      });
    }
  }
}

export const vectorRepository = new VectorRepository();
