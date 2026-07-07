import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { ChatController } from '../controllers/chat.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// 实例化 Controller
const documentController = new DocumentController();
const chatController = new ChatController();

/**
 * 文档管理相关路由
 */
router.post('/documents/upload', upload.single('file'), (req, res, next) => documentController.upload(req, res, next));
router.get('/documents', (req, res, next) => documentController.list(req, res, next));

/**
 * 问答检索相关路由
 */
router.post('/documents/:documentId/ask', (req, res, next) => chatController.ask(req, res, next));

/**
 * 会话管理相关路由
 */
router.get('/sessions', (req, res, next) => chatController.getSessions(req, res, next));
router.get('/sessions/:sessionId/history', (req, res, next) => chatController.getSessionHistory(req, res, next));
router.post('/sessions/create', (req, res, next) => chatController.createSession(req, res, next));
router.delete('/sessions/:sessionId', (req, res, next) => chatController.deleteSession(req, res, next));

export default router;
