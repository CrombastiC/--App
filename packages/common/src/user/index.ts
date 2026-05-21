import { User } from '../auth';

/**
 * 更新用户信息请求
 */
export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  gender?: number; // 0: 男, 1: 女, 2: 保密
  birthday?: string;
}

/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  orderCount: number;
  favoriteCount: number;
  couponCount: number;
  points: number;
}

/**
 * 余额充值/扣除请求
 */
export interface RechargeRequest {
  balance: number;
  giveBalance: number;
  isRecharge: boolean; // true: 充值, false: 扣除
}

/**
 * 充值记录项
 */
export interface TopUpRecord {
  balance: number;
  giveBalance: number;
  totalBalance: number;
  createdAt: string;
}

/**
 * 签到状态响应
 */
export interface CheckInStatus {
  isCheckIn: boolean;
  streak: number;
}
