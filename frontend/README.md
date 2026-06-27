# RAG 知识库系统 - 前端界面 (Frontend)

本项目是基于 RAG (Retrieval-Augmented Generation) 架构的知识库问答系统前端实现。采用现代前端技术栈，专注于工业级美学与高性能交互体验。

## 🚀 技术栈

- **框架**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite 8](https://vitejs.dev/)
- **样式方案**: [Tailwind CSS v3](https://tailwindcss.com/)
- **动画引擎**: [Framer Motion](https://www.framer.com/motion/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **状态管理**: 自定义 Hooks (useChat, useLayout)
- **网络请求**: [Axios](https://axios-http.com/)

## 🛠️ 核心架构

本项目遵循 **关注点分离 (SoC)** 与 **单一职责原则 (SRP)** 进行重构：

- **逻辑层 (`src/hooks`)**: 
  - `useChat`: 封装所有业务逻辑（文档管理、消息发送、上传状态）。
  - `useLayout`: 封装响应式布局逻辑（移动端检测、侧边栏开关）。
- **布局层 (`src/components`)**: 
  - `DesktopLayout`: 针对 PC 端的固定侧边栏沉浸式布局。
  - `MobileLayout`: 针对移动端的抽屉式导航与触摸优化布局。
- **组件层 (`src/components/common`)**: 
  - 提取了 `Sidebar`、`ChatArea`、`InputBar` 等高度可复用的原子组件。

## 📱 移动端适配

系统支持完美的移动端自适应：
- 桌面端：固定侧边栏 + 分析控制台。
- 移动端：隐藏式抽屉菜单 + 优化后的触摸交互，适配 iPhone/Android 等各种屏幕尺寸。

## 🏁 快速开始

### 1. 安装依赖
在 `frontend` 目录下执行：
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

## 🌐 代理配置
前端已通过 `vite.config.ts` 配置了反向代理，所有以 `/api` 开头的请求将自动转发至后端的 `http://localhost:3000`。

---
**RAG QA System** - *专注于严谨、极简的 AI 交互体验*
