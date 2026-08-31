# 开发任务需求文档

> 基于 RAG QA System 当前进度整理，按 Phase 划分，每项任务标注改动范围、核心逻辑和验收标准。

---

## 当前状态总览

### ✅ 已完成（16 项）

| # | 任务 | 涉及文件 |
|---|------|----------|
| 1 | PDF/Word/Excel → Markdown 解析微服务 | [pdf_parser.py](file:///d:/code/QA_System/python-document2markdown/app/services/pdf_parser.py) |
| 2 | LangChain 语义分块（RecursiveCharacterTextSplitter） | [ingestion.service.ts](file:///d:/code/QA_System/backend/src/services/ingestion.service.ts) |
| 3 | 分批向量化入库（DashScope text-embedding-v4, batchSize=6） | [ingestion.service.ts](file:///d:/code/QA_System/backend/src/services/ingestion.service.ts) |
| 4 | Chroma 单例模式修复连接时序问题 | [chroma.client.ts](file:///d:/code/QA_System/backend/src/core/chroma.client.ts) |
| 5 | 文档列表同步（从向量库元数据聚合） | [ingestion.service.ts](file:///d:/code/QA_System/backend/src/services/ingestion.service.ts) |
| 6 | 基础 RAG 问答（向量检索 → Context → LLM） | [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) |
| 7 | 检索日志保存到 `backend/logs/` | [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) |
| 8 | 对话记忆（后端 MemoryService + 前端 Session 持久化） | [memory.service.ts](file:///d:/code/QA_System/backend/src/services/memory.service.ts) / [useSession.ts](file:///d:/code/QA_System/frontend/src/hooks/useSession.ts) |
| 9 | 前端 AI 回答加载等待状态 | [ChatArea.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/ChatArea.tsx) |
| 10 | 侧边栏重构 + 上传弹窗左右分栏 | [Sidebar.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/Sidebar.tsx) / [UploadModal.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/UploadModal.tsx) |
| 11 | 查询重写（Query Rewriting） | [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) |
| 12 | 后端 VectorRepository 重构 | [vector.repository.ts](file:///d:/code/QA_System/backend/src/repositories/vector.repository.ts) |
| 13 | HyDE 检索（Hypothetical Document Embedding） | [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) |
| 14 | 文档主动分析 (概要/关键词/大纲) | [ingestion.service.ts](file:///d:/code/QA_System/backend/src/services/ingestion.service.ts) / [OutlineModal.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/OutlineModal.tsx) |
| 15 | 原文高保真预览与大纲分栏 | [DocumentViewer.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/DocumentViewer.tsx) / [OutlineModal.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/OutlineModal.tsx) |
| 16 | 桌面端 UI 汉化与本地化体验优化 | [DesktopLayout.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/desktop/DesktopLayout.tsx) |

### 🔧 现在所处的阶段

```
Phase 1 (检索质量提升) ──── 当前正在做
    ├── 对话记忆 ✅ 已完成
    ├── 查询重写 ✅ 已完成
    ├── VectorRepository 重构 ✅ 已完成
    ├── HyDE 检索 ✅ 已完成
    ├── 多路召回 ⬅️ 下一个任务
    └── 混合解析优化

Phase 2 (手账化治愈系学习 - 核心体验) ──── 正在进行
    ├── 文档主动分析 (概要/关键词/大纲) ✅ 已完成
    ├── 原文高保真预览与大纲分栏 ✅ 已完成
    ├── 桌面端 UI 汉化 ✅ 已完成
    ├── 仪式感学习流 (预测贴 -> 寻证背包 -> 盖章) ⬅️ 下一个任务
    ├── 手账作品模板 (三格/人物卡/观点卡)
    └── 单元地图与支线彩蛋

Phase 3 (任务机制与打磨) ──── 待开始
    ├── 行为印章体系 (证据/好奇/成长等)
    ├── 流式输出 (SSE + 打字机效果)
    ├── 可视化溯源 (悬浮原文卡片)
    └── 多模态解析 (表格/图片 OCR)
```

---

## Phase 1 — 检索质量提升

### 任务 1.1 查询重写（Query Rewriting） ✅

**目标**：当用户连续追问时，将模糊的追问改写为包含上下文信息的完整问题，再送去检索。

**场景示例**：
```
用户: "RAG 的核心组件有哪些？"          → 直接检索
用户: "它的优缺点是什么？"               → 重写为 "RAG（检索增强生成）的优缺点是什么？" 再检索
```

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) | 修改 | 在向量检索之前，增加查询重写步骤 |
| [memory.service.ts](file:///d:/code/QA_System/backend/src/services/memory.service.ts) | 不改 | 复用已有的历史记录方法 |

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

#### 验收标准

- [x] 首次提问：检索用的原始问题，不走重写流程
- [x] 第二次提问（追问）：终端输出"重写后的问题：xxx"
- [x] 重写后的问句包含上下文信息，不再是模糊表达

---

### 任务 1.2 HyDE 检索（Hypothetical Document Embedding） ✅

**目标**：先让 LLM 根据问题生成一段"假设答案"，再用这段假答案去搜向量库，提高语义匹配度。

**原理**：问题与文档片段的措辞往往差异较大（问题短、文档长）。先生成一段类似文档风格的"假答案"，它在语义空间中更接近真实文档。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) | 修改 | 在向量检索前插入 HyDE 生成步骤，改用假答案向量检索 |

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

- [x] 同一条问题，HyDE 模式召回的文档比纯向量检索更相关
- [x] 检索日志中记录 HyDE 生成的假答案摘要
- [x] 响应时间增加不超过 2 秒（HyDE 多一次 LLM 调用）

---

### 任务 1.3 多路召回（Hybrid Search） ⬅️

**目标**：同时使用向量检索 + 关键词检索，合并排序后取 Top-K，提高覆盖率。

**场景**：有些精确匹配（如"Transformer 2017"）向量检索可能排得靠后，但关键词检索能精准命中。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| [ask.service.ts](file:///d:/code/QA_System/backend/src/services/ask.service.ts) | 修改 | 新增关键词检索逻辑，与向量检索结果合并 |
| [package.json](file:///d:/code/QA_System/backend/package.json) | 修改 | 新增关键词检索依赖 |
| [chroma.client.ts](file:///d:/code/QA_System/backend/src/core/chroma.client.ts) | 不改 | Chroma 本身支持文本过滤 |

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

## Phase 2 — 主动学习 & 任务机制

### 任务 2.1 文档主动分析 (Overview First) ✅

**目标**：用户上传文档后，自动生成“文档概要”，帮助用户快速消化内容，而非直接进入做题环节。

**学习闭环设计**：概览 (Summary) → 理解 (Q&A) → 检验 (Quiz) → 强化 (Review)。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| [ingestion.service.ts](file:///d:/code/QA_System/backend/src/services/ingestion.service.ts) | 修改 | 入库成功后调用 LLM 生成摘要、关键词、大纲（支持原子化拆分） |
| [document.repository.ts](file:///d:/code/QA_System/backend/src/repositories/document.repository.ts) | 修改 | 支持存储和读取文档级别的概要、关键词、大纲元数据 |
| [chat.ts](file:///d:/code/QA_System/frontend/src/types/chat.ts) | 修改 | Document 接口增加 summary、keywords、outline 字段 |
| [Sidebar.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/Sidebar.tsx) | 修改 | 展示关键词标签，增加大纲查看按钮 |
| [OutlineModal.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/common/OutlineModal.tsx) | **新增** | 以层级树形式展示大纲内容，并显示文档摘要 |

#### 核心逻辑

```
文档入库成功
    │
    ▼
后端触发 LLM 分析任务:
  Prompt 增强: 强调标题原子化拆分，严禁标题堆砌
    │
    ▼
结果存入关系数据库 (SQLite/Prisma)
    │
    ▼
前端识别数据并渲染:
  1. 侧边栏显示 Tag
  2. 点击按钮弹出 OutlineModal
```

#### 验收标准

- [x] 文档上传后自动生成摘要和关键词标签
- [x] 侧边栏文档项显示核心关键词标签
- [x] 能够通过弹窗查看层级清晰的大纲（解决标题堆砌问题）
- [x] 弹窗内同步展示 AI 生成的文档摘要

---

### 任务 2.2 桌面端 UI 汉化 ✅

**目标**：提升桌面端聊天布局的本地化体验，将主要 UI 标签和状态显示从英文翻译为中文。

#### 改动文件

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| [DesktopLayout.tsx](file:///d:/code/QA_System/frontend/src/pages/Chat/desktop/DesktopLayout.tsx) | 修改 | 翻译 "Analysis Mode"、"Active_Asset" 等标签，同步汉化状态显示逻辑 |

#### 验收标准

- [x] 桌面端侧边栏标题显示为“分析模式”
- [x] 活跃文档标识显示为“当前文档”
- [x] 检索模式显示正确（如“目标文档”、“全局检索”）

---

### 任务 2.3 仪式感学习流 (Ritual Learning Flow) ⬅️

**目标**：将单一的问答重构为包含“预测贴 -> 寻证背包 -> 盖章”的四步仪式，增强学习的掌控感。

#### 核心组件与改动
1. **预测贴 (Prediction Sticker)**:
   - UI: 聊天区顶部浮动卡片，记录初始预测。
   - 逻辑: 学习开始前强制触发，木木提问。
2. **寻证背包 (Evidence Bag)**:
   - UI: 右侧边栏/浮窗，存储从 PDF 拖拽或点击选中的片段。
   - 逻辑: 限制每小节收集 2-3 条，需关联“它证明了什么”。
3. **盖章反馈 (Stamping)**:
   - UI: 拟物化印章动画。
   - 逻辑: 任务完成后，木木作为“盖章官”确认。

#### 验收标准
- [ ] 进入文档小节学习时，木木主动发起预测提问
- [ ] 用户可以从 PDF 预览区“抓取”证据放入背包
- [ ] 流程结束后显示今日手账页预览

---

### 任务 2.4 手账作品模板 (Scrapbook Templates)

**目标**：提供三套文科适配的模板，让孩子将证据转化为作品。

#### 模板规格
- **三格手账**: [见] + [思] + [证] (适用于低年级)
- **人物卡**: 姓名、动机、核心事迹、我的评价 (语文/历史)
- **观点卡**: 核心论点、支持证据、例外情况 (高年级/批判性阅读)

#### 验收标准
- [ ] 支持在右侧区域切换模板
- [ ] 模板可自动填入背包中的证据
- [ ] 支持导出/预览生成的单页手账

---

### 任务 2.5 单元地图与支线彩蛋

**目标**：将枯燥的列表改为关卡式的单元地图。

#### 核心逻辑
- **地图生成**: 根据 Prisma 中的 Document 元数据生成节点。
- **进度可见**: 已完成节点显示印章，未完成为灰度。
- **彩蛋触发**: 检索到特定关键词或完成特定行为（如提出好问题）时，弹出彩蛋贴纸。

---

## Phase 3 — 任务机制与打磨

### 任务 3.1 行为印章体系 (Behavior Stamps)

**目标**：奖励学习习惯，而非仅仅奖励正确率。

#### 印章定义
- **证据章**: 引用并解释。
- **好奇章**: 提问引发深度检索。
- **成长章**: 修改了预测贴的观点。
- **勇气章**: 面对复杂文本持续探索。

---

### 任务 3.2 流式输出 (SSE + 打字机效果)

**目标**：LLM 回答以 SSE 流式逐字返回，前端打字机效果。

---

### 任务 3.3 可视化溯源 (悬浮原文卡片)

**目标**：AI 回答中引用来源时，鼠标悬浮高亮展示原文片段，点击跳转。

---

### 任务 3.4 多模态解析 (表格/图片 OCR)

**目标**：表格结构化提取、图片 OCR。

---

## 任务执行建议

### 本周优先 (Phase 1 收尾 & Phase 2 启动)
1. 任务 1.3 多路召回 (关键词+向量)
2. 任务 2.1 文档主动分析 (概要生成)
3. 任务 2.3 仪式感学习流 (核心逻辑)

### 下周重点 (手账化体验)
1. 任务 2.4 手账作品模板
2. 任务 3.1 行为印章体系

---

## 附录：前端 Hook 职责对照

```
useChat.ts            ── 组合器，对外接口稳定
  ├── useDocuments.ts ── 文档列表、上传、选择
  ├── useMessages.ts  ── 消息发送、输入框、AI 状态
  └── useSession.ts   ── 会话持久化、切换、删除
```

修改前端逻辑时，按此职责找到对应 Hook，不要跨层修改。
