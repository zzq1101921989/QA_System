import { Request, Response, NextFunction } from 'express';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { ParserService } from '../services/parser.service';
import { IngestionService } from '../services/ingestion.service';
import fs from 'node:fs';
import path from 'node:path';

function decodeFilename(file: Express.Multer.File): string {
  try {
    return Buffer.from(file.originalname, 'latin1').toString('utf8');
  } catch {
    return file.originalname;
  }
}

function getDebugDir() {
  return path.resolve(__dirname, '../../debug_parsed');
}

function getDebugFileName(originalname: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${originalname}_${timestamp}.md`;
}

function writeDebugFile(filename: string, content: string) {
  const debugDir = getDebugDir();
  if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
  fs.writeFileSync(path.join(debugDir, getDebugFileName(filename)), content, 'utf-8');
}

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

      const filename = decodeFilename(file);
      console.log(`[DocumentController] 收到文件: ${filename}, 开始解析...`);

      // Step 0: 调用 Python 解析微服务，获取 Markdown
      const parseResult = await this.parserService.parseDocument({
        ...file,
        fileName: filename,
      });

      // 保存解析结果到 debug_parsed/ 目录，用于排查转换完整性
      writeDebugFile(filename, parseResult.markdown);
      writeDebugFile(filename + '_elements.json', JSON.stringify(parseResult.elements));

      // Step 1: Load - 将 Markdown 加载为 LangChain Document
      const documentId = Math.random().toString(36).substr(2, 9);
      const doc = await this.ingestionService.loadDocument(parseResult, documentId);

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

      // Step 5: 生成Document记录
      const uploadedDoc = await this.ingestionService.uploadDocument({...parseResult, documentId, chunkCount});

      res.status(200).json({
        id: uploadedDoc.documentId,
        name: uploadedDoc.name,
        status: uploadedDoc.status,
        createdAt: uploadedDoc.createdAt,
        chunkCount: uploadedDoc.chunkCount
      });
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

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentId = req.params.documentId;
      await this.ingestionService.deleteDocument(documentId as string);
      res.status(200).json({ message: '文档已删除' });
    } catch (error) {
      next(error);
    }
  }
}
