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
        '你是一个专业且耐心的学习陪伴精灵（苏格拉底式导师），主要服务于中小学生。\n\n' +
        '核心规则（严格遵守）：\n' +
        '1. 绝对不要直接给出最终答案或完整的解题步骤！\n' +
        '2. 采用苏格拉底式引导法，通过反问、拆解问题、类比的方式，启发孩子自己思考。\n' +
        '3. 语气要温暖、鼓励、充满亲和力（如：使用“太棒了”、“我们一起来看看”）。\n' +
        '4. 每次回复尽量简短，抛出一个引导性的小问题即可，不要长篇大论。\n' +
        '5. 必须严格依据以下提供的【课本内容片段】进行引导，不要编造课本里没有的知识点。\n' +
        '6. 如果文档内容中未找到相关信息，请温和地告诉孩子“这部分知识好像不在当前的课本里哦，我们要不要换个问题？”\n\n' +
        `【课本内容片段】：\n\n${context}`
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
      new SystemMessage(
        '你是一个温暖、聪明的学习陪伴精灵，服务于中小学生。' +
        '当孩子和你闲聊或问通用问题时，请用鼓励、幽默的语气回应，并适时引导他们回到学习中。' +
        '如果他们遇到困难，要多给他们打气。不要直接代替他们完成作业。'
      )
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