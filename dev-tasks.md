# 开发任务需求文档

> 基于 RAG QA System 当前进度整理，按 Phase 划分，每项任务标注改动范围、核心逻辑和验收标准。

---

## 当前状态总览

### ✅ 已完成（10 项）

| # | 任务 | 涉及文件 |
|---|------|----------|
| 1 | PDF/Word/Excel → Markdown 解析微服务 | `python-document2markdown/app/services/pdf_parser.py` |
| 2 | LangChain 语义分块（RecursiveCharacterTextSplitter） | `backend/src/services/ingestion.service.ts` |
| 3 | 分批向量化入库（DashScope text-embedding-v4, batchSize=6） | `backend/src/services/ingestion.service.ts` |
| 4 | Chroma 单例模式修复连接时序问题 | `backend/src/core/chroma.client.ts` |
| 5 | 文档列表同步（从向量库元数据聚合） | `backend/src/services/ingestion.service.ts` |
| 6 | 基础 RAG 问答（向量检索 → Context → LLM） | `backend/src/services/ask.service.ts` |
| 7 | 检索日志保存到 `backend/logs/` | `backend/src/services/ask.service.ts` |
| 8 | 对话记忆（后端 MemoryService + 前端 localStorage 持久化 + 会话切换） | `memory.service.ts` / `useSession.ts` / `Sidebar.tsx` |
| 9 | 前端 AI 回答加载等待状态 | `useChat.ts` → `ChatArea.tsx` |
| 10 | 侧边栏重构 + 上传弹窗左右分栏 | `Sidebar.tsx` / `UploadModal.tsx` |

### 🔧 现在所处的阶段

```
Phase 1 (检索质量提升) ──── 当前正在做
    ├── 对话记忆 ✅ 已完成
    ├── 查询重写 ⬅️ 下一个任务
    ├── HyDE 检索
    └── 多路召回

Phase 2 (新奇功能) ──── 待开始
Phase 3 (产品化打磨) ──── 待开始
```

---

## Phase 1 — 检索质量提升

### 任务 1.1 查询重写（Query Rewriting）

**目标**：当用户连续追问时，将模糊的追问改写为包含上下文信息的完整问题，再送去检索。

**场景示例**：
```
用户: "RAG 的核心组件有哪些？"          → 直接检索
用户: "它的优缺点是什么？"               → 重写为 "RAG（检索增强生成）的优缺点是什么？" 再检索
```

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `backend/src/services/ask.service.ts` | 修改 | 在向量检索之前，增加查询重写步骤 |
| `backend/src/services/memory.service.ts` | 不改 | 复用已有的历史记录方法 |

#### 核心逻辑

```
ask(documentId, question, sessionId)
    │
    ├── 有 sessionId 且历史不为空？
    │     ├── 是 → 调用 LLM 重写问题
    │     │         Prompt: "基于对话历史，将以下追问改写为包含上下文信息的完整问题"
    │     │         输入: 历史消息 + 当前问题
    │     │         输出: 重写后的问题
    │     │
    │     └── 否 → 使用原始问题
    │
    ├── 用（重写后的）问题去向量检索
    ├── 构建 Context
    └── LLM 生成回答
```

#### 代码实现思路

在 `ask.service.ts` 中新增一个私有方法：

```typescript
/**
 * 查询重写：结合历史对话，将追问改写为完整问题
 */
private async rewriteQuestion(question: string, history: ChatMessage[]): Promise<string> {
  // 如果历史为空，不需要重写
  if (history.length === 0) return question;

  // 构建重写 Prompt
  const rewritePrompt = `基于以上对话历史，将用户最新的追问改写为一个包含完整上下文的独立问题。
只返回改写后的问题，不要任何解释。

对话历史：
${history.map(m => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`).join('\n')}

用户追问：${question}

改写后的问题：`;

  const response = await llm.invoke([new HumanMessage(rewritePrompt)]);
  return response.content as string;
}
```

然后在 `ask()` 方法的 Step 1 之前调用：

```typescript
// 重写问题（如果有历史）
const history = sessionId ? memoryService.getHistory(sessionId) : [];
const finalQuestion = history.length > 0 ? await this.rewriteQuestion(question, history) : question;

// 用 finalQuestion 去检索
const relevantDocs = await chroma.similaritySearch(finalQuestion, K, { documentId });
```

#### 验收标准

- [ ] 首次提问：检索用的原始问题，不走重写流程
- [ ] 第二次提问（追问）：终端输出"重写后的问题：xxx"
- [ ] 重写后的问句包含上下文信息，不再是模糊表达

---

### 任务 1.2 HyDE 检索（Hypothetical Document Embedding）

**目标**：先让 LLM 根据问题生成一段"假设答案"，再用这段假答案去搜向量库，提高语义匹配度。

**原理**：问题与文档片段的措辞往往差异较大（问题短、文档长）。先生成一段类似文档风格的"假答案"，它在语义空间中更接近真实文档。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `backend/src/services/ask.service.ts` | 修改 | 在向量检索前插入 HyDE 生成步骤，改用假答案向量检索 |

#### 核心逻辑

```
原始问题: "RAG 如何解决大模型幻觉问题？"
    │
    ▼
HyDE 生成 Prompt: "请根据问题生成一段详细的文档片段（假设答案）"
    │
    ▼
生成假答案: "检索增强生成（RAG）通过在生成过程中引入外部知识库检索..."
    │
    ▼
用假答案代替原始问题去做向量检索 → 得到相关文档
    │
    ▼
继续用原始问题 + Context 让 LLM 回答（HyDE 仅在检索阶段使用）
```

#### 关键设计决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| HyDE 与查询重写的关系 | 先用查询重写，再用 HyDE | 时序上：先补齐上下文 → 再生成假答案检索 |
| 是否保留原始问题检索 | 当前阶段只走 HyDE | 简化实现；后续多路召回时会融合两者 |
| HyDE 生成结果是否显示给用户 | 不显示 | HyDE 仅用于检索，用户看到的是正常回答 |

#### 验收标准

- [ ] 同一条问题，HyDE 模式召回的文档比纯向量检索更相关
- [ ] 检索日志中记录 HyDE 生成的假答案摘要
- [ ] 响应时间增加不超过 2 秒（HyDE 多一次 LLM 调用）

---

### 任务 1.3 多路召回（Hybrid Search）

**目标**：同时使用向量检索 + 关键词检索，合并排序后取 Top-K，提高覆盖率。

**场景**：有些精确匹配（如"Transformer 2017"）向量检索可能排得靠后，但关键词检索能精准命中。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `backend/src/services/ask.service.ts` | 修改 | 新增关键词检索逻辑，与向量检索结果合并 |
| `backend/package.json` | 修改 | 新增关键词检索依赖 |
| `backend/src/core/chroma.client.ts` | 不改 | Chroma 本身支持文本过滤 |

#### 核心逻辑

```
问题: "Transformer 2017"
    │
    ├── 向量检索 → [doc1(0.85), doc3(0.72), doc5(0.68)]
    │
    ├── 关键词检索 → [doc2(匹配"Transformer"), doc4(匹配"2017")]
    │     (对问题进行分词/提取关键词，用 Chroma 的 metadata filter 或全文检索)
    │
    └── 合并排序（RRF 或加权融合）
          │
          ▼
        最终 Top-K
```

#### 关键词检索实现方案

在 Chroma 中做关键词检索有两种方式：

**方案 A：Chroma 原生 $contains 过滤（推荐，零依赖）**
```typescript
// 使用 Chroma 的 $contains 操作符做文本过滤
const keywordResults = await chroma.similaritySearch(
  "",  // 空向量或低权重
  K, 
  { 
    documentId, 
    pageContent: { $contains: keyword }  // 包含关键词
  } 
);
```

**方案 B：额外分词工具（更精确）**
```bash
npm install natural  # Node.js 分词库
```

```typescript
import natural from 'natural';
const tokenizer = new natural.WordTokenizer();
const keywords = tokenizer.tokenize(question); // 提取关键词
```

#### 验收标准

- [ ] 包含精确关键词的文档能进入 Top-K 结果
- [ ] 多路召回的结果比单一向量检索覆盖率更高
- [ ] 响应时间增加不超过 500ms

---

## Phase 2 — 新奇功能探索

### 任务 2.1 文档主动分析

**目标**：文档上传向量化后，自动生成摘要、关键词标签、文档大纲，展示在文档列表项中。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `backend/src/services/ingestion.service.ts` | 修改 | 入库成功后调用 LLM 生成分析结果 |
| `backend/src/services/ask.service.ts` | 不改 | 复用 |
| `frontend/src/types/chat.ts` | 修改 | Document 接口增加 summary、keywords 字段 |
| `frontend/src/pages/Home/common/Sidebar.tsx` | 修改 | 悬浮或展开显示文档摘要/关键词 |

#### 数据流

```
文档入库成功
    │
    ▼
后端异步调用 LLM:
  Prompt: "请为以下文档内容生成：1. 一句话摘要 2. 3-5 个关键词标签 3. 文档大纲"
    │
    ▼
返回结构化数据 → 存入 Chroma metadata → 前端通过文档列表接口获取
```

#### Document 类型新增字段

```typescript
export interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  timestamp: string;
  chunkCount?: number;
  // === 新增 ===
  summary?: string;       // 一句话摘要
  keywords?: string[];    // 关键词标签
  outline?: string[];     // 文档大纲（标题列表）
}
```

#### 验收标准

- [ ] 文档上传后自动显示"正在分析..."状态
- [ ] 分析完成后，文档项显示关键词标签
- [ ] 鼠标悬浮或点击展开，显示摘要和大纲

---

### 任务 2.2 刷题打卡

**目标**：基于向量库中的文档片段，自动生成选择题/填空题，用户每日刷题打卡。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `backend/src/services/quiz.service.ts` | **新增** | 题目生成、答案校验服务 |
| `backend/src/controllers/quiz.controller.ts` | **新增** | 出题、答题、打卡统计接口 |
| `backend/src/routes/api.ts` | 修改 | 注册 `/quiz` 路由 |
| `frontend/src/services/quizService.ts` | **新增** | 前端 API 封装 |
| `frontend/src/pages/Quiz/index.tsx` | **新增** | 刷题页面 |
| `frontend/src/pages/Home/common/Sidebar.tsx` | 修改 | 增加刷题入口 |

#### 核心功能拆解（按优先级排列）

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 题目生成 | 从文档片段生成选择题（4 选项 + 答案） |
| P0 | 答题交互 | 展示题目，选择选项，判断对错 |
| P0 | 每日打卡 | 每天首次完成答题自动打卡，统计连续天数 |
| P1 | 题型扩展 | 支持填空、判断、多选题 |
| P1 | 错题回顾 | 收集答错的题目，单独出卷 |
| P2 | 遗忘曲线 | 根据答题间隔推荐复习题目 |

#### 题目生成核心逻辑

```typescript
// quiz.service.ts
export class QuizService {
  async generateQuestions(documentId: string, count: number = 5) {
    // 1. 从 Chroma 随机抽取文档片段
    const chroma = await getChromaInstance();
    const allDocs = await chroma.get({ filter: { documentId } });
    // 随机选取 count 个片段
    const selectedChunks = shuffle(allDocs).slice(0, count);
    
    // 2. 对每个片段生成题目
    const questions = [];
    for (const chunk of selectedChunks) {
      const prompt = `根据以下文档内容，生成一道选择题（4 个选项），并用 JSON 格式返回：
      
内容：${chunk.pageContent}

输出格式：
{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A", "explanation": "..."}`;

      const response = await llm.invoke([new HumanMessage(prompt)]);
      questions.push(JSON.parse(response.content as string));
    }
    
    return questions;
  }
}
```

#### 打卡模型

```typescript
interface DailyRecord {
  date: string;              // "2026-07-04"
  completed: boolean;        // 是否完成今日打卡
  totalQuestions: number;    // 答题总数
  correctCount: number;      // 正确数
  accuracy: number;          // 正确率
  questions: QuestionRecord[]; // 答题详情
}

interface QuizStats {
  currentStreak: number;     // 连续打卡天数
  totalDays: number;         // 累计打卡天数
  totalQuestions: number;    // 累计答题数
  averageAccuracy: number;   // 平均正确率
}
```

#### 验收标准

- [ ] 进入刷题页：显示今日题目（5 道选择题）
- [ ] 选择答案后：立即显示对错并展示参考答案
- [ ] 全部答完：显示正确率，自动打卡
- [ ] 侧边栏显示打卡状态和连续天数
- [ ] 第二天再次进入：自动生成新题，连续天数+1

---

### 任务 2.3 可视化溯源

**目标**：AI 回答中引用来源时，鼠标悬浮高亮展示原文片段，点击可跳转到文档位置。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `frontend/src/pages/Home/common/ChatArea.tsx` | 修改 | 来源引用改为悬浮卡片展示 |
| `backend/src/services/ask.service.ts` | 修改 | 返回结构化来源数据（含原文片段） |

#### 返回数据格式变化

```typescript
// 当前格式
{ message: "...", sources: ["文件A.pdf", "文件B.pdf"] }

// 新格式
{ 
  message: "...", 
  sources: [
    { 
      fileName: "文件A.pdf", 
      snippet: "这是被引用的原文片段...",  // 具体引用内容
      chunkId: "uuid-xxx",
      score: 0.92    // 相似度分数
    }
  ]
}
```

#### 前端交互

```
回答文本中显示: "根据片段 1、片段 2……"
                            │
                    鼠标悬浮 ┤
                            ▼
                   ┌─────────────────────┐
                   │ 文件A.pdf            │
                   │ 相关度: 92%          │
                   │ ─────────────────    │
                   │ "这是被引用的原文     │
                   │  片段内容预览..."    │
                   │                     │
                   │ [跳转到文件位置]      │
                   └─────────────────────┘
```

#### 验收标准

- [ ] 回答中的来源引用鼠标悬浮时显示原文片段卡片
- [ ] 卡片展示来源文件名、相似度分数、原文片段
- [ ] 点击可滚动画布定位（如需要）

---

## Phase 3 — 产品化打磨

### 任务 3.1 流式输出（Streaming）

**目标**：LLM 回答以 SSE 流式逐字返回，前端打字机效果。

#### 改动范围

| 文件 | 改动类型 |
|------|----------|
| `backend/src/controllers/chat.controller.ts` | 改为 SSE 响应 |
| `backend/src/services/ask.service.ts` | 新增 streamAsk 方法 |
| `frontend/src/services/documentService.ts` | 新增流式请求方法 |
| `frontend/src/hooks/useMessages.ts` | 改为逐字追加消息内容 |
| `frontend/src/pages/Home/common/ChatArea.tsx` | 显示流式游标动画 |

#### 技术方案

```typescript
// 后端 SSE 响应
res.setHeader('Content-Type', 'text/event-stream');
const stream = await llm.stream(messages);
for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
}
res.write('data: [DONE]\n\n');
res.end();
```

---

### 任务 3.2 多模态解析

**目标**：表格结构化提取、图片 OCR。

详见此前讨论的「混合解析」方案（文本提取 → 内容过少 → 触底切换 OCR）。

#### 改动范围

| 文件 | 改动类型 |
|------|----------|
| `python-document2markdown/app/services/pdf_parser.py` | 增加 OCR 触底逻辑 |
| `python-document2markdown/requirements.txt` | 新增依赖 |

---

### 任务 3.3 Namespace 隔离

**目标**：按知识领域分空间，实现多租户逻辑隔离。

在 Chroma 的 metadata 中增加 `namespace` 字段，所有查询/入库操作均带此过滤。

#### 改动范围

| 文件 | 改动类型 |
|------|----------|
| `backend/src/services/ingestion.service.ts` | 元数据加 namespace |
| `backend/src/services/ask.service.ts` | filter 加 namespace |
| `frontend/src/hooks/useDocuments.ts` | 上传/列表接口带 namespace |
| `frontend/src/pages/Home/common/Sidebar.tsx` | 增加空间切换 UI |

---

## 任务执行建议

### 本周优先（Phase 1 收尾）

```
任务 1.1 查询重写   →   1-2 天
任务 1.2 HyDE 检索  →   1-2 天
任务 1.3 多路召回   →   2-3 天
```

### 下周启动（Phase 2 首项）

```
任务 2.2 刷题打卡   →   4-5 天（P0 功能）
```

选择刷题打卡作为 Phase 2 首项的原因：
- 用户黏性最高（每日回访）
- 与现有数据的结合最自然（直接复用向量库）
- 技术实现最独立（不影响现有问答流程）

---

## 附录：前端 Hook 职责对照

```
useChat.ts            ── 组合器，对外接口稳定
  ├── useDocuments.ts ── 文档列表、上传、选择
  ├── useMessages.ts  ── 消息发送、输入框、AI 状态
  └── useSession.ts   ── 会话持久化、切换、删除
```

修改前端逻辑时，按此职责找到对应 Hook，不要跨层修改。
