import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import 'dotenv/config';

export interface ParserResult {
  filename: string;
  content_type: string;
  markdown: string;
  elements: any[];
  metadata: {
    size: number;
    source: string;
    page_count: number;
  };
}

export class ParserService {
  private readonly baseUrl: string;

  constructor() {
    // 默认指向 Python 解析微服务
    this.baseUrl = process.env.PYTHON_PARSER_URL || 'http://localhost:8200';
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
      const response = await axios.post<ParserResult>(`${this.baseUrl}${endpoint}`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 600000, // 增加到 10 分钟以支持极大文件解析
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error: any) {
      console.error('[ParserService Error]:', error.response?.data || error.message);
      throw new Error(`文档解析服务异常: ${error.response?.data?.detail || error.message}`);
    } finally {
      // 解析完成后删除临时文件
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  /**
   * 生成标签
   * @param markdown 
   * @returns 
   */
  public async generateLabel(markdown: string): Promise<string> {
    return markdown;
  }
}
