

import fs from 'fs';
import path from 'path';
import { getChromaInstance } from '../core/chroma.client';
import { llm } from '../core/llm.client';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export class AskService {
  /**
   * 处理 RAG 检索问答
   * 
   * 完整流程：
   *   1. 向量检索 — 从 Chroma 中找出与问题最相关的 K 个分块
   *   2. 构建 Context — 将检索结果拼接为 Prompt 上下文
   *   3. LLM 生成 — 调用大模型参考上下文回答问题
   */
  public async ask(documentId: string, question: string): Promise<{ message: string; sources: string[] }> {
    // ── Step 1: 向量检索 ──────────────────────────────────
    const chroma = await getChromaInstance();
    const K = 5; // 召回 TOP-5 最相关分块

    const relevantDocs = await chroma.similaritySearch(question, K, { documentId });

    // 保存检索日志
    this.saveRetrievalLog(documentId, question, relevantDocs);

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

    // ── Step 3: LLM 生成 ───────────────────────────────────
    const response = await llm.invoke([
      new SystemMessage(
        '你是一个严谨的知识库问答助手。请严格按照以下文档内容回答用户的问题。\n\n' +
        '规则：\n' +
        '1. 只有在文档内容能直接支持答案时才给出回答\n' +
        '2. 如果文档内容不足以回答问题，请如实说明"文档中未找到相关信息"\n' +
        '3. 不要编造或推断文档中没有的信息\n' +
        '4. 回答时引用具体片段编号（如"根据片段 1……"）\n\n' +
        `以下是文档中与用户问题相关的内容：\n\n${context}`
      ),
      new HumanMessage(question),
    ]);

    return {
      message: response.content as string,
      sources: sourceNames,
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