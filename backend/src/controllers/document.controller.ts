import { Request, Response, NextFunction } from 'express';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { ParserService } from '../services/parser.service';
import { IngestionService } from '../services/ingestion.service';

export class DocumentController {
  private parserService: ParserService;
  private ingestionService: IngestionService;

  constructor() {
    this.parserService = new ParserService();
    this.ingestionService = new IngestionService();
  }

  /**
   * 处理 PDF/Word/Excel 文件上传与知识库摄入
   */
  public async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: '未检测到上传文件' });
        return;
      }

      console.log(`[DocumentController] 收到文件: ${file.originalname}, 开始解析...`);

      // Step 0: 调用 Python 解析微服务，获取 Markdown
      const parseResult = await this.parserService.parseDocument(file);

      // Step 1: Load - 将 Markdown 加载为 LangChain Document
      const documentId = Math.random().toString(36).substr(2, 9);
      const doc = await this.ingestionService.loadDocument(parseResult, documentId);
      console.log(`[DocumentController] 文档已加载: "${doc.metadata.source}", 长度: ${doc.pageContent.length} 字符`);

      // Step 2: 分块 (Chunking)
      const textSplitter = RecursiveCharacterTextSplitter.fromLanguage(
        'markdown',
        { chunkSize: 1000, chunkOverlap: 200 }
      );
      
      const chunks = await textSplitter.splitDocuments([doc]);
      console.log(`[DocumentController] 文档已分块: ${chunks.length} 个块`);

      // Step 3&4: Embedding + Chroma 存储
      const chunkCount = await this.ingestionService.embedAndStore(chunks, documentId);
      console.log(`[DocumentController] 文档已入库: ${chunkCount} 个向量块`);

      // 返回文档状态
      const newDoc = {
        id: documentId,
        name: file.originalname,
        status: 'ready',
        timestamp: new Date().toLocaleString('zh-CN'),
        chunkCount,
        metadata: {
          ...parseResult.metadata,
        },
      };

      res.status(200).json(newDoc);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取知识库中的文档列表
   */
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docs = await this.ingestionService.getUploadedDocuments();
      res.status(200).json(docs);
    } catch (error) {
      next(error);
    }
  }
}
