/**
 * 用户认证服务
 * 处理登录、注册、Token管理等
 */
import request from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== 数据类型定义 ====================

/**
 * 用户信息
 */
export interface User {
  id: string;
  username: string;
  phone?: string;
  avatar?: string;
  balance?: number;    // 余额
  integral?: number;   // 积分
}

/**
 * 用户个人资料
 */
export interface UserProfile extends User {
  birthday?: string;
  gender?: string;
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
 * 响应格式: { code: 0, token: string, user: User }
 */
export interface LoginResponse {
  code: number;
  token: string;
  user: User;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  phone: string;
  password: string;
  username: string; // 昵称
}

/**
 * 注册响应数据
 * 响应格式: { code: 0, token: string, user: User }
 */
export interface RegisterResponse {
  code: number;
  token: string;
  user: User;
}

// 以下接口暂时不可用，需要接入短信平台后启用
// /**
//  * 发送验证码请求
//  */
// export interface SendCodeRequest {
//   phone: string;
//   type: 'register' | 'login' | 'reset'; // 验证码类型
// }

// /**
//  * 重置密码请求
//  */
// export interface ResetPasswordRequest {
//   phone: string;
//   code: string;
//   newPassword: string;
// }

// ==================== 认证服务 ====================

export const authService = {
  /**
   * 用户登录
   * @param data 登录信息
   * @returns [error, response]
   */
  login: (data: LoginRequest) => {
    return request.post<LoginResponse>('/api/users/login', data);
  },

  /**
   * 用户注册
   * @param data 注册信息
   * @returns [error, response]
   */
  register: (data: RegisterRequest) => {
    return request.post<RegisterResponse>('/api/users/register', data);
  },

  // 以下接口暂时不可用，需要接入短信平台后启用
  // /**
  //  * 发送验证码
  //  * @param data 手机号和类型
  //  * @returns [error, response]
  //  */
  // sendCode: (data: SendCodeRequest) => {
  //   return request.post<{ message: string }>('/api/auth/send-code', data);
  // },

  // /**
  //  * 重置密码
  //  * @param data 重置密码信息
  //  * @returns [error, response]
  //  */
  // resetPassword: (data: ResetPasswordRequest) => {
  //   return request.post<{ message: string }>('/api/auth/reset-password', data);
  // },

  /**
   * 退出登录
   * @returns [error, response]
   */
  logout: () => {
    return request.post<{ message: string }>('/api/auth/logout');
  },

  /**
   * 刷新Token
   * @param refreshToken 刷新令牌
   * @returns [error, response]
   */
  refreshToken: (refreshToken: string) => {
    return request.post<{ token: string; refreshToken: string }>(
      '/api/auth/refresh-token',
      { refreshToken }
    );
  },

  /**
   * 验证Token是否有效
   * @returns [error, response]
   */
  verifyToken: () => {
    return request.get<{ valid: boolean }>('/api/auth/verify');
  },
};

// ==================== Token 管理工具 ====================

export const tokenManager = {
  /**
   * 保存登录信息
   */
  async saveLoginInfo(data: LoginResponse) {
    try {
      // 登录响应: { code: 0, token: string, user: User }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userId', data.user.id);
      await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('保存登录信息失败:', error);
      return false;
    }
  },

  /**
   * 获取Token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('获取Token失败:', error);
      return null;
    }
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<User | null> {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  /**
   * 更新用户信息（部分更新或完整更新）
   */
  async updateUserInfo(updatedInfo: Partial<User> | User): Promise<boolean> {
    try {
      const currentInfo = await this.getUserInfo();
      if (!currentInfo) {
        console.error('未找到当前用户信息');
        return false;
      }
      
      // 合并更新
      const newInfo = { ...currentInfo, ...updatedInfo };
      await AsyncStorage.setItem('userInfo', JSON.stringify(newInfo));
      return true;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return false;
    }
  },

  /**
   * 清除登录信息
   */
  async clearLoginInfo() {
    try {
      await AsyncStorage.multiRemove([
        'token',
        'userId',
        'userInfo',
      ]);
      return true;
    } catch (error) {
      console.error('清除登录信息失败:', error);
      return false;
    }
  },

  /**
   * 检查是否已登录
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  },
};

// ==================== 使用示例 ====================
/*
// 1. 登录
const handleLogin = async () => {
  const [error, data] = await authService.login({
    username: 'user@example.com',
    password: '123456',
  });

  if (error) {
    Alert.alert('错误', '登录失败');
    return;
  }

  // 保存登录信息
  await tokenManager.saveLoginInfo(data);
  Alert.alert('成功', '登录成功');
};

// 2. 注册
const handleRegister = async () => {
  const [error, data] = await authService.register({
    username: 'newuser',
    password: '123456',
    email: 'user@example.com',
    phone: '13800138000',
  });

  if (!error) {
    await tokenManager.saveLoginInfo(data);
  }
};

// 3. 发送验证码
const handleSendCode = async () => {
  const [error] = await authService.sendCode({
    phone: '13800138000',
    type: 'register',
  });

  if (!error) {
    Alert.alert('成功', '验证码已发送');
  }
};

// 4. 退出登录
const handleLogout = async () => {
  await authService.logout();
  await tokenManager.clearLoginInfo();
  // 跳转到登录页
};

// 5. 使用 useRequest Hook
import { useRequest } from '@/hooks/use-request';

function LoginScreen() {
  const { runAsync: login, loading } = useRequest(
    (data: LoginRequest) => authService.login(data),
    { manual: true }
  );

  const handleLogin = async () => {
    const [error, data] = await login({
      username: 'test',
      password: '123456',
    });

    if (!error) {
      await tokenManager.saveLoginInfo(data);
    }
  };

  return <Button title="登录" onPress={handleLogin} disabled={loading} />;
}
*/
