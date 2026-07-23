# RAG QA System 🤖

基于 Node.js、Python 和 React 构建的现代 RAG（检索增强生成）知识库系统。支持 PDF/Word/Excel 文档上传、智能解析、语义分块、向量化存储及智能化问答。

## 🌟 核心特性

### 1. 智能文档处理 ✅（已实现）
- **PDF 解析**: 集成 OpenDataLoader PDF（Java 引擎，OmniDocBench 0.831 精度），支持 hybrid AI 增强模式（0.907 精度）。
- **Office 解析**: Word / Excel 使用 Microsoft MarkItDown 转 Markdown。
- **语义分块**: 基于 LangChain `RecursiveCharacterTextSplitter.fromLanguage('markdown')` 的语义感知分块。
- **分批向量化**: 适配阿里云百炼 DashScope API 限制，自动分批（batchSize=6）调用 `text-embedding-v4` 入库。
- **文档管理**: 支持文档上传、自动解析、向量化入库、并展示已入库文档列表。

### 2. 文档主动分析 ✅（已实现）
- **自动摘要**: 上传后由 LLM 自动生成不超过 100 字符的精炼摘要。
- **关键词提取**: 自动提取 3-5 个核心关键词，并以标签形式在侧边栏展示。
- **层级大纲**: 智能识别文档逻辑结构（如单元 > 课文 > 节），生成可交互的层级大纲。
- **原子化拆分**: 针对目录等密集列表，自动拆分为独立的原子标题，确保大纲清晰。

### 3. 高级检索问答 ✅（已实现）
- **向量检索**: 基于 Chroma `similaritySearch` 从知识库中召回 Top-K 最相关的文档片段。
- **上下文增强**: 将检索结果构建为 Prompt Context，驱动 LLM 生成引用来源的答案。
- **来源追溯**: 回答中自动标注参考的文档片段编号（如"根据片段 1……"），并展示来源文件名。
- **大纲弹窗**: 支持通过点击文档右侧图标，以弹窗形式查看完整的文档层级大纲与摘要。
- **检索日志**: 每次问答自动生成检索日志到 `backend/logs/`，方便调试和审查召回质量。

## 🏗 项目结构

- **`frontend/`**: 基于 React 19 & Vite 的客户端。
  - 采用 Tailwind CSS 4 + `@tailwindcss/vite` 实现原子化样式（无 PostCSS 中间层）。
  - 响应式设计，完美适配移动端与桌面端。
- **`backend/`**: 基于 Express & TypeScript 的调度服务端。
  - 使用 LangChain.js 编排 RAG 链路。
  - 使用 Chroma 作为本地向量数据库。
  - 负责与前端交互及调用 Python 解析服务。
  - `AskService` 实现完整 RAG 流程：向量检索 → Context 构建 → LLM 生成。
  - 每次问答自动保存检索日志到 `logs/` 目录，便于调试召回质量。
- **`python-document2markdown/`**: 基于 FastAPI 的文档解析微服务。
  - PDF → OpenDataLoader PDF（Java 引擎，支持 hybrid AI 增强模式）。
  - Word/Excel → Microsoft MarkItDown。
  - 提供 Dockerfile，支持容器化部署（内置 JRE）。

## 🚀 快速开始

### 前置要求
- Node.js (>= 18)
- Python (>= 3.10)
- **Java 11+**（OpenDataLoader PDF 引擎依赖）
- Docker (用于运行 ChromaDB)
- 阿里云百炼 DashScope API Key

> 项目默认端口配置（见 `backend/.env`）：
> | 服务 | 端口 |
> |---|---|
> | ChromaDB | 1101 |
> | Python 解析微服务 | 8200 |
> | Node.js 后端 | 3000 |
> | React 前端 (Vite HMR) | 5173 |

### 1. 启动向量数据库 (Chroma)
首次创建并运行：
```bash
docker run -d --name chroma --restart unless-stopped -p 1101:8000 chromadb/chroma:latest
```
后续如果容器已存在（容器名冲突），直接启动或重启即可：
```bash
docker start chroma
```
验证：`curl http://localhost:1101/api/v2/heartbeat`，返回 `{}` 即正常。

### 2. 运行解析服务 (Python)
```bash
cd python-document2markdown

# 确保已安装 Java 11+（OpenDataLoader PDF 引擎依赖）
java -version

python -m venv venv
# Windows Git Bash
source venv/Scripts/activate
# Windows CMD
# venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8200
```
> 首次运行时 OpenDataLoader PDF 会下载 Java 引擎 JAR 包（约 50MB），请保持网络通畅。
> 也可使用 Docker 一键部署（内置 JRE，无需宿主机安装 Java）：
> ```bash
> docker build -t qa-parser .
> docker run -d --name qa-parser -p 8200:8200 qa-parser
> ```
验证：`curl http://localhost:8200/health`，返回 `{"status":"ok"}` 即正常。

### 3. 运行调度后端 (Node.js)
```bash
cd backend

# 1. 首次安装，原生模块编译会被 pnpm 拦截
pnpm install

# 2. 批准原生模块（better-sqlite3 等）执行编译脚本
pnpm approve-builds

# 3. 重新安装以触发 .node 绑定文件编译
pnpm install --force

# 4. 生成 Prisma Client
npx prisma generate

npm run dev
```
> 需在 `backend/.env` 中配置 `DASHSCOPE_API_KEY` 和 `DASHSCOPE_BASE_URL`（使用阿里云百炼兼容 OpenAI 接口）。`.env` 已预置 `CHROMA_URL`、`PYTHON_PARSER_URL`、`PORT`，按需修改。
> 每次问答的检索结果将自动保存到 `backend/logs/` 目录供调试参考。

### 4. 运行前端 (React)
```bash
cd frontend
npm install
npm run dev
```
浏览器访问 `http://localhost:5173`。

## 开发路线

### Phase 1 — 检索质量提升（进行中）

| 任务 | 说明 | 优先级 |
|------|------|--------|
| 对话记忆 ✅ | 基于 Prisma + SQLite 的会话持久化，前端 API 驱动（不再使用 localStorage） | — |
| 查询重写 ✅ | 追问时结合历史重写为完整的独立问题再检索 | — |
| HyDE 检索 ✅ | 先让 LLM 生成「假设答案」，再用假答案搜向量库，提高召回相关性 | — |
| 多路召回 | 同时用向量检索 + 关键词检索，合并排序提高覆盖率 | ⬆️ |
| PDF 解析升级 ✅ | 从 markitdown(0.589) → OpenDataLoader PDF(0.831)，支持 hybrid AI 模式(0.907) | — |

### Phase 2 — 新奇功能探索

| 领域 | 方向 | 说明 |
|------|------|------|
| 文档主动分析 | 上传后自动生成摘要、关键词标签、文档大纲 | 把文档变「活」 |
| **刷题打卡** | **基于知识库自动生成选择题/填空题，每日刷题打卡** | **学习效果验证** |
| 可视化溯源 | 回答中标注引用来源，鼠标悬浮显示原文片段 | 答案可追溯、可信 |

### Phase 3 — 产品化打磨

| 方向 | 说明 |
|------|------|
| 流式输出 | SSE 逐字返回，前端打字机效果 |
| 多模态解析 | 表格结构化提取、图片 OCR |
| Namespace 隔离 | 按知识领域分空间 |

## 🛠 开发规范

- **分层架构**: 
  - 前端：Page → Hook → Service → API。
  - 后端：Controller → Service → Repository。
- **类型安全**: 全量 TypeScript/Python Type Hints 覆盖。
- **文档**: 开发相关指令请参考项目根目录下的 `CLAUDE.md`。

---
Made with ❤️ for AI-native workflows.
