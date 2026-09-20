import { MarkdownTextSplitter } from '@langchain/textsplitters';
import fs from 'node:fs';
import path from 'node:path';
import * as readline from 'node:readline';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const aiLlm = new ChatOpenAI({
    modelName: 'deepseek-v4-flash',
    temperature: 0,
    apiKey: process.env.DEEPSEEK_API_KEY,
    configuration: {
        baseURL: 'https://api.deepseek.com',
    },
});

type NormalizedElementBase = {
    id: number;
    type: string;
    pageNumber: number;
    boundingBox?: [number, number, number, number];
    content?: string;
};

type NormalizedHeadingElement = NormalizedElementBase & {
    type: 'heading';
    headingLevel: number;
    content: string;
};

type NormalizedElement = NormalizedHeadingElement | NormalizedElementBase;

type OutlineNode = {
    id: number;
    title: string;
    level: number;
    startPage: number;
    endPage: number;
    page: number;
    headingBoundingBox?: [number, number, number, number];
    evidence?: {
        page: number;
        boundingBox: [number, number, number, number];
        text: string;
    };
    children: OutlineNode[];
};

type OutlineResult = {
    document: {
        startPage: number;
        endPage: number;
    };
    outline: OutlineNode[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function tryParseJsonArrayFromText(text: string): unknown[] | null {
    const start = text.search(/\[\s*\{/);
    if (start === -1) {
        return null;
    }

    const end = text.lastIndexOf('}]');
    if (end === -1 || end <= start) {
        return null;
    }

    const candidate = text.slice(start, end + 2).trim();
    try {
        const parsed = JSON.parse(candidate) as unknown;
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function normalizeElements(raw: unknown): NormalizedElement[] {
    if (!Array.isArray(raw)) {
        throw new Error('JSON 顶层不是数组');
    }

    const result: NormalizedElement[] = [];

    for (const item of raw) {
        if (!isRecord(item)) {
            continue;
        }

        const type = typeof item.type === 'string' ? item.type : null;
        const pageNumber = asNumber(item['page number']);
        const id = asNumber(item.id);

        if (!type || pageNumber === null || id === null) {
            continue;
        }

        const bboxRaw = item['bounding box'];
        const boundingBox =
            Array.isArray(bboxRaw) &&
                bboxRaw.length === 4 &&
                bboxRaw.every((v) => typeof v === 'number' && Number.isFinite(v))
                ? (bboxRaw as [number, number, number, number])
                : undefined;

        const content = typeof item.content === 'string' ? item.content.trim() : '';

        if (type === 'heading') {
            const headingLevel = asNumber(item['heading level']);
            if (headingLevel === null || content.trim().length === 0) {
                continue;
            }

            result.push({
                id,
                type: 'heading',
                pageNumber,
                boundingBox,
                headingLevel,
                content,
            });
            continue;
        }

        result.push({
            id,
            type,
            pageNumber,
            boundingBox,
            content: content.length > 0 ? content : undefined,
        });
    }

    return result;
}

function orderElements(elements: NormalizedElement[]): NormalizedElement[] {
    return [...elements].sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) {
            return a.pageNumber - b.pageNumber;
        }

        const aTop = a.boundingBox ? a.boundingBox[3] : -Infinity;
        const bTop = b.boundingBox ? b.boundingBox[3] : -Infinity;
        if (aTop !== bTop) {
            return bTop - aTop;
        }

        const aLeft = a.boundingBox ? a.boundingBox[0] : -Infinity;
        const bLeft = b.boundingBox ? b.boundingBox[0] : -Infinity;
        if (aLeft !== bLeft) {
            return aLeft - bLeft;
        }

        return a.id - b.id;
    });
}


async function extractPageRangesByAi(ordered: NormalizedElement[]) {
    const pages = ordered.map((e) => e.pageNumber);
    const documentStartPage = pages.length > 0 ? Math.min(...pages) : 1;
    const documentEndPage = pages.length > 0 ? Math.max(...pages) : 1;

    const orderedWithoutImages = ordered.filter((e) => e.type !== 'image');
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
    const response = await aiLlm.invoke(prompt);

    return {
        documentStartPage,
        documentEndPage,
        pagesDigest: response.content,
    }
}

/**
 * 测试Markdown文本分割器
 */
async function runMarkdownSplitter() {
    const markdownPath = path.resolve(__dirname, 'doc.md');
    const outputPath = path.resolve(__dirname, 'chunks.json');

    const markdown = fs.readFileSync(markdownPath, 'utf-8');
    const splitter = new MarkdownTextSplitter({
        chunkSize: 4000,
        chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments([
        {
            pageContent: markdown,
            metadata: {},
        },
    ]);

    fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
}

/**
 * 测试页面范围提取器
 */
function runPageRangeExtraction(inputPath: string, outputPath?: string) {
    const rawText = fs.readFileSync(inputPath, 'utf-8');
    const parsedJsonArray = tryParseJsonArrayFromText(rawText);
    if (!parsedJsonArray) {
        throw new Error('page-ranges 只支持输入 pdf_elements 导出的 JSON 数组（.json 或包含该数组的 .md）');
    }

    const ordered = orderElements(normalizeElements(parsedJsonArray));

    const resolvedOutputPath = outputPath
        ? path.resolve(outputPath)
        : path.resolve(process.cwd(), 'page_ranges.json');

    return { ordered, resolvedOutputPath };
}

function writeStdoutLine(message: string) {
    process.stdout.write(`${message}\n`);
}

function writeStderrLine(message: string) {
    process.stderr.write(`${message}\n`);
}

function startSpinner(label: string) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;

    const render = () => {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${frames[frameIndex % frames.length]} ${label}`);
        frameIndex += 1;
    };

    render();
    const interval = setInterval(render, 120);

    return (finalMessage?: string) => {
        clearInterval(interval);
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        if (finalMessage) {
            writeStdoutLine(finalMessage);
        }
    };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    let timer: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([
        promise.finally(() => {
            if (timer) {
                clearTimeout(timer);
            }
        }),
        timeoutPromise,
    ]);
}


async function main() {
    writeStdoutLine('步骤 1/3: 读取并解析页面元素...');
    const { ordered, resolvedOutputPath } = runPageRangeExtraction(
        "D:/code/QA_System/backend/debug_parsed/【人教版】六年级上册语文电子课本.pdf_elements.json_2026-08-01T05-48-30.md",
        path.resolve(process.cwd(), 'page_ranges.json')
    );
    writeStdoutLine(`已解析元素: ${ordered.length}`);

    writeStdoutLine('步骤 2/3: 调用大模型提取页面范围（可能需要一些时间）...');
    const stopSpinner = startSpinner('正在调用大模型...');

    const { documentStartPage, documentEndPage, pagesDigest } = await extractPageRangesByAi(ordered);

    stopSpinner('大模型返回成功');

    writeStdoutLine('步骤 3/3: 写入结果文件...');
    fs.writeFileSync(resolvedOutputPath, JSON.stringify({ pagesDigest, documentStartPage, documentEndPage }, null, 2));
    writeStdoutLine(`完成: ${resolvedOutputPath}`);
}

void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : '未知错误';
    writeStderrLine(`失败: ${message}`);
    process.exitCode = 1;
});
