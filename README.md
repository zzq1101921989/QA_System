# RAG QA System 🤖

基于 Node.js、Python 和 React 构建的现代 RAG（检索增强生成）知识库系统。支持 PDF/Word/Excel 文档上传、智能解析、语义分块、向量化存储及智能化问答。

## 🌟 核心特性

### 1. 智能文档处理 (Intelligent Document Processing)
- **统一转换**: 集成 `MarkItDown` 实现 PDF、Word、Excel 到 Markdown 的高保真转换（已实现）。
- **语义分块**: 基于 Markdown 结构的智能分块策略，保留文档层级与上下文关联。
- **高效索引**: 优化的向量化流程与多索引构建，确保检索的高性能。

### 2. 高级检索问答 (Advanced Retrieval QA)
- **多查询扩展 (MQE)**: 自动生成多维度查询语句，大幅提升长尾问题的召回率。
- **假设文档嵌入 (HyDE)**: 通过生成模拟回答改善语义搜索的检索精度。
- **上下文感知**: 深度理解对话历史，实现精准的连续问答体验。

### 3. 多层次记忆管理 (Multi-level Memory)
- **工作记忆 (Working Memory)**: 实时管理当前学习任务和即时上下文。
- **情景记忆 (Episodic Memory)**: 记录用户学习事件、查询历史与交互轨迹。
- **语义记忆 (Semantic Memory)**: 沉淀核心概念知识、领域理解与事实库。
- **感知记忆 (Perceptual Memory)**: 处理文档原始特征及多模态信息的低层级表征。

### 4. 个性化学习支持 (Personalized Learning)
- **精准推荐**: 基于用户学习历史与记忆曲线的个性化内容推荐。
- **记忆优化**: 模拟人类记忆机制，实现知识整合与选择性遗忘。
- **进度追踪**: 自动化生成学习报告，可视化展现知识掌握进度。

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
