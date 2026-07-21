import fs from 'fs';
import path from 'path';
import { vectorRepository } from '../repositories/vector.repository';
import { llm } from '../core/llm.client';
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ChatMessage, memoryService } from './memory.service';

export class AskService {

  /**
   * 重写用户问题，生成更符合用户需求的问题和容易被向量检索的问题格式
   */
  public async rewriteQuestion(question: string, history: ChatMessage[]): Promise<string> {
    const rewritePrompt = `
    ## 角色：
    你是一个专业的问答助手，负责根据用户的问题和上下文，生成更符合用户需求的问题和容易被向量检索的问题格式。
    请根据以下上下文和用户问题，生成一个更符合用户需求的问题：

    ## 上下文历史：
    ${history.map(msg => msg.content).join('\n')}

    ## 用户问题：
    ${question}

    ## 规则：
    只返回改写后的问题，不要任何解释
    
    改写后的问题:
    `
    const response = await llm.invoke(rewritePrompt);
    return response.content as string;
  }

  /**
   * 生成假设性回答 (HyDE - Hypothetical Document Embeddings)
   * 该技术通过生成一个“伪答案”来检索，往往比直接用“问题”检索效果更好
   */
  public async generateHypotheticalAnswer(question: string): Promise<string> {
    const hydePrompt = `
    ## 角色：
    你是一个专业的文档编写专家。请为下面的问题生成一个假设性的、符合事实的简短回答。
    这个回答将用于向量检索，请尽可能模拟真实文档中的陈述句式和专业表达。

    ## 问题：
    ${question}

    ## 规则：
    1. 只返回假设性的回答内容，不要任何解释或前缀。
    2. 使用陈述句，保持专业和中立。
    3. 尽量包含可能出现在文档中的专业术语。

    假设性回答:
    `
    const response = await llm.invoke(hydePrompt);
    return response.content as string;
  }

  /**
   * 处理 RAG 检索问答 (集成 HyDE)
   */
  public async ask(documentId: string, question: string, sessionId?: string): Promise<{ message: string; sources: string[]; sessionId?: string }> {
    const K = 5;
    const activeSessionId = sessionId || `session_${Date.now()}`;
    const history = await memoryService.getHistory(activeSessionId);

    // Step 1: 查询重写 (如果有历史)
    const rewrittenQuestion = history.length > 0 ? await this.rewriteQuestion(question, history) : question;

    // Step 2: HyDE 生成假设性回答 (如果有历史)
    // 否则直接使用重写后的问题
    // 这样可以避免在没有历史上下文时，生成的假设性回答与问题不相关
    // const hypotheticalAnswer = history.length > 0 ? await this.generateHypotheticalAnswer(rewrittenQuestion) : rewrittenQuestion;

    // Step 3: 向量检索 (使用 HyDE 假答案检索)
    const relevantDocs = await vectorRepository.searchSimilarDocuments(rewrittenQuestion, {
      k: K,
      filter: { documentId }
    });

    if (relevantDocs.length === 0) {
      return {
        message: '知识库中未找到与问题相关的文档内容，请尝试其他问题。',
        sources: [],
      };
    }

    // Step 4: 构建 Context
    const context = relevantDocs
      .map((doc, i) => `【片段 ${i + 1}】\n${doc.pageContent}`)
      .join('\n\n---\n');

    const sourceSet = new Set<string>();
    relevantDocs.forEach((doc) => {
      if (doc.metadata?.source) sourceSet.add(String(doc.metadata.source));
    });

    // Step 5: 构建 Prompt 并调用 LLM 回答
    const messages: BaseMessage[] = [
      new SystemMessage(
        '你是一个严谨的知识库问答助手。请严格按照以下文档内容回答用户的问题。\n\n' +
        '规则：\n1. 只有在文档内容能直接支持答案时才给出完整的文档内容\n2. 文档内容不足时请说明"未找到相关信息"\n3. 不要编造\n4. 引用片段编号\n\n' +
        `以下是相关内容：\n\n${context}`
      )
    ];

    history.forEach(msg => {
      if (msg.role === 'user') messages.push(new HumanMessage(msg.content));
      else messages.push(new AIMessage(msg.content));
    });

    messages.push(new HumanMessage(question));

    const response = await llm.invoke(messages);
    const answer = response.content as string;

    // Step 6: 持久化记忆
    await memoryService.addMessage(activeSessionId, { role: 'user', content: question });
    await memoryService.addMessage(activeSessionId, { role: 'assistant', content: answer });

    // Step 7: 检索日志记录 (包含 HyDE 信息)
    this.saveRetrievalLog(documentId, question, relevantDocs, {
      rewrittenQuestion,
      hypotheticalAnswer: rewrittenQuestion
    });

    const sessionName = await memoryService.getSessionName(activeSessionId);
    if (!sessionName) {
      await memoryService.updateSessionName(activeSessionId, question);
    }

    return {
      message: answer,
      sources: Array.from(sourceSet),
      sessionId: activeSessionId
    };
  }

  private saveRetrievalLog(
    documentId: string,
    question: string,
    docs: any[],
    debugInfo: { rewrittenQuestion: string, hypotheticalAnswer: string }
  ): void {
    try {
      const logDir = path.resolve(__dirname, '../../logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = path.join(logDir, `retrieval-${documentId}-${timestamp}.log`);

      const lines = [
        '='.repeat(60),
        `时间: ${new Date().toLocaleString()}`,
        `原始问题: ${question}`,
        `重写问题: ${debugInfo.rewrittenQuestion}`,
        `HyDE 假设答案: ${debugInfo.hypotheticalAnswer}`,
        `召回数量: ${docs.length}`,
        '-'.repeat(60),
      ];

      docs.forEach((doc, i) => {
        lines.push(`\n【片段 ${i + 1}】来源: ${doc.metadata?.source || '未知'}`);
        lines.push(doc.pageContent);
      });

      fs.writeFileSync(logFile, lines.join('\n'), 'utf-8');
    } catch (err) {
      // 统一拦截或忽略日志错误
    }
  }
}