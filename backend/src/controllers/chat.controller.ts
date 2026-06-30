import { Request, Response, NextFunction } from 'express';
import { AskService } from '../services/ask.service';

export class ChatController {
  private readonly askService: AskService;

  constructor() {
    this.askService = new AskService();
  }
  
  /**
   * 处理 RAG 检索问答
   */
  public async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { question } = req.body;

      // 检索文档是否存在
      // const doc = await documentService.get(documentId as string);
      // if (!doc) {
      //   res.status(404).json({
      //     success: false,
      //     message: 'Document not found'
      //   });
      //   return
      // }

      // 调用 RAG 检索问答服务
      const response = await this.askService.ask(documentId as string, question as string);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
