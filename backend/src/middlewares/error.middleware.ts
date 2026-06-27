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

  // 其他错误处理
  const status = err.status || 500;
  const message = err.message || '服务器内部错误';

  res.status(status).json({
    message,
    status,
  });
};
