# “全篇阅读 / 章节阅读”改造方案（前后端）

## 1. 目标与现状

### 现状
- 用户点击一本书（Document）后，直接进入“全篇 PDF 阅读”页面。
- 右侧对**整本书**做检索/问答（RAG）。

### 目标
- 点击一本书后先进入“阅读方式选择”：
  - **全篇阅读**：保持现状（全篇 PDF + 全篇检索/对话）。
  - **章节阅读**：平铺展示章节列表；用户选择章节后：
    - 只展示对应章节的 PDF（其他章节不加载）
    - 右侧检索/对话默认只在该章节范围内进行（可选：允许切换到全书）

## 2. 交互流程（路由驱动）

### 路由建议
- `/study/:docId`：阅读方式选择页（新增）
- `/study/:docId/full`：全篇阅读页（复用现有逻辑）
- `/study/:docId/chapters`：章节列表页（新增）
- `/study/:docId/chapters/:chapterId`：章节阅读页（新增）

### 用户流程
1. 书架/最近阅读点击某本书 → 进入 `/study/:docId`
2. 选择：
   - 全篇阅读 → `/study/:docId/full`
   - 章节阅读 → `/study/:docId/chapters`
3. 章节列表选择某章 → `/study/:docId/chapters/:chapterId`
4. 在章节阅读页：
   - 左侧只渲染该章节 PDF（或该章节页范围）
   - 右侧检索/问答默认限定 `chapterId`（或 `pageRange`）

## 3. 核心工程决策：如何做到“其他 PDF 不需要加载”

这里有两种实现级别，建议默认走 **B（推荐）**，保证“只加载章节”是事实而不是“只显示章节”。

### A. 仅前端“只渲染章节页”（实现快，但不一定省流量）
- 仍然请求原始整本 PDF 文件，但 PDF Viewer 只渲染指定页范围。
- 风险：很多 PDF 渲染器会预取/下载更多字节，最终可能仍接近“全书下载”。

### B. 后端提供“章节切片 PDF”（推荐，严格满足不加载其他章节）
- ingestion 后端将整本 PDF 按章节切片为多个“小 PDF 文件”（或按需生成并缓存）。
- 章节阅读时，前端只请求 `chapterId` 对应的切片 PDF 文件流。
- 优点：网络与渲染都只处理章节数据；体验稳定。
- 代价：需要新增章节元数据与切片文件管理。

后续方案默认按 **B** 设计。

## 4. 后端改造方案（Node.js / Prisma / Chroma）

### 4.1 数据模型调整（Prisma）
新增 `DocumentChapter`（或 `Chapter`）表，用于承载章节列表与页范围/切片文件：

- `id`
- `documentId`（FK）
- `title`
- `order`（章节序）
- `startPage` / `endPage`（页码范围，统一约定从 1 开始）
- `filePath`（章节切片 PDF 存储路径）或 `storageKey`
- `createdAt` / `updatedAt`

说明：
- 若现有 `Document.outline` 已是结构化 JSON，可以作为“解析来源”，但仍建议落表，便于：
  - 稳定分页、排序、增量更新
  - 权限/统计/缓存策略
  - 直接面向前端输出章节列表

### 4.2 Ingestion 流程扩展（解析 → 章节落库 → 切片生成）
在“文档入库”链路增加两步：

1. **章节识别**
   - 来源优先级建议：
     1) Parser 服务输出的 outline / headings（如果已具备）
     2) 解析出的 markdown 标题结构
     3) 兜底：按页/固定策略（仅在缺失章节时）
2. **章节切片 PDF 生成**
   - 使用服务端 PDF 工具将 `startPage..endPage` 提取为新 PDF
   - 存储策略：
     - `backend/uploads/documents/:docId/chapters/:chapterId.pdf`
     - 或对象存储（若未来迁移 S3/OSS）

落库规则：
- 生成章节记录（含页码范围、标题、顺序、切片文件路径）
- 若章节切片生成失败：
  - 允许章节列表存在，但章节阅读回退到方案 A（仅渲染页范围）或提示“该章节暂不可用”

### 4.3 向量检索范围控制（章节阅读的 RAG）
章节阅读时，需要把“检索范围”限定在章节内，建议两种做法：

- **做法 1（推荐）**：向量元数据里已有 `chapter_title` / `chapter_id`
  - 检索请求携带 `chapterId`（或 `chapterTitle`）
  - Chroma/LangChain 检索时加 metadata filter
- **做法 2**：用页码范围过滤
  - chunk metadata 保存 `pageNumber` 或 `pageStart/pageEnd`
  - 通过 `startPage/endPage` 做 filter

推荐优先 `chapterId`（稳定、语义清晰、避免标题重复）。

### 4.4 API 设计（新增/调整）

#### 新增：获取章节列表
- `GET /documents/:documentId/chapters`
- Response（示例字段）：
  - `id, title, order, startPage, endPage`

#### 新增：获取章节 PDF 文件流
- `GET /documents/:documentId/chapters/:chapterId/file`
- 返回：`application/pdf` 流

#### 调整：问答接口支持章节范围（保持兼容）
现有若是 `/documents/:documentId/ask`：
- Request 新增可选字段：
  - `chapterId?: string`
  - 或 `scope: "document" | "chapter"`
- 规则：
  - 不传 `chapterId` → 全书检索（兼容现状）
  - 传 `chapterId` → 限定章节检索

错误处理（统一拦截）：
- 章节不存在：404（明确错误码）
- 章节文件缺失：409 或 500（带可恢复信息），前端可回退到“只渲染页范围”的模式

### 4.5 分层落地（强约束）
- Controller：只做参数校验与 DTO 映射
- Service：编排章节生成、问答范围策略、文件路径策略
- Repository：只负责 Prisma 读写
- 文件系统/对象存储访问：封装为独立 Storage Service（避免散落在 Service 里）

## 5. 前端改造方案（React / Hooks / Services）

### 5.1 页面与组件拆分（Page → Hook → Service → API）
新增页面：
- `StudyModeSelectPage`：两个入口卡片（全篇 / 章节）
- `ChapterListPage`：章节平铺列表
- `ChapterStudyPage`：章节 PDF Viewer + 右侧对话

复用页面：
- 现有全篇阅读页迁移为 `FullStudyPage`（路由不变或新路由 `/full`）

### 5.2 Hooks 设计
建议新增 `useChapters(documentId)`：
- 状态：`chapters`, `loading`, `error`
- 动作：`refresh()`

对话 Hook（如 `useChat`）扩展支持 scope：
- `scope: { type: "document" } | { type: "chapter"; chapterId: string }`
- 由页面注入 scope，Hook 内部不“猜测页面状态”
- 右侧 UI 明确展示当前 scope（避免孩子误以为在全书范围）

`useSession` 相关（你当前打开的 useSession.ts）建议调整点：
- session 维度建议支持 `documentId + scope` 的组合
- 章节阅读可复用同一个 session（只是在消息里记录 scope），或每章一个 session（更清晰但 session 数多）
- 推荐：**同一本书一个 session**，消息记录 `scopeType + chapterId?`，便于回看学习轨迹连续

### 5.3 Services 层调整
新增：
- `chapterService.getChapters(documentId)`
- `chapterService.getChapterFileUrl(documentId, chapterId)`（或直接返回 fetch stream）

调整 ask service：
- `askService.askDocument({ documentId, question, chapterId? })`

### 5.4 PDF Viewer 行为
章节阅读页：
- PDF 源换成章节切片文件 URL：`/documents/:docId/chapters/:chapterId/file`
- 不再加载整本文件，因此满足“其他 PDF 不需要加载”
- 若章节切片暂不可用（后端返回特定错误）：
  - 可降级：请求整本 PDF + 仅渲染页范围（作为容灾路径）

## 6. 兼容性与迁移策略

### 6.1 兼容旧数据
- 已上传的旧文档可能没有章节表数据：
  - 方案：首次访问章节列表时触发“懒生成”（后台异步生成章节记录与切片）
  - 或提供一次性脚本/后台任务批处理（更稳）

### 6.2 渐进上线
- 先上线“阅读方式选择 + 章节列表（只显示）”
- 再上线“章节问答范围限定”
- 最后上线“章节切片 PDF”（或优先上线切片以满足核心诉求）

## 7. 测试要点（前后端）

### 后端
- 章节列表排序稳定、页码范围正确
- 切片 PDF 可打开、页数符合 `endPage-startPage+1`
- ask 限定章节时，检索结果的元数据符合章节过滤条件
- 错误码与统一拦截输出一致（无泄露内部路径/堆栈）

### 前端
- 路由回退正确（章节页可回章节列表、可回模式选择、可回首页）
- 章节切换不会串上下文（右侧 scope 清晰）
- 弱网下章节 PDF 加载体验与错误态 UI（可重试）

## 8. 交付清单（你可以按此拆 dev-tasks）

- Backend
  - Prisma 增加 Chapter 表 + Repository
  - Ingestion: 章节识别 + 切片生成 + 落库
  - API: chapters list + chapter file
  - Ask: 支持 chapterId filter
- Frontend
  - 新增模式选择页、章节列表页、章节阅读页
  - Hook: useChapters + useChat 支持 scope
  - Service: chapters API + ask 扩展
  - PDF Viewer 章节源切换与容灾降级

  # “全篇阅读 / 章节阅读”改造方案（工程规格补齐版）

## 9. 接口契约（API Contract）

> 目标：前端可以无猜测地实现路由与加载策略；后端可独立演进“切片生成/缓存/检索过滤”。

### 9.1 获取文档阅读入口信息（可选，但推荐）
用于模式选择页展示（文档名、是否支持章节、章节数量、生成状态等）。

- `GET /documents/:documentId/study-entry`

Response 200：
- `documentId: string`
- `title: string`
- `mimeType: string`
- `chapterSupport: "ready" | "generating" | "unavailable"`
- `chapterCount: number`
- `updatedAt: string`

说明：
- `chapterSupport=generating`：章节还在生成中，章节阅读入口可显示“准备中”并允许刷新。
- 没有该接口也能做：前端直接请求 chapters list，404/409 作为状态判断；但这个接口能让 UI 更稳。

---

### 9.2 章节列表
- `GET /documents/:documentId/chapters`

Response 200：
- `documentId: string`
- `chapters: ChapterDTO[]`

ChapterDTO：
- `id: string`
- `title: string`
- `order: number`
- `startPage: number`
- `endPage: number`
- `pageCount: number`
- `pdfStatus: "ready" | "missing" | "generating"`
- `updatedAt: string`

错误：
- 404 `DOCUMENT_NOT_FOUND`
- 409 `CHAPTERS_GENERATING`（可选）  
  - 场景：你采用“懒生成”且生成尚未完成

---

### 9.3 获取章节 PDF（只加载该章节）
- `GET /documents/:documentId/chapters/:chapterId/file`
- Response 200：`application/pdf`（stream）

Headers 建议：
- `Content-Type: application/pdf`
- `Cache-Control: private, max-age=...`（缓存策略）
- `ETag` 或 `Last-Modified`（便于浏览器缓存与条件请求）

错误：
- 404 `CHAPTER_NOT_FOUND`
- 409 `CHAPTER_PDF_GENERATING`（可选）
- 410 `CHAPTER_PDF_GONE`（可选，用于清理后的失效）

---

### 9.4 全篇 PDF（现状复用）
- `GET /documents/:documentId/file`（已存在）

---

### 9.5 问答（支持章节范围）
假设现有接口为：
- `POST /documents/:documentId/ask`

Request：
- `question: string`
- `sessionId?: string`
- `scope?: AskScopeDTO`

AskScopeDTO：
- `{ type: "document" }`
- `{ type: "chapter"; chapterId: string }`

Response（保持你现有结构，补充 scope 回传以避免前端串上下文）：
- `sessionId: string`
- `scope: AskScopeDTO`
- `answerStream`（若是 SSE/流式，保持原协议）
- `citations?: CitationDTO[]`（若已有）

CitationDTO（建议最小字段）：
- `chunkId: string`
- `documentId: string`
- `chapterId?: string`
- `pageNumber?: number`
- `text: string`
- `bbox?: number[]`（如你已有 bbox 高亮体系）

错误：
- 400 `INVALID_SCOPE`
- 404 `CHAPTER_NOT_FOUND`（scope 为 chapter 时）
- 422 `QUESTION_TOO_LONG` / `EMPTY_QUESTION`（按你的规范）

---

## 10. 错误码与前端处理策略（统一拦截）

> 目标：错误分类稳定，前端可以做一致的 UI 分支，不用解析 message 文本。

建议错误结构：
- `code: string`
- `message: string`（可本地化）
- `requestId: string`
- `details?: object`（不含敏感路径）

前端处理映射（建议）：
- `CHAPTERS_GENERATING` / `CHAPTER_PDF_GENERATING`
  - UI：展示“章节准备中”，提供“刷新/重试”
  - 可附加“预计需要几分钟”但不硬编码时间
- `CHAPTER_NOT_FOUND`
  - UI：提示章节不存在，返回章节列表
- `DOCUMENT_NOT_FOUND`
  - UI：提示文档不存在，返回书架/首页
- 网络错误 / 5xx
  - UI：重试 + 降级策略（见第 12 节）

---

## 11. 前端路由与页面规格（UI 逻辑）

### 11.1 模式选择页 `/study/:docId`
信息呈现：
- 文档标题 + 简要信息（页数/章节数可选）
- 两个选项卡片：
  - 全篇阅读（立即可用）
  - 章节阅读（ready / generating / unavailable 三态）

交互规则：
- `chapterSupport=ready` → 可点击进入章节列表
- `chapterSupport=generating` → 点击进入章节列表也可以，但列表页显示“生成中”
- `chapterSupport=unavailable` → 禁用按钮，提示原因（如“该文档暂不支持章节阅读”）

### 11.2 章节列表页 `/study/:docId/chapters`
数据源：`GET /documents/:docId/chapters`

展示策略：
- 平铺卡片/列表（按 `order`）
- 每项显示：
  - 标题
  - 页范围 `startPage-endPage`
  - `pdfStatus` 状态（ready/generating）

点击规则：
- `pdfStatus=ready` → 进入章节阅读页
- `pdfStatus=generating/missing` → 显示不可用/重试入口

### 11.3 章节阅读页 `/study/:docId/chapters/:chapterId`
布局：
- 左侧：章节 PDF viewer（源为 chapter file endpoint）
- 右侧：对话（scope 固定为 chapter）

顶部/侧边应明确显示：
- 当前章节标题
- scope 标签：`本章模式`（并提供“切换到全书模式”的入口可选）

---

## 12. 降级与容灾策略（确保可用性）

> 你的核心诉求是“其他 PDF 不加载”。因此降级要谨慎：只在明确失败时触发，并且让用户知道“已降级到整本 PDF”。

建议容灾顺序（章节阅读页）：
1. 首选：章节切片 PDF
2. 若返回 `CHAPTER_PDF_GENERATING` → 提示等待/重试，不降级
3. 若返回 `CHAPTER_PDF_MISSING`（或 404 但 chapters list 存在）：
   - 允许按钮“临时使用整本阅读（仅显示该章节页）”
   - 降级后：仍然 scope=chapter（检索范围不变），但 PDF 加载是整本

这样可以兼顾“严格模式”和“可用性”。

---

## 13. 会话与消息模型（useSession / 持久化）

### 13.1 推荐策略：同一本书一个 session，消息携带 scope
理由：
- 学习轨迹连续（孩子从全书切到某章，不丢对话上下文）
- 统计更自然（这本书学了多久、完成了哪些章节）
- 前端不需要频繁创建 session

消息记录建议（后端 Message 表或结构）：
- `sessionId`
- `role`
- `content`
- `scopeType: "document" | "chapter"`
- `chapterId?: string`
- `createdAt`

前端 `useSession`/`useChat` 的注入点：
- 页面决定 `scope`
- Hook 只根据 scope 调用 ask service，并把 scope 写入消息

### 13.2 替代策略：每章一个 session（不推荐默认）
优点：章节对话隔离更彻底  
缺点：session 数量膨胀，跨章回看割裂

---

## 14. 检索过滤的工程细节（后端）

### 14.1 元数据要求（写入向量库时）
每个 chunk 至少具备：
- `documentId`
- `chapterId`（推荐）
- `pageNumber`（可选，但对高亮/引用很有价值）

### 14.2 过滤策略
- scope=document：filter `documentId`
- scope=chapter：filter `documentId + chapterId`

注意事项：
- 不要用 `chapter_title` 当唯一标识（标题可能重复）
- 若历史数据没有 `chapterId`：
  - 短期：用 `pageNumber between startPage/endPage`
  - 长期：补全向量元数据（可通过重建索引任务）

---

## 15. 任务拆分（可直接落 dev-tasks）

### Backend
- 增加 Chapter 数据模型与迁移
- 增加 chapters list API
- 增加 chapter file streaming API
- ingestion 扩展：章节识别与章节切片生成（含失败重试/缓存）
- ask 扩展：scope 解析与检索 filter（document/chapter）
- 统一错误码与拦截输出（覆盖新增错误场景）

### Frontend
- 新增模式选择页（路由接入现有书架入口）
- 新增章节列表页（状态：ready/generating/unavailable）
- 新增章节阅读页（PDF 源切换 + 对话 scope=chapter）
- 扩展 ask service 支持 scope
- Hook 调整：session 与消息记录 scope（避免串上下文）
- 容灾降级 UI（显式提示降级原因与模式）

---

## 16. 验收标准（Definition of Done）

- 点击一本书后不再直接进入全篇阅读，而是先出现“全篇/章节”选择
- 章节阅读模式下，网络请求只拉取章节 PDF（后端切片方案 B）
- 章节阅读模式下，右侧问答默认只检索当前章节
- 章节列表与章节阅读具备稳定错误态与重试，不出现“无响应/空白页”
- 全篇阅读路径完全不受影响（兼容现状）
