# CLAUDE.md - RAG QA System

本项目是一个基于 Node.js (Backend), Python (Parser Service) 和 React (Frontend) 构建的 RAG (Retrieval-Augmented Generation) 知识库检索系统。

## 🛠 开发指令

### 后端 (Backend - Node.js)
- **目录**: `backend/`
- **启动开发服务器**: `npm run dev`
- **构建**: `npm run build`
- **Prisma**: `npx prisma generate` (生成客户端), `npx prisma db push` (同步数据库)
- **主要技术栈**: Express, TypeScript, LangChain.js, Prisma (SQLite), DashScope (LLM/Embedding), ChromaDB

### 解析服务 (Parser - Python)
- **目录**: `python-document2markdown/`
- **启动服务**: `uvicorn app.main:app --reload --port 8200`
- **主要技术栈**: FastAPI, OpenDataLoader PDF (Java 引擎), MarkItDown

### 前端 (Frontend - React)
- **目录**: `frontend/`
- **启动开发服务器**: `npm run dev` (Vite)
- **构建**: `npm run build`
- **主要技术栈**: React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide React

## 🏗 项目结构

```text
QA_System/
├── backend/                # Node.js 调度后端
│   ├── src/
│   │   ├── controllers/    # 路由控制器
│   │   ├── services/       # 业务逻辑 (Ask, Ingestion, Memory, Parser)
│   │   ├── core/           # 核心客户端 (LLM, Chroma, Prisma)
│   │   ├── prisma/         # 数据库 Schema 与迁移
│   │   └── logs/           # 检索质量日志
├── frontend/               # React 前端应用
│   ├── src/
│   │   ├── hooks/          # 业务逻辑 Hooks (useChat, useSession, useDocuments)
│   │   ├── pages/          # 页面组件 (Home, Sidebar, ChatArea)
│   │   ├── services/       # API 请求封装
│   │   └── types/          # 全局类型定义
├── python-document2markdown/ # Python 文档解析微服务
│   ├── app/
│   │   ├── services/       # PDF/Word/Excel 解析引擎
│   │   └── main.py         # FastAPI 入口
```

## 📋 代码规范

### 通用
- **语言**: 简体中文 (注释与文档)
- **原则**: 逻辑先行，先更新 `dev-tasks.md` 再开始编码。

### 后端规范
- **架构**: 遵循 Controller → Service → Repository (Prisma) 分层。
- **检索**: 必须记录检索日志到 `logs/` 供质量评估。
- **记忆**: 会话与消息必须通过 Prisma 持久化到 SQLite。

### 前端规范
- **设计风格**: 高达主题 (GUNDAM Theme)，浅蓝色网格背景，工业级极简美学。
- **逻辑抽离**: UI 与逻辑分离，业务逻辑必须封装在 Custom Hooks 中。

## ⚙️ 环境配置
- **后端 (.env)**: `DASHSCOPE_API_KEY`, `CHROMA_URL`, `PYTHON_PARSER_URL`。
- **数据库**: 使用 SQLite，位于 `backend/prisma/dev.db`。
- **端口**: 前端 5173 (Proxy to 3000), 后端 3000, 解析服务 8200, Chroma 1101。
