import fs from 'fs';
import path from 'path';
import { vectorRepository } from '../repositories/vector.repository';
import { llm } from '../core/llm.client';
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ChatMessage, memoryService } from './memory.service';

export const QueryIntent = {
  DOCUMENT_QUERY: 'DOCUMENT_QUERY', // 文档查询意图
  GENERAL: 'GENERAL', // 闲聊、通用知识、历史追问
}

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
    ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    ## 用户问题：
    ${question}

    ## 规则：
    只返回改写后的问题，不要任何解释
    
    改写后的问题:
    `
    const response = await llm.invoke(rewritePrompt);
    return (response.content as string).trim();
  }

  /**
   * 生成假设性回答 (HyDE - Hypothetical Document Embeddings)
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
    return (response.content as string).trim();
  }

  /**
   * 意图路由判断
   */
  public async routeQuery(question: string, history: ChatMessage[]): Promise<string> {
    const routerPrompt = `
      ## 角色：
      你是一个意图识别的专家，负责判断用户的问题是否需要从参考文档中检索具体信息。

      ## 意图分类：
      1. ${QueryIntent.DOCUMENT_QUERY}: 用户在询问有关文档的具体内容、事实、细节、总结或特定数据。
      2. ${QueryIntent.GENERAL}: 包括招呼语（你好）、关于对话历史的询问（你刚才说了什么）、通用的常识/编程问题、或者闲聊。

      ## 规则：
      1. 只返回分类名称（${QueryIntent.DOCUMENT_QUERY} 或 ${QueryIntent.GENERAL}），不要任何解释。
      2. 如果问题涉及到文档库中可能存在的知识，优先选择 ${QueryIntent.DOCUMENT_QUERY}。

      ## 用户问题：
      ${question}

      分类结果：`

    const response = await llm.invoke(routerPrompt);
    const intent = (response.content as string).trim();

    return intent.includes(QueryIntent.DOCUMENT_QUERY)
      ? QueryIntent.DOCUMENT_QUERY
      : QueryIntent.GENERAL;
  }

  /**
   * 处理 RAG 检索问答
   */
  private async handleRAGFlow(documentId: string, question: string, history: ChatMessage[]): Promise<{ message: string; sources: string[]; relevantDocs: any[]; rewrittenQuestion: string }> {
    const K = 5;

    // Step 1: 查询重写 (如果有历史)
    const rewrittenQuestion = history.length > 0 ? await this.rewriteQuestion(question, history) : question;

    // Step 2: 向量检索
    const relevantDocs = await vectorRepository.searchSimilarDocuments(rewrittenQuestion, {
      k: K,
      filter: { documentId }
    });
    
    if (relevantDocs.length === 0) {
      return {
        message: '知识库中未找到与问题相关的文档内容，请尝试其他问题。',
        sources: [],
        relevantDocs: [],
        rewrittenQuestion
      };
    }
    
    // Step 3: 构建 Context
    const context = relevantDocs
      .map((doc, i) => `【片段 ${i + 1}】\n${doc.pageContent}`)
      .join('\n\n---\n');

    const sourceSet = new Set<string>();
    relevantDocs.forEach((doc) => {
      if (doc.metadata?.source) sourceSet.add(String(doc.metadata.source));
    });

    // Step 4: 构建 Prompt 并调用 LLM 回答
    const messages: BaseMessage[] = [
      new SystemMessage(
        '你是一个严谨的知识库问答助手。请严格按照以下文档内容回答用户的问题。\n\n' +
        '规则：\n1. 只有在文档内容能直接支持答案时才给出完整的文档内容\n2. 文档内容不足时请说明"未找到相关信息"\n3. 不要编造\n4. 引用片段编号\n\n' +
        `以下是相关内容：\n\n${context}`
      )
    ];

    // 注入对话历史
    history.forEach(msg => {
      if (msg.role === 'user') messages.push(new HumanMessage(msg.content));
      else messages.push(new AIMessage(msg.content));
    });

    messages.push(new HumanMessage(question));

    const response = await llm.invoke(messages);
    
    return {
      message: response.content as string,
      sources: Array.from(sourceSet),
      relevantDocs,
      rewrittenQuestion
    };
  }

  /**
   * 处理通用问答/闲聊逻辑
   */
  private async handleGeneralFlow(question: string, history: ChatMessage[]): Promise<{ message: string; sources: string[] }> {
    const messages: BaseMessage[] = [
      new SystemMessage('你是一个友好且专业的 AI 助手。请根据上下文回答用户的问题，如果是闲聊则轻松回应，如果是通用知识问题则专业回答。')
    ];

    history.forEach(msg => {
      if (msg.role === 'user') messages.push(new HumanMessage(msg.content));
      else messages.push(new AIMessage(msg.content));
    });

    messages.push(new HumanMessage(question));

    const response = await llm.invoke(messages);

    return {
      message: response.content as string,
      sources: []
    };
  }

  /**
   * 处理 RAG 检索问答 (集成意图路由)
   */
  public async ask(documentId: string, question: string, sessionId?: string): Promise<{ message: string; sources: string[]; sessionId?: string }> {
    const activeSessionId = sessionId || `session_${Date.now()}`;
    const history = await memoryService.getHistory(activeSessionId);

    // 1. 意图路由
    const intent = await this.routeQuery(question, history);

    console.log('意图路由:', intent);
    
    let result: { message: string; sources: string[]; relevantDocs?: any[]; rewrittenQuestion?: string };

    if (intent === QueryIntent.DOCUMENT_QUERY) {
      // 执行 RAG 流程
      result = await this.handleRAGFlow(documentId, question, history);
      
      // 记录检索日志
      if (result.relevantDocs && result.relevantDocs.length > 0) {
        this.saveRetrievalLog(documentId, question, result.relevantDocs, {
          rewrittenQuestion: result.rewrittenQuestion || question,
          hypotheticalAnswer: result.rewrittenQuestion || question // 暂时用重写后的问题代替
        });
      }
    } else {
      // 执行通用问答流程
      result = await this.handleGeneralFlow(question, history);
    }

    // 2. 持久化用户提出的问题和助手的回答
    await memoryService.addMessage(activeSessionId, { role: 'user', content: question, readDocumentIds: documentId });
    await memoryService.addMessage(activeSessionId, { role: 'assistant', content: result.message, readDocumentIds: documentId });

    // 3. 更新会话标题（如果是第一条消息）
    const sessionName = await memoryService.getSessionName(activeSessionId);
    if (!sessionName) {
      await memoryService.updateSessionName(activeSessionId, question);
    }

    return {
      message: result.message,
      sources: result.sources,
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