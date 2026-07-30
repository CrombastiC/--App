/**
 * 用户服务
 * 处理用户信息相关操作
 */
import request from '@/request';
import type {
  ChangePasswordRequest,
  CheckInResult,
  CheckInStatus,
  Coupon,
  GiftCardRedemption,
  MoneyOption,
  TopUpRecord,
  UpdateProfileRequest,
  User,
  UserProfile,
  UserStats,
} from '@orderfood/common';

// ==================== 数据类型定义 ====================
export type TopUpRecordsResponse = TopUpRecord[];
export type {
  ChangePasswordRequest,
  Coupon,
  TopUpRecord,
  UpdateProfileRequest,
  UserStats,
} from '@orderfood/common';

// ==================== 用户服务 ====================

export const userService = {
  /**
   * 获取当前用户信息
   * @returns [error, user]
   */
  getProfile: () => {
    return request.get<UserProfile>('/api/user/getUserInfo');
  },

  /**
   * 更新用户信息
   * @param data 更新的信息
   * @returns [error, user]
   */
  updateProfile: (data: UpdateProfileRequest) => {
    return request.put<User>('/api/user/update', data);
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
  uploadAvatar: (file: { uri: string; type: string; name: string }) => {
    return request.upload<{ url: string }>('/api/upload/uploadImg', file);
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
    return request.post<User>('/api/user/rechargeAndDeduct', { balance, giveBalance, isRecharge });
  },

  /**
   * 获取充值记录
   * 响应格式: { code: 0, data: TopUpRecord[] }
   */
  getTopUpRecords: () => {
    return request.get<TopUpRecordsResponse>('/api/user/getRechargeRecord');
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
    return request.get<MoneyOption[]>('/api/money/getMoneyList');
  },

  /**
   * 获取签到状态 
   */
  getSignInStatus: () => {
    return request.get<CheckInStatus>('/api/user/getCheckInStatus');
  },

  /**
   * 签到
   */
  signIn: () => {
    return request.post<CheckInResult>('/api/user/checkIn');
  },

  /**
   * 礼品卡兑换
   */
  redeemGiftCard: (code: string) => {
    return request.post<GiftCardRedemption>('/api/user/redeemGiftCard', { code });
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
