import { Request, Response, NextFunction } from 'express';
import { ParserService } from '../services/parser.service';
import fs from 'fs';
import path from 'path';

export class DocumentController {
  private parserService: ParserService;

  constructor() {
    this.parserService = new ParserService();
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

      // 调用 Python 解析微服务
      const parseResult = await this.parserService.parseDocument(file);

      // TODO: 这里后续可以接入 LangChain 进行分块 (Chunking) 并存入 ChromaDB


      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.originalname,
        status: 'ready',
        timestamp: new Date().toLocaleString('zh-CN'),
        chunkCount: 0, 
        metadata: {
          ...parseResult.metadata,
        }
      };

      res.status(200).json(newDoc);

    } catch (error) {
      next(error);
    }
  }
}
