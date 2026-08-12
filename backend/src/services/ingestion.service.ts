import { Document } from '@langchain/core/documents';
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { ParserResult } from './parser.service';
import { vectorRepository } from '../repositories/vector.repository';
import { documentRepository } from '../repositories/document.repository';
import { llm } from '../core/llm.client';

export class IngestionService {
  /**
   * Step 1: Load - 将解析后的 Markdown 字符串包装为 LangChain Document 对象
   */
  public async packingDocument(parseResult: ParserResult, documentId: string): Promise<Document> {
    return new Document({
      pageContent: parseResult.markdown,
      metadata: {
        content_type: parseResult.content_type,
        documentId,
        ...parseResult.metadata,
      },
    });
  }

  /**
   * 编排整个文档摄入流程：分阶段切分 -> 向量化入库 -> 生成关系型记录
   */
  public async processDocument(parseResult: ParserResult, filePath?: string, mimeType?: string) {
    const documentId = Math.random().toString(36).substring(2, 11);
    const doc = await this.packingDocument(parseResult, documentId);

    // 第一阶段：基于 Markdown 标题结构的粗粒度语义切分 (章节)
    const markdownSplitter = new MarkdownTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 200,
    });
    const chapterChunks = await markdownSplitter.splitDocuments([doc]);

    // 第二阶段：细粒度的字符切块，用于向量检索
    const recursiveSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    let totalChunkCount = 0;

    // 顺序处理每个章节，保证物理顺序并避免并发写入带来的乱序风险
    for (const chapterChunk of chapterChunks) {
      const vectorChunks = await recursiveSplitter.splitDocuments([chapterChunk]);
      
      // 解析 Markdown 标题（从 chunk 自身提取最接近的标题结构）
      // MarkdownTextSplitter 切分出来的 chunk，其头部通常保留了 `#` 格式的标题
      const headingMatch = chapterChunk.pageContent.match(/^(#+)\s+(.+)$/m);
      const chapterTitle = headingMatch ? headingMatch[2].trim() : "无标题章节";

      // 将外层章节信息透传到最终的块元数据中，便于检索时感知上下文
      const taggedChunks = vectorChunks.map(vc => {
        vc.metadata = {
          ...vc.metadata,
          documentId: documentId, // 书（文档）的 ID
          chapter_title: chapterTitle, // 父章节的标题名称
          source_file: parseResult.metadata.source || "未知文件", // 原始文件名
        };
        return vc;
      });

      const storedCount = await this.embedAndStore(taggedChunks, documentId);
      totalChunkCount += storedCount;
    }

    // 生成并保存关系型数据库的 Document 记录
    const uploadedDoc = await this.uploadDocument({
      ...parseResult,
      documentId,
      chunkCount: totalChunkCount,
      filePath,
      mimeType
    });

    return uploadedDoc;
  }

  /**
   * 从解析结果中提取摘要、关键词和大纲
   * @param parseResult 
   * @returns 
   */
  public async generateSummaryKeywordsOutline(parseResult: ParserResult) {
    const promtp = `
      ## 角色定义：
      你是一个专业的文档分析助手，擅长从复杂的文档中提取核心摘要、关键词并构建层级清晰的大纲。

      ## 任务目标：
      请根据提供的文档内容（Markdown格式），生成摘要、关键词和结构化大纲。

      ## 文档内容：
      ${parseResult.markdown}

      ## 核心要求：
      1. **摘要 (summary)**: 简洁明了，概括文档主旨，不超过 100 字符。
      2. **关键词 (keywords)**: 提取 3-5 个核心关键词，用逗号分隔。
      3. **大纲 (outline)**:
         - **深度层级**: 必须体现文档的逻辑层级，如：
          - 单元 -> 课文 -> 节
          - # - ## - ### 等 Markdown 标题
         - **原子化标题**: 每个大纲节点（label.title）必须是**单一**的标题。
         - **严禁堆砌**: 如果文档中出现类似 "25 少年闰土、26 好的故事" 的列表，**必须**将其拆分为多个独立的子节点，严禁合并在一个 title 中。
         - **结构严谨**: 大纲必须真实反映文档内容，不能凭空臆造。

      ## 输出格式（严格 JSON）：
      {
        "summary": "...",
        "keywords": "...",
        "outline": [
          {
            "label": { "title": "一级标题" },
            "children": [
              {
                "label": { "title": "二级标题1" }
              },
              {
                "label": { "title": "二级标题2" }
              }
            ]
          }
        ]
      }
      
      请直接输出 JSON 内容，不要包含任何 Markdown 代码块标记。
    `;

    const answer = await llm.invoke(promtp);

    // 提取 JSON 内容，处理可能存在的 Markdown 代码块
    const content = (answer.content as string).replace(/```json|```/g, '').trim();
    
    try {
      const { summary, keywords, outline } = JSON.parse(content);

      return {
        summary: summary || '',
        keywords: keywords || '',
        outline: Array.isArray(outline) ? outline : [],
      };
    } catch (error) {
      console.error('[IngestionService] Outline Parse Error:', error);
      return {
        summary: '',
        keywords: '',
        outline: [],
      };
    }
  }

  public async uploadDocument(parseResult: ParserResult & { documentId: string, chunkCount: number, filePath?: string, mimeType?: string }) {
    const { summary, keywords, outline } = await this.generateSummaryKeywordsOutline(parseResult);

    return await documentRepository.create({
      summary,
      keywords,
      outline: JSON.stringify(outline),
      documentId: parseResult.documentId,
      name: parseResult.metadata.source,
      status: 'ready',
      chunkCount: parseResult.chunkCount || 0,
      pageCount: parseResult.metadata.page_count || 0,
      elements: JSON.stringify(parseResult.elements),
      filePath: parseResult.filePath,
      mimeType: parseResult.mimeType,
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

    // 分批次入库
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      await vectorRepository.saveDocuments(batch);
    }

    return chunks.length;
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
      chunkCount: doc.chunkCount,
      summary: doc.summary,
      keywords: doc.keywords,
      outline: doc.outline ? JSON.parse(doc.outline) : []
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
