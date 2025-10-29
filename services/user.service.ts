/**
 * 用户服务
 * 处理用户信息相关操作
 */
import request from '@/request';
import { User, UserProfile } from './auth.service';

// ==================== 数据类型定义 ====================

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
  orderCount: number;      // 订单数量
  favoriteCount: number;   // 收藏数量
  couponCount: number;     // 优惠券数量
  points: number;          // 积分
}

/**
 * 充值记录项
 */
export interface TopUpRecord {
  balance: number;         // 充值金额
  giveBalance: string;     // 赠送金额
  totalBalance: number;    // 总金额（充值后的余额）
  createdAt: string;       // 创建时间
}

/**
 * 充值记录响应
 */
export interface TopUpRecordsResponse {
  code: number;
  data: TopUpRecord[];
}

/**
 * 优惠券
 * @param couponId 优惠券ID
 * @param couponName 优惠券名称
 * @param couponAmount 优惠券金额
 * @param consumeMoney 使用条件
 * @param couponUseTime 有效期
 * @param status 使用状态
 */
export interface Coupon {
  couponId: string;
  couponName: string;
  couponAmount: string;
  consumeMoney: string;
  couponUseTime: string;
  status: 'unused' | 'used'; // unused: 未使用, used: 已使用
}



// ==================== 用户服务 ====================

export const userService = {
  /**
   * 获取当前用户信息
   * @returns [error, user]
   */
  getProfile: () => {
    return request.get<UserProfile>('/api/users/getUserInfo');
  },

  /**
   * 更新用户信息
   * @param data 更新的信息
   * @returns [error, user]
   */
  updateProfile: (data: UpdateProfileRequest) => {
    return request.put<User>('/api/users/update', data);
  },

  /**
   * 修改密码
   * @param data 密码信息
   * @returns [error, response]
   */
  changePassword: (data: ChangePasswordRequest) => {
    return request.post<{ message: string }>('/api/user/change-password', data);
  },

  /**
   * 上传头像
   * @param file 图片文件
   * @returns [error, response]
   */
  uploadAvatar: (file: any) => {
    return request.upload<{ url: string }>('/api/user/avatar', file);
  },

  /**
   * 获取用户统计信息
   * @returns [error, stats]
   */
  getStats: () => {
    return request.get<UserStats>('/api/user/stats');
  },

  /**
   * 注销账户
   * @returns [error, response]
   */
  deleteAccount: () => {
    return request.delete<{ message: string }>('/api/user/account');
  },

  /**
   * 余额充值与扣除
   * 返回更新后的完整用户信息
   * 响应格式: { code: 0, data: User }
   * @param balance 充值金额
   * @param giveBalance 赠送金额
   */
  rechargeBalance: (balance: number, giveBalance: number, isRecharge: boolean) => {
    return request.post<{ code: number; data: User }>('/api/users/rechargeAndDeduct', { balance, giveBalance, isRecharge });
  },

  /**
   * 获取充值记录
   * 响应格式: { code: 0, data: TopUpRecord[] }
   */
  getTopUpRecords: () => {
    return request.get<TopUpRecordsResponse>('/api/users/getRechargeRecord');
  },

  /**
   * 获取用户优惠券列表
   * @param isExpired 是否过期 
   */
  getCoupons: (isExpired?: boolean) => {
    return request.post<Coupon[]>('/api/coupon/getCouponList', { isExpired });
  },

  /**
   * 获取金额卡片
   */
  getTopUpOptions: () => {
    return request.get('/api/money/getMoneyList');
  }


};

// ==================== 使用示例 ====================
/*
// 1. 获取用户信息
const { data: user, loading } = useRequest(() => userService.getProfile());

// 2. 更新用户信息
const handleUpdate = async () => {
  const [error, user] = await userService.updateProfile({
    nickname: '新昵称',
    email: 'new@example.com',
  });

  if (!error) {
    Alert.alert('成功', '更新成功');
  }
};

// 3. 修改密码
const handleChangePassword = async () => {
  const [error] = await userService.changePassword({
    oldPassword: '123456',
    newPassword: '654321',
  });

  if (!error) {
    Alert.alert('成功', '密码修改成功');
  }
};

// 4. 上传头像
const handleUploadAvatar = async (imageUri: string) => {
  const file = {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  };

  const [error, data] = await userService.uploadAvatar(file);

  if (!error) {
    console.log('头像URL:', data.url);
  }
};
*/
