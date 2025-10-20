/**
 * Services 导出文件
 * 统一导出所有服务
 */

// 认证服务
export { authService, tokenManager } from './auth.service';
export type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse, ResetPasswordRequest, SendCodeRequest, User
} from './auth.service';

// 用户服务
export { userService } from './user.service';
export type {
    ChangePasswordRequest, UpdateProfileRequest, UserStats
} from './user.service';

// ==================== 使用说明 ====================
/*
统一导入所有服务：

import { 
  authService, 
  tokenManager, 
  userService,
  type LoginRequest,
  type User,
} from '@/services';

或单独导入：

import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
*/
