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

## 📊 架构与逻辑现状

### 前端页面布局与逻辑
- **页面布局**: 采用响应式设计 (`DesktopLayout` / `MobileLayout`)，主页面划分侧边栏 (`Sidebar`) 与聊天区 (`ChatArea`)。
- **核心组件**:
  - `DocumentViewer`: 实现双轨高保真预览（底层渲染原始文件，上层按 bbox 坐标叠加高亮）。
  - `ContextModal` / `OutlineModal` / `UploadModal`: 业务弹窗封装，确保极简体验。
- **状态逻辑**: 严格解耦，通过 Custom Hooks (`useChat`, `useDocuments`, `useSession`, `useMessages`) 管理数据流与 API 请求。

### 后端接口完成情况
- **文档管理**: 已实现 `/documents/upload` (上传并入库)、`/documents` (获取列表)、`/documents/:id/file` (文件流式传输)、`DELETE /documents/:documentId` (同步清理库与向量)。
- **会话问答**: 已完成 `/sessions` 的 CRUD 体系及 `/documents/:documentId/ask` (文档流式对话)。
- **代码规范**: 严格执行 Controller → Service → Repository (Prisma) 分层架构，无越级调用。

### 数据库与向量库设计
- **关系型数据库 (SQLite / Prisma)**:
  - `Session` & `Message`: 持久化对话流，记录历史。
  - `Document`: 存储核心元数据，包括状态、大纲/关键词 (JSON)、页面元素/坐标 (JSON)、原文件路径 (`filePath`) 和类型 (`mimeType`)。
- **向量数据库 (ChromaDB + LangChain)**:
  - **分块策略**: 两阶段切分（Markdown 结构切分 -> 细粒度递归字符切分），保留原始文档结构。
  - **元数据关联**: Chunk 中注入 `documentId`, `chapter_title`, `source_file`，增强检索准确率。
  - **安全入库**: 适配 DashScope 限制，按 Batch Size=6 分批向 Chroma 写入。

