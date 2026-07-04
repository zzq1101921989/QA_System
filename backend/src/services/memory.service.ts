
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class MemoryService {
  private static instance: MemoryService;
  // 使用 Map 在内存中存储会话，Key 是 sessionId
  private sessions: Map<string, ChatMessage[]> = new Map();

  private constructor() {}

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  /**
   * 获取会话历史
   */
  public getHistory(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId) || [];
  }

  /**
   * 添加消息到会话
   */
  public addMessage(sessionId: string, message: ChatMessage): void {
    const history = this.getHistory(sessionId);
    history.push(message);
    
    // 限制历史长度，防止上下文过长（例如保留最近 10 轮对话）
    const MAX_HISTORY = 20;
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY);
    }
    
    this.sessions.set(sessionId, history);
  }

  /**
   * 清除会话
   */
  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const memoryService = MemoryService.getInstance();
