import axios from 'axios';
import { message } from 'antd';
import { getToken, clearAuth } from './auth';

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
