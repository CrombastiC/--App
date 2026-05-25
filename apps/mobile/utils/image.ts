import { API_CONFIG } from '@/config/api.config';

/**
 * 将图片路径转为完整的可访问 URL
 * - 相对路径 "/uploads/123.jpg" → 拼接 baseURL
 * - localhost URL "http://localhost:5000/uploads/..." → 替换为实际 baseURL
 * - 其他 http URL → 原样返回
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  // localhost URL 无法在手机端访问，提取路径部分重新拼接
  if (url.includes('localhost')) {
    try {
      const parsed = new URL(url);
      return `${API_CONFIG.baseURL}${parsed.pathname}`;
    } catch {
      return url;
    }
  }
  if (url.startsWith('http')) return url;
  return `${API_CONFIG.baseURL}${url}`;
}
