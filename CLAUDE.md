# CLAUDE.md - RAG QA System

本项目是一个基于 Node.js (Backend) 和 React (Frontend) 构建的 RAG (Retrieval-Augmented Generation) 知识库检索系统。

## 🛠 开发指令

### 后端 (Backend)
- **目录**: `backend/`
- **启动开发服务器**: `npm run dev` (使用 nodemon)
- **构建**: `npm run build`
- **启动生产服务器**: `npm start`
- **主要技术栈**: Express, TypeScript, LangChain.js, OpenAI, ChromaDB

### 前端 (Frontend)
- **目录**: `frontend/`
- **启动开发服务器**: `npm run dev` (使用 Vite)
- **构建**: `npm run build`
- **主要技术栈**: React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React

## 🏗 项目结构

```text
QA_System/
├── backend/                # 后端 Express 服务
│   ├── src/
│   │   ├── controllers/    # 路由控制器
│   │   ├── services/       # 核心 RAG 业务逻辑 (Ingestion, Retrieval)
│   │   ├── core/           # 基础设施初始化 (LLM, Chroma)
│   │   └── types/          # 后端类型定义
├── frontend/               # 前端 React 应用
│   ├── src/
│   │   ├── components/     # UI 组件 (原子组件 + 布局组件)
│   │   ├── hooks/          # 业务 Hooks (useChat, useLayout)
│   │   ├── pages/          # 页面模块 (Home)
│   │   └── types/          # 前端类型定义
```

## 📋 代码规范

### 通用
- **语言**: 简体中文 (注释与文档)
- **类型安全**: 严格使用 TypeScript，严禁 `any`。

### 后端规范
- **架构**: 遵循 Controller-Service-Model 分层。
- **原则**: 强制执行单一职责原则 (SRP)，逻辑封装在 Service 类中。
- **API**: 统一前缀 `/api`。

### 前端规范
- **设计风格**: 工业级极简美学 (实验室风)，深色主题。
- **状态管理**: 区分 Server State 与 Local UI State。
- **组件化**: 逻辑抽离至 Custom Hooks，UI 拆分为原子组件。
- **适配**: 必须支持响应式移动端适配。

## ⚙️ 环境配置
- 后端需在 `backend/.env` 中配置 `OPENAI_API_KEY` 和 `CHROMA_URL`。
- 前端通过 Vite Proxy 代理请求至后端 3000 端口。
