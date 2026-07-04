

import fs from 'fs';
import path from 'path';
import { getChromaInstance } from '../core/chroma.client';
import { llm } from '../core/llm.client';
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ChatMessage, memoryService } from './memory.service';

export class AskService {

  /**
   * 重写用户问题，生成更符合用户需求的问题和容易被向量检索的问题格式
   * @param question 用户问题
   * @param history 上下文历史记录
   * @returns 重写后的问题
   */
  public async rewriteQuestion(question: string, history: ChatMessage[]): Promise<string> {

    console.log('进行了查询重写');

    const rewritePrompt = `
    ## 角色：
    你是一个专业的问答助手，负责根据用户的问题和上下文，生成更符合用户需求的问题和容易被向量检索的问题格式。
    请根据以下上下文和用户问题，生成一个更符合用户需求的问题：

    ## 上下文历史：
    ${history.map(msg => msg.content).join('\n')}

    ## 用户问题：
    ${question}

    ## 规则：
    只返回一些的问题，不要任何解释
    
    改写后的问题:
    `
    const rewrittenQuestion = await llm.invoke(rewritePrompt);
    return rewrittenQuestion.content as string;
  }

  /**
   * 处理 RAG 检索问答
   * @param documentId 文档 ID
   * @param question 用户问题
   * @param sessionId 会话 ID，用于保持上下文记忆
   * 
   * 完整流程：
   *   1. 向量检索 — 从 Chroma 中找出与问题最相关的 K 个分块
   *   2. 构建 Context — 将检索结果拼接为 Prompt 上下文
   *   3. LLM 生成 — 调用大模型参考上下文回答问题
   */
  public async ask(documentId: string, question: string, sessionId?: string): Promise<{ message: string; sources: string[]; sessionId?: string }> {
    // ── Step 1: 向量检索 ──────────────────────────────────
    const chroma = await getChromaInstance();
    const K = 5; // 召回 TOP-5 最相关分块

    // 如果提供了 sessionId，则加载历史记录
    const activeSessionId = sessionId || `session_${Date.now()}`;
    const history = memoryService.getHistory(activeSessionId);

    // 重写问题（如果有历史）
    const finalQuestion = history.length > 0 ? await this.rewriteQuestion(question, history) : question;

    const relevantDocs = await chroma.similaritySearch(finalQuestion, K, { documentId });

    // 检查是否找到相关文档
    if (relevantDocs.length === 0) {
      return {
        message: '知识库中未找到与问题相关的文档内容，请尝试其他问题或确认文档已正确入库。',
        sources: [],
      };
    }

    // ── Step 2: 构建 Prompt Context ────────────────────────
    const context = relevantDocs
      .map((doc, i) => `【片段 ${i + 1}】\n${doc.pageContent}`)
      .join('\n\n---\n\n');

    // 去重提取来源文件名
    const sourceSet = new Set<string>();
    relevantDocs.forEach((doc) => {
      if (doc.metadata?.source) sourceSet.add(String(doc.metadata.source));
    });
    const sourceNames = Array.from(sourceSet);

    // ── Step 3: 构建消息序列（含历史记忆） ──────────────────────
    const messages: BaseMessage[] = [
      new SystemMessage(
        '你是一个严谨的知识库问答助手。请严格按照以下文档内容回答用户的问题。\n\n' +
        '规则：\n' +
        '1. 只有在文档内容能直接支持答案时才给出回答\n' +
        '2. 如果文档内容不足以回答问题，请如实说明"文档中未找到相关信息"\n' +
        '3. 不要编造或推断文档中没有的信息\n' +
        '4. 回答时引用具体片段编号（如"根据片段 1……"）\n\n' +
        `以下是文档中与用户问题相关的内容：\n\n${context}`
      )
    ];

    // 将历史记录转换为 LangChain 消息格式
    history.forEach(msg => {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else {
        messages.push(new AIMessage(msg.content));
      }
    });

    // 添加当前问题
    messages.push(new HumanMessage(question));

    // ── Step 4: LLM 生成 ───────────────────────────────────
    const response = await llm.invoke(messages);
    const answer = response.content as string;

    // 记录本次对话到记忆管理中
    memoryService.addMessage(activeSessionId, { role: 'user', content: question });
    memoryService.addMessage(activeSessionId, { role: 'assistant', content: answer });

    // 保存检索日志
    this.saveRetrievalLog(documentId, question, relevantDocs);

    return {
      message: answer,
      sources: sourceNames,
      sessionId: activeSessionId
    };
  }

  /**
   * 保存检索日志到 logs/ 目录，用于调试和审查检索质量
   */
  private saveRetrievalLog(documentId: string, question: string, docs: Array<{ pageContent: string; metadata?: Record<string, any> }>): void {
    try {
      const logDir = path.resolve(__dirname, '../../logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = path.join(logDir, `retrieval-${documentId}-${timestamp}.log`);

      const lines: string[] = [
        '='.repeat(60),
        `时间: ${new Date().toLocaleString('zh-CN')}`,
        `文档 ID: ${documentId}`,
        `问题: ${question}`,
        `召回数量: ${docs.length}`,
        '-'.repeat(60),
      ];

      docs.forEach((doc, i) => {
        const source = doc.metadata?.source || '未知来源';
        lines.push(`\n【片段 ${i + 1}】来源: ${source}`);
        lines.push('-'.repeat(40));
        lines.push(doc.pageContent);
      });

      lines.push('', '='.repeat(60));

      fs.writeFileSync(logFile, lines.join('\n'), 'utf-8');
      console.log(`[AskService] 检索日志已保存: ${logFile}`);
    } catch (err: any) {
      console.error(`[AskService] 保存检索日志失败:`, err.message);
    }
  }
}