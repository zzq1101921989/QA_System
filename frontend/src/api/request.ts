import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';


const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000, // 上传可能较慢，设置 1 分钟超时
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里注入 Token 等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 根据后端约定的数据结构进行解包
    return response.data;
  },
  (error) => {
    // 统一错误处理
    const message = error.response?.data?.message || '请求失败，请稍后重试';
    console.error('[API Error]:', message);
    return Promise.reject(new Error(message));
  }
);

export default request;
