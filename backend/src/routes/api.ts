import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { ChatController } from '../controllers/chat.controller';

const router = Router();

// 实例化 Controller
const documentController = new DocumentController();
const chatController = new ChatController();

/**
 * 文档管理相关路由
 */
router.post('/documents/upload', (req, res, next) => documentController.upload(req, res, next));

/**
 * 问答检索相关路由
 */
router.post('/chat/ask', (req, res, next) => chatController.ask(req, res, next));

export default router;
