import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import 'dotenv/config';
import { llm } from '../core/llm.client';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';




export interface DirectoryChunk {
  title: string;
  startPage: number;
  endPage: number;
  level: number;
  chunks: DirectoryChunk[];
}

export interface DirectoryRequest {
  title: string;
  documentStartPage: number;
  documentEndPage: number;
  chunks: DirectoryChunk[];
}

export interface ParserResult {
  filename: string;
  content_type: string;
  markdown: string;
  elements: any[];
  /**
   * 目录请求，用于生成目录
   */
  directoryRequests: DirectoryRequest[];
  metadata: {
    size: number;
    source: string;
    page_count: number;
  };
}

export interface NormalizedElementBase {
  id: number;
  type: string;
  pageNumber: number;
  boundingBox?: [number, number, number, number];
  content?: string;
};

export type NormalizedHeadingElement = NormalizedElementBase & {
  type: 'heading';
  headingLevel: number;
  content: string;
};

export type NormalizedElement = NormalizedHeadingElement | NormalizedElementBase;






export class ParserService {
  private readonly baseUrl: string;

  constructor() {
    // 默认指向 Python 解析微服务
    this.baseUrl = process.env.PYTHON_PARSER_URL || 'http://localhost:8200';
  }

  /**
 * 利用 LLM 清理文档内容，移除无效或不相关的信息
 * @param content - 待清理的 Markdown 内容
 * @param index - 当前处理的 Chunk 索引，用于错误日志
 * @returns 清理后的 Markdown 内容
 */
  public async cleanContentLLM(content: string, index: number): Promise<string> {
    const prompt = `
      ## 角色定义
      你是一个专业的文档编辑专家，擅长将杂乱的 Markdown 结果重构成干净、结构清晰的 Markdown 文档

      ## 任务描述
      请对以下 Markdown 片段进行“降噪”和“结构标准化”。
      ---
      ${content}
      ---

      ## 处理要求
      1. **去除噪音**: 彻底删除解析产生的页码（如 "Page 1", "- 1 -"）、重复的页眉页脚、OCR 乱码、以及无关的元数据。
      2. **纠正标题**: 确保标题层级 (h1-h6) 逻辑严密。如果发现解析出来的标题等级错乱，请根据内容逻辑进行修正。
      3. **保留原文**: 严禁大幅删减实质性内容，只需去除格式噪音和重复信息。
      4. **修复格式**: 修正断行错误，合并因分页被切断的段落，优化表格显示。
      5. **纯净输出**: 直接返回优化后的 Markdown 内容，不要包含任何解释性文字或 Markdown 代码块标记。

      请开始优化：
    `

    try {
      const response = await llm.invoke(prompt);
      const refined = response.content as string;
      // 去除可能存在的包裹符
      return refined.replace(/^```markdown|```$/g, '').trim();
    } catch (error) {
      console.error(`[MarkdownRefiner] Chunk ${index} 处理失败:`, error);
      return content; // 失败时返回原文，保证流程不中断
    }
  }

  /**
   * 将长文档拆分后并行调用 LLM 进行分段清洗
   * @param rawMarkdown - 待清理的 Markdown 内容
   * @returns 清理后的 Markdown 内容
   */
  public async refineMarkdownChunked(rawMarkdown: string): Promise<string> {
    if (!rawMarkdown || rawMarkdown.trim().length < 100) {
      return rawMarkdown;
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 8000,
      chunkOverlap: 500,
    });

    const chunks = await splitter.splitText(rawMarkdown);
    console.log(`[ParserService] 正在进行分段优化，总计 ${chunks.length} 个分段...`);

    // 并行处理所有分段
    const refinedChunks = await Promise.all(
      chunks.map((chunk, index) => this.cleanContentLLM(chunk, index))
    );

    console.log(`[ParserService] 分段优化完成，共 ${refinedChunks.length} 个分段`);

    // 合并清理后的分段
    return refinedChunks.join('\n\n');
  }

  /**
   * 通过AI,把 python解析出来的json数据,转换为 DirectoryRequest 格式，方便后续进行章节展示
   * @param json - python解析出来的json数据
   * @returns DirectoryRequest 格式的章节数据
   */
  public async parseDirectoriesAndCorrespondingPaging(json: NormalizedElement[]): Promise<DirectoryRequest[]> {
    // 过滤掉 image 元素
    const orderedWithoutImages = json.filter((e) => e.type !== 'image');
    const promptBody = JSON.stringify(orderedWithoutImages, null, 2);

    const prompt = `
      你是一个“课本目录/文章页面范围”提取器。
      目标：基于输入的页面元素（含 heading/paragraph 等）识别目录树，并为每个节点输出连续的页码区间（闭区间）。

      输入数据（JSON 数组）：
      ${promptBody}

      规则（必须遵守）：
      1) 仅允许从输入数据中提取信息，不得补写不存在的标题、单元、文章。
      2) 目录节点标题必须来自 type === "heading" 的 content（去掉首尾空格）。
      3) 每个节点 startPage/endPage 必须为整数且满足 startPage <= endPage，且区间必须连续。
      4) 页码只能使用输入数据中出现过的 pageNumber 范围：不得超出最小/最大页。
      5) 同一页可能存在多个 heading：按输入数组顺序作为出现顺序。
      6) 节点层级依据 headingLevel：level 越小越靠上；相同 level 为同级；更大 level 为子级。
      7) endPage 的确定：优先使用“下一个同级或更高层级 heading 的起始页 - 1”；如果下一个标题与当前标题在同一页，则 endPage 至少为 startPage；最后一个节点的 endPage 为最大页。
      8) 如果无法可靠判断层级/范围，宁可减少节点：可输出更扁平的结构，但不得编造。

      输出要求（严格）：
      - 只输出一个可被 JSON.parse() 解析的 JSON 对象
      - 不要输出 Markdown，不要输出解释文字，不要使用代码块标记
      - 不需要有无用的回车或空行或者换行等符号

      输出 JSON Schema（示例结构，不是示例值）：
      {
        "title": string,
        "documentStartPage": number,
        "documentEndPage": number,
        "chunks": [
          {
            "title": string,
            "startPage": number,
            "endPage": number,
            "level": number,
            "chunks": []
          }
        ]
      }
    `
    const response = await llm.invoke(prompt);

    return JSON.parse(response.content as string) as DirectoryRequest[];
  }

  /**
   * 根据文件类型调用 Python 解析服务
   */
  public async parseDocument(file: Express.Multer.File & { fileName: string }): Promise<ParserResult> {
    const formData = new FormData();

    // 如果是磁盘存储，使用 createReadStream 提升性能, 避免内存不足，流式传输文件内容，边读边解析
    const fileStream = fs.createReadStream(file.path);
    formData.append('file', fileStream, {
      filename: file.fileName,
      contentType: file.mimetype,
    });

    let endpoint = '/parse/pdf';
    const mimetype = file.mimetype.toLowerCase();
    const filename = file.fileName.toLowerCase();

    if (mimetype === 'application/pdf') {
      endpoint = '/parse/pdf';
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword' ||
      filename.endsWith('.docx') || filename.endsWith('.doc')
    ) {
      endpoint = '/parse/word';
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel' ||
      filename.endsWith('.xlsx') || filename.endsWith('.xls')
    ) {
      endpoint = '/parse/excel';
    }

    try {
      // 调用 Python 解析服务
      const response = await axios.post<ParserResult>(`${this.baseUrl}${endpoint}`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 600000, // 增加到 10 分钟以支持极大文件解析
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // 对解析结果进行分段优化，调整到一个比较满意的状态
      const cleanedMarkdown = await this.refineMarkdownChunked(response.data.markdown);

      const normalizedElements = response.data.elements as NormalizedElement[];

      // 解析目录和页面范围
      const directoryRequests = await this.parseDirectoriesAndCorrespondingPaging(normalizedElements);

      response.data.markdown = cleanedMarkdown;
      response.data.directoryRequests = directoryRequests;

      return response.data;
    } catch (error: any) {
      console.error('[ParserService Error]:', error.response?.data || error.message);
      throw new Error(`文档解析服务异常: ${error.response?.data?.detail || error.message}`);
    } finally {
      // 预览功能需要原文件，因此此处不再删除上传的文件
    }
  }
}
