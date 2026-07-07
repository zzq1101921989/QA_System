import { Request, Response, NextFunction } from 'express';
import { AskService } from '../services/ask.service';
import { memoryService } from '../services/memory.service';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  private readonly askService: AskService;

  constructor() {
    this.askService = new AskService();
  }
  
  /**
   * 获取所有会话列表
   */
  public async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await memoryService.getAllSessions();
      res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  }

  public async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = uuidv4();

      const { title } = req.body;

      await memoryService.createSession(sessionId, title);
      res.status(200).json({ sessionId });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取指定会话的历史记录
   */
  public async getSessionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const history = await memoryService.getHistory(sessionId as string);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 清除会话
   */
  public async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      await memoryService.clearSession(sessionId as string);
      res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 处理 RAG 检索问答
   */
  public async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { question, sessionId } = req.body;

      // 调用 RAG 检索问答服务
      const response = await this.askService.ask(
        documentId as string, 
        question as string, 
        sessionId as string
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
