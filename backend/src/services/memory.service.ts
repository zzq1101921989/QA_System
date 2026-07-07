import prisma from '../core/prisma.client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class MemoryService {
  private static instance: MemoryService;

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
  public async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // 限制获取最近的 20 条
        },
      },
    });

    if (!session) return [];

    return session.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * 创建会话
   */
  public async createSession(sessionId: string, title?: string | null): Promise<void> {
    await prisma.session.create({
      data: {
        id: sessionId,
        title: title || undefined,
      },
    });
  }

  /**
   * 添加消息到会话
   */
  public async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    // 确保会话存在
    await prisma.session.upsert({
      where: { id: sessionId },
      update: { updatedAt: new Date() },
      create: { 
        id: sessionId,
        title: message.role === 'user' ? message.content.substring(0, 50) : undefined 
      },
    });

    // 保存消息
    await prisma.message.create({
      data: {
        sessionId,
        role: message.role,
        content: message.content,
      },
    });
  }

  /**
   * 清除会话
   */
  public async clearSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // 忽略会话不存在的错误
    });
  }

  /**
   * 获取所有会话列表
   */
  public async getAllSessions() {
    return prisma.session.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export const memoryService = MemoryService.getInstance();
