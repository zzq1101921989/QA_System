# RAG QA System 🤖

基于 Node.js、Python 和 React 构建的现代 RAG（检索增强生成）知识库系统。支持 PDF/Word/Excel 文档上传、智能解析、语义分块、向量化存储及智能化问答。

## 🌟 核心特性

### 1. 智能文档处理 ✅（已实现）
- **统一转换**: 集成 Python `MarkItDown` 微服务实现 PDF、Word、Excel 到 Markdown 的高保真转换。
- **语义分块**: 基于 LangChain `RecursiveCharacterTextSplitter.fromLanguage('markdown')` 的语义感知分块。
- **分批向量化**: 适配阿里云百炼 DashScope API 限制，自动分批（batchSize=6）调用 `text-embedding-v4` 入库。
- **文档管理**: 支持文档上传、自动解析、向量化入库、并展示已入库文档列表。

### 2. 高级检索问答 🚧（开发中）
- **语义检索**: 基于向量相似度搜索，从知识库中召回相关文档片段。
- **上下文增强**: 将检索结果构建为 Prompt Context，驱动 LLM 生成引用来源的答案。

## 🏗 项目结构

- **`frontend/`**: 基于 React 19 & Vite 的客户端。
  - 采用 Tailwind CSS 4 + `@tailwindcss/vite` 实现原子化样式（无 PostCSS 中间层）。
  - 响应式设计，完美适配移动端与桌面端。
- **`backend/`**: 基于 Express & TypeScript 的调度服务端。
  - 使用 LangChain.js 编排 RAG 链路。
  - 使用 Chroma 作为本地向量数据库。
  - 负责与前端交互及调用 Python 解析服务。
- **`python-document2markdown/`**: 基于 FastAPI 的文档解析微服务。
  - 专门负责将 PDF, Word, Excel 转换为结构化的 Markdown。
  - 预留集成 `marker-pdf`、`mammoth` 等高性能解析库。

## 🚀 快速开始

### 前置要求
- Node.js (>= 18)
- Python (>= 3.9)
- Docker (用于运行 ChromaDB)
- OpenAI API Key

> 项目默认端口配置（见 `backend/.env`）：
> | 服务 | 端口 |
> |---|---|
> | ChromaDB | 1101 |
> | Python 解析微服务 | 8200 |
> | Node.js 后端 | 3000 |
> | React 前端 (Vite HMR) | 5173 |

### 1. 启动向量数据库 (Chroma)
```bash
docker run -d --name chroma --restart unless-stopped -p 1101:8000 chromadb/chroma:latest
```
验证：`curl http://localhost:1101/api/v2/heartbeat`，返回 `{}` 即正常。

### 2. 运行解析服务 (Python)
```bash
cd python-document2markdown
python -m venv venv
# Windows Git Bash
source venv/Scripts/activate
# Windows CMD
# venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8200
```
验证：`curl http://localhost:8200/health`，返回 `{"status":"ok"}` 即正常。

### 3. 运行调度后端 (Node.js)
```bash
cd backend
npm install
npm run dev
```
> 需在 `backend/.env` 中配置 `OPENAI_API_KEY`。`.env` 已预置 `CHROMA_URL`、`PYTHON_PARSER_URL`、`PORT`，按需修改。

### 4. 运行前端 (React)
```bash
cd frontend
npm install
npm run dev
```
浏览器访问 `http://localhost:5173`。

## 🛠 开发规范

- **分层架构**: 
  - 前端：Page → Hook → Service → API。
  - 后端：Controller → Service → Repository。
- **类型安全**: 全量 TypeScript/Python Type Hints 覆盖。
- **文档**: 开发相关指令请参考项目根目录下的 `CLAUDE.md`。

---
Made with ❤️ for AI-native workflows.
