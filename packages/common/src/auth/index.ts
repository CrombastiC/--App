/**
 * 用户信息
 */
export interface User {
  id: string;
  username: string;
  phone?: string;
  avatar?: string | null;
  balance: number;
  integral: number;
  role?: 'user' | 'admin';
}

/**
 * 用户个人资料
 */
export interface UserProfile extends User {
  birthday?: string | null;
  gender: number; // 0: 男, 1: 女, 2: 保密
  couponCount: number;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  phone: string;
  password: string;
  username: string;
}

/**
 * 注册响应数据
 */
export interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: User;
}

/**
 * Token 刷新响应
 */
export interface TokenPair {
  token: string;
  refreshToken: string;
}
