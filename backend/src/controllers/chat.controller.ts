import { Request, Response, NextFunction } from 'express';

export class ChatController {
  /**
   * 处理 RAG 检索问答
   */
  public async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 逻辑待实现
      res.status(200).json({ message: 'Chat ask endpoint' });
    } catch (error) {
      next(error);
    }
  }
}
