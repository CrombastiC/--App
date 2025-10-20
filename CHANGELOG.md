# 更新日志

## 2025-10-20 - 认证功能实现

### ✨ 新增功能

#### 1. 登录功能
- **登录页面**: `/auth/login`
- **输入字段**: 手机号 + 密码
- **功能**:
  - 手机号格式验证（11位，1开头）
  - 密码长度验证（最少6位）
  - 密码显示/隐藏切换
  - 第三方登录入口（微信、QQ）
  - 登录成功自动保存 Token
  - 自动跳转到首页

#### 2. 注册功能
- **注册页面**: `/auth/register`
- **输入字段**: 手机号 + 昵称 + 密码 + 确认密码
- **功能**:
  - 手机号格式验证
  - **昵称验证**（2-20个字符）
  - 密码长度验证（最少6位）
  - 密码一致性验证
  - 注册成功自动登录
  - 自动跳转到首页

#### 3. 首页未登录状态
- **修改文件**: `app/(tabs)/index.tsx`
- **功能**:
  - 检测用户登录状态
  - 未登录时显示"授权登录"卡片
  - 点击卡片跳转到登录页
  - 已登录时显示用户信息卡片

### 🔧 技术实现

#### 请求封装
- **位置**: `request/index.ts`
- **功能**:
  - Axios 封装
  - 自动 Token 注入
  - 401 自动刷新 Token
  - 请求队列管理（并发限制100）
  - 返回 `[error, data, response]` 元组

#### useRequest Hook
- **位置**: `hooks/use-request/index.ts`
- **功能**:
  - 管理 loading、error、data 状态
  - `run` / `runAsync` 方法
  - `refresh` 刷新功能
  - 支持手动/自动模式

#### 认证服务
- **位置**: `services/auth.service.ts`
- **接口**:
  ```typescript
  // 登录
  authService.login({ phone, password })
  
  // 注册
  authService.register({ phone, nickname, password })
  
  // 登出
  authService.logout()
  
  // 刷新 Token
  authService.refreshToken(refreshToken)
  ```

#### Token 管理
- **位置**: `services/auth.service.ts` - tokenManager
- **功能**:
  ```typescript
  // 保存登录信息
  await tokenManager.saveLoginInfo(data)
  
  // 检查是否登录
  await tokenManager.isLoggedIn()
  
  // 获取 Token
  await tokenManager.getToken()
  
  // 清除登录信息
  await tokenManager.clearLoginInfo()
  ```

### 📝 API 配置
- **位置**: `config/api.config.ts`
- **后端地址**: `http://192.168.1.136:5000`
- **环境**: development (dev)

### 🎨 UI 设计
- **主题色**: `#FF7214` (橙色)
- **背景色**: `#F6EAE3` (浅棕色)
- **设计风格**: Material Design 3
- **组件库**: React Native Paper
- **特点**:
  - 半透明卡片背景
  - 统一的圆角阴影
  - 品牌图标（餐具）
  - 背景图片（cooker.png）

### ⚠️ 重要说明

#### 已移除的功能
1. **短信验证码**
   - 原因：未接入短信平台
   - 影响：注册不需要验证码，直接使用手机号+昵称+密码
   - 后续：接入阿里云SMS或腾讯云SMS后可启用

2. **忘记密码**
   - 原因：依赖短信验证码
   - 状态：登录页已隐藏"忘记密码"链接
   - 文件：`app/auth/reset-password.tsx` 已创建但暂不可用

#### 接口变更
```typescript
// 旧版本（已废弃）
RegisterRequest {
  phone: string;
  password: string;
}

// 新版本（当前使用）
RegisterRequest {
  phone: string;
  nickname: string;  // ✨ 新增昵称字段
  password: string;
}
```

### 📂 新增文件

```
app/
  auth/
    _layout.tsx          # Auth 路由布局
    login.tsx            # 登录页面
    register.tsx         # 注册页面（包含昵称输入）
    reset-password.tsx   # 重置密码（暂不可用）

config/
  api.config.ts          # API 配置

request/
  index.ts               # Request 请求封装

hooks/
  use-request/
    index.ts             # useRequest Hook

services/
  auth.service.ts        # 认证服务
  user.service.ts        # 用户服务
  index.ts               # 服务导出

AUTH_GUIDE.md            # 认证功能文档
REQUEST_USAGE.md         # 请求封装文档
CHANGELOG.md             # 更新日志（本文件）
```

### 🔄 修改文件

```
app/(tabs)/index.tsx     # 首页 - 添加登录状态检测
app/_layout.tsx          # 根布局 - 注册 auth 路由
```

### 🚀 使用示例

#### 检查登录状态
```typescript
import { tokenManager } from '@/services';

const isLoggedIn = await tokenManager.isLoggedIn();
if (isLoggedIn) {
  // 已登录
} else {
  // 未登录，跳转登录页
  router.push('/auth/login');
}
```

#### 注册新用户
```typescript
import { authService, tokenManager } from '@/services';

const [error, data] = await authService.register({
  phone: '13800138000',
  nickname: '小明',
  password: '123456'
});

if (!error && data) {
  // 保存登录信息
  await tokenManager.saveLoginInfo(data);
  // 跳转首页
  router.replace('/(tabs)');
}
```

#### 用户登录
```typescript
import { authService, tokenManager } from '@/services';

const [error, data] = await authService.login({
  phone: '13800138000',
  password: '123456'
});

if (!error && data) {
  await tokenManager.saveLoginInfo(data);
  router.replace('/(tabs)');
}
```

### 📊 数据流程

```
用户输入
  ↓
表单验证
  ↓
authService.register({ phone, nickname, password })
  ↓
request.post('/api/auth/register', data)
  ↓
[自动添加 headers、Token 等]
  ↓
后端处理
  ↓
返回 [error, data]
  ↓
tokenManager.saveLoginInfo(data)
  ↓
AsyncStorage 保存 Token
  ↓
router.replace('/(tabs)')
```

### 🐛 已知问题

1. **路由类型警告**
   - 问题：新增路由需要使用 `as any` 断言
   - 原因：Expo Router 类型限制
   - 解决：等待 Expo Router 更新或重新生成类型

2. **重置密码不可用**
   - 问题：需要短信验证码
   - 状态：页面已创建但功能禁用
   - 解决：接入短信平台后启用

### 📅 待办事项

- [ ] 接入短信验证码平台
- [ ] 启用忘记密码功能
- [ ] 添加生物识别登录（指纹/Face ID）
- [ ] 实现微信、QQ 第三方登录
- [ ] 添加记住密码功能
- [ ] 优化错误提示信息
- [ ] 添加加载动画
- [ ] 表单输入持久化

### 🔗 相关文档

- [认证功能完整文档](./AUTH_GUIDE.md)
- [请求封装使用指南](./REQUEST_USAGE.md)
- [项目构建指南](./BUILD_GUIDE.md)
