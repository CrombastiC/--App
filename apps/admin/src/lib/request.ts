import axios from 'axios';
import { message } from 'antd';
import { getToken, clearAuth } from './auth';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截：注入 token
request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：统一错误处理
request.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || '请求失败';

    if (status === 401) {
      clearAuth();
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
    } else {
      message.error(msg);
    }

    return Promise.reject(error);
  },
);

export default request;

/** 解包后端统一响应，业务页面直接获得 data。 */
export const api = {
  async get<T>(url: string, config?: Parameters<typeof request.get>[1]) {
    const response = await request.get<unknown, ApiResponse<T>>(url, config);
    return response.data;
  },
  async post<T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof request.post>[2],
  ) {
    const response = await request.post<unknown, ApiResponse<T>>(
      url,
      data,
      config,
    );
    return response.data;
  },
  async put<T>(url: string, data?: unknown) {
    const response = await request.put<unknown, ApiResponse<T>>(url, data);
    return response.data;
  },
  async delete<T>(url: string) {
    const response = await request.delete<unknown, ApiResponse<T>>(url);
    return response.data;
  },
};
