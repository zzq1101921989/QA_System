# RAG QA System 🤖

基于 Node.js 和 React 构建的现代 RAG（检索增强生成）知识库系统。支持 PDF 文档上传、语义分块、向量化存储及智能化问答。

## 🌟 核心特性

- **高效摄入**: 支持多页 PDF 上传，自动进行语义化分块 (Chunking)。
- **精准检索**: 集成 LangChain 与 ChromaDB，实现基于向量相似度的上下文召回。
- **现代 UI**: 采用工业级极简美学设计，支持深色模式与完美的移动端自适应。
- **前后端分离**: 结构清晰，逻辑解耦，易于扩展。

## 🏗 项目结构

- **`backend/`**: 基于 Express & TypeScript 的服务端。
  - 使用 LangChain.js 编排 RAG 链路。
  - 使用 Chroma 作为本地向量数据库。
  - 使用 OpenAI (text-embedding-3-small) 进行向量化。
- **`frontend/`**: 基于 React 19 & Vite 的客户端。
  - 采用 Tailwind CSS 3 实现原子化样式。
  - 使用 Framer Motion 实现丝滑的交互动画。
  - 响应式设计，完美适配移动端。

## 🚀 快速开始

### 前置要求
- Node.js (>= 18)
- Docker (用于运行 ChromaDB，可选)
- OpenAI API Key

### 1. 环境配置
在 `backend/` 目录下创建 `.env` 文件：
```env
OPENAI_API_KEY=your_key_here
CHROMA_URL=http://localhost:8000
PORT=3000
```

### 2. 启动向量数据库 (Chroma)
确保本地 ChromaDB 服务已启动：
```bash
# 如果使用 Docker
docker run -p 8000:8000 chromadb/chroma
```

### 3. 运行项目
建议在两个独立的终端中运行：

**启动后端:**
```bash
cd backend
npm install
npm run dev
```

**启动前端:**
```bash
cd frontend
npm install
npm run dev
```

## 🛠 开发规范

- **类型安全**: 全量 TypeScript 覆盖，严禁使用 `any`。
- **架构**: 后端遵循 Controller-Service 分层；前端业务逻辑抽离至 Custom Hooks。
- **文档**: 开发相关指令请参考项目根目录下的 `CLAUDE.md`。

---
Made with ❤️ for AI-native workflows.
