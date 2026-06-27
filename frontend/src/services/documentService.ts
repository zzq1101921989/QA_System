import request from '../api/request';
import type { Document } from '../types/chat';

export const documentService = {
  /**
   * 上传 PDF 文档
   * @param file 文件对象
   * @param onProgress 上传进度回调
   * @returns 上传成功后的文档信息
   */
  async upload(file: File, onProgress?: (percent: number) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    return request.post<any, Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
};
