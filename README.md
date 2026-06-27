# RAG QA System 🤖

基于 Node.js、Python 和 React 构建的现代 RAG（检索增强生成）知识库系统。支持 PDF/Word/Excel 文档上传、智能解析、语义分块、向量化存储及智能化问答。

## 🌟 核心特性

- **多模态摄入**: 支持 PDF、Word、Excel 等多种格式文档的语义化摄入。
- **混合解析架构**: 采用 Python 处理复杂文档解析，Node.js 负责 RAG 链路编排，兼顾性能与准确性。
- **精准检索**: 集成 LangChain 与 ChromaDB，实现基于向量相似度的上下文召回。
- **现代 UI**: 工业级极简美学设计，支持深色模式与完美的移动端自适应。

## 🏗 项目结构

- **`frontend/`**: 基于 React 19 & Vite 的客户端。
  - 采用 Tailwind CSS 3 实现原子化样式。
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

### 1. 启动向量数据库 (Chroma)
```bash
docker run -p 8000:8000 chromadb/chroma
```

### 2. 运行解析服务 (Python)
```bash
cd python-document2markdown
python -m venv venv
source venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8200
```

### 3. 运行调度后端 (Node.js)
在 `backend/` 目录下创建 `.env` 配置 `OPENAI_API_KEY` 等，然后启动：
```bash
cd backend
npm install
npm run dev
```

### 4. 运行前端 (React)
```bash
cd frontend
npm install
npm run dev
```

## 🛠 开发规范

- **分层架构**: 
  - 前端：Page → Hook → Service → API。
  - 后端：Controller → Service → Repository。
- **类型安全**: 全量 TypeScript/Python Type Hints 覆盖。
- **文档**: 开发相关指令请参考项目根目录下的 `CLAUDE.md`。

---
Made with ❤️ for AI-native workflows.
