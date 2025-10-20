/**
 * 用户服务
 * 处理用户信息相关操作
 */
import request from '@/request';
import { User } from './auth.service';

// ==================== 数据类型定义 ====================

/**
 * 更新用户信息请求
 */
export interface UpdateProfileRequest {
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
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

// ==================== 用户服务 ====================

export const userService = {
  /**
   * 获取当前用户信息
   * @returns [error, user]
   */
  getProfile: () => {
    return request.get<User>('/api/user/profile');
  },

  /**
   * 更新用户信息
   * @param data 更新的信息
   * @returns [error, user]
   */
  updateProfile: (data: UpdateProfileRequest) => {
    return request.put<User>('/api/user/profile', data);
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
