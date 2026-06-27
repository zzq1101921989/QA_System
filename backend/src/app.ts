import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册业务路由
app.use('/api', apiRoutes);

// 健康检查路由 (Health Check)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'RAG QA System is running',
    timestamp: new Date().toISOString()
  });
});

// 启动服务
app.listen(port, () => {
  console.log(`[Server] Server is running at http://localhost:${port}`);
  console.log(`[Server] Health check: http://localhost:${port}/health`);
});
