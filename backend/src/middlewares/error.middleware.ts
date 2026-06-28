import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 处理 Multer 文件过大错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        message: '文件体积过大，请上传 50MB 以内的文档 (PDF/Word/Excel)',
      });
      return;
    }
  }

  // 打印错误堆栈到控制台，方便后端调试
  console.error(`[ErrorMiddleware] 捕获到异常:`, err.message || err);
  if (err.stack) {
    // 仅在非生产环境或需要详细调试时打印堆栈
    console.error(err.stack);
  }

  // 其他错误处理
  const status = err.status || 500;
  const message = err.message || '服务器内部错误';

  res.status(status).json({
    message,
    status,
  });
};
