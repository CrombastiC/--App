# 登录注册功能说明

## 📁 文件结构

```
app/
  auth/
    _layout.tsx          # Auth 路由布局配置
    login.tsx            # 登录页面
    register.tsx         # 注册页面
    reset-password.tsx   # 重置密码页面
  (tabs)/
    index.tsx           # 首页(已修改，支持未登录状态)
```

## ✨ 功能特性

### 1. 首页未登录状态
- **位置**: `app/(tabs)/index.tsx`
- **功能**: 
  - 检查用户登录状态 (`tokenManager.isLoggedIn()`)
  - 未登录时显示"授权登录"卡片
  - 点击卡片跳转到登录页面
  - 已登录时显示用户信息卡片

### 2. 登录页面
- **路径**: `/auth/login`
- **功能**:
  - 手机号 + 密码登录
  - 表单验证(手机号格式、密码长度)
  - 密码显示/隐藏切换
  - ~~忘记密码链接~~ (暂时移除，等接入短信平台后启用)
  - 注册跳转
  - 第三方登录入口(微信、QQ)
  - 登录成功后自动保存 token 并跳转到首页

### 3. 注册页面
- **路径**: `/auth/register`
- **功能**:
  - 手机号 + 昵称 + 密码注册（简化版，无需验证码）
  - 昵称验证（2-20个字符）
  - ~~发送验证码(60秒倒计时)~~ (暂时移除)
  - 密码确认验证
  - 表单验证
  - 注册成功后自动登录并跳转首页

### 4. 重置密码页面
- **路径**: `/auth/reset-password`
- **状态**: ⚠️ 暂时不可用（需要短信验证码）
- **功能**:
  - ~~手机号 + 验证码 + 新密码~~
  - ~~发送验证码(60秒倒计时)~~
  - 等接入短信平台后再启用此功能

## 🎨 UI 设计

### 主题色
- **主色调**: `#FF7214` (橙色)
- **背景色**: `#F6EAE3` (浅棕色)
- **辅助色**: 
  - 成功/积分: `#4ECDC4` (青色)
  - 会员: `#9B59B6` (紫色)

### 设计亮点
1. **背景图片**: 使用 `cooker.png` 作为背景，增强餐厅氛围
2. **半透明卡片**: 表单使用白色半透明背景 `rgba(255, 255, 255, 0.95)`
3. **图标 Logo**: 使用餐具图标 (`silverware-fork-knife`) 作为品牌标识
4. **Material Design**: 使用 React Native Paper 组件库
5. **圆角阴影**: 所有卡片和按钮都有圆角和阴影效果

## 🔐 认证流程

### 登录流程
```
1. 用户输入手机号和密码
2. 前端验证格式
3. 调用 authService.login()
4. 成功后 tokenManager.saveLoginInfo() 保存 token
5. 跳转到首页 (tabs)
```

### 注册流程
```
1. 用户输入手机号
2. 输入昵称（2-20个字符）
3. 输入密码和确认密码
4. 前端验证格式和密码一致性
5. 调用 authService.register({ phone, nickname, password })
6. 成功后自动登录(保存 token)
7. 跳转到首页
```

### ~~重置密码流程~~ (暂不可用)
```
⚠️ 此功能需要短信验证码支持
等接入短信平台（如阿里云SMS、腾讯云SMS）后再启用
```

## 🔧 技术实现

### 1. 状态管理
```typescript
// 使用 useRequest hook 管理请求状态
const { loading, runAsync } = useRequest(authService.login, {
  manual: true,
});

// 调用时使用 runAsync 获取结果
const [error, data] = await runAsync({ phone, password });
```

### 2. 表单验证
```typescript
// 手机号验证
const phoneRegex = /^1[3-9]\d{9}$/;

// 昵称验证
nickname.length >= 2 && nickname.length <= 20

// 密码长度验证
password.length >= 6

// 确认密码验证
confirmPassword === password

// ⚠️ 注意：当前版本不支持验证码验证
```

### 3. Token 管理
```typescript
// 保存登录信息
await tokenManager.saveLoginInfo({
  token: 'xxx',
  refreshToken: 'xxx',
  user: { id, phone, nickname }
});

// 检查登录状态
const isLoggedIn = await tokenManager.isLoggedIn();

// 清除登录信息(登出)
await tokenManager.clearLoginInfo();
```

### 4. 导航
```typescript
// 跳转到登录页
router.push('/auth/login' as any);

// 返回上一页
router.back();

// 替换当前页面(不可返回)
router.replace('/(tabs)');
```

## 📝 API 接口

所有接口定义在 `services/auth.service.ts`:

```typescript
// 登录（手机号 + 密码）
authService.login({ phone, password })

// 注册（手机号 + 昵称 + 密码）
authService.register({ phone, nickname, password })

// 以下接口暂不可用（需要短信验证码）
// authService.sendCode({ phone, type: 'register' | 'reset' })
// authService.resetPassword({ phone, code, newPassword })

// 登出
authService.logout()

// 刷新 Token
authService.refreshToken(refreshToken)
```

## 🚀 使用示例

### 首页判断登录状态
```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);

const loadData = async () => {
  const loggedIn = await tokenManager.isLoggedIn();
  setIsLoggedIn(loggedIn);
  
  if (loggedIn) {
    // 加载用户数据
  }
};
```

### 处理登录
```typescript
const handleLogin = async () => {
  if (validateForm()) {
    const [error, data] = await runAsync({ phone, password });
    if (error) {
      Alert.alert('登录失败', '请检查您的手机号和密码');
    } else if (data) {
      await tokenManager.saveLoginInfo(data);
      router.replace('/(tabs)');
    }
  }
};
```

### 处理注册（简化版）
```typescript
const handleRegister = async () => {
  if (validateForm()) {
    const [error, data] = await registerAsync({ 
      phone, 
      nickname,  // 新增：昵称字段
      password 
    });
    if (error) {
      Alert.alert('注册失败', '注册失败，请稍后重试');
    } else if (data) {
      await tokenManager.saveLoginInfo(data);
      Alert.alert('注册成功', '欢迎加入！', [
        { text: '确定', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  }
};
```

### ~~验证码倒计时~~ (暂不需要)
```typescript
const [countdown, setCountdown] = useState(0);

const startCountdown = () => {
  setCountdown(60);
  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
```

## ⚠️ 注意事项

1. **路由类型**: 由于 Expo Router 的类型限制，新增路由需要使用 `as any` 断言
   ```typescript
   router.push('/auth/login' as any)
   ```

2. **AsyncStorage**: 所有 token 操作都是异步的，需要使用 `await`

3. **错误处理**: API 返回的是 `[error, data]` 元组，需要解构处理

4. **登录保持**: Token 保存在 AsyncStorage，app 重启后仍然有效

5. **自动刷新**: Token 过期时(401)会自动尝试刷新，失败后清除登录状态

6. **⚠️ 短信验证码**: 当前版本**不支持**短信验证码功能
   - 注册页面已简化为：手机号 + 密码 + 确认密码
   - 登录页面已移除"忘记密码"链接
   - 重置密码功能暂时不可用
   - 需要接入短信平台（阿里云SMS/腾讯云SMS等）后再启用相关功能

## 🔄 后续优化建议

1. **接入短信平台**: 
   - 推荐阿里云短信服务、腾讯云SMS、或 Twilio
   - 启用手机号验证码注册
   - 启用忘记密码功能
   
2. **添加生物识别**: 指纹/Face ID 登录

3. **第三方登录**: 对接微信、QQ SDK

4. **记住密码**: 本地加密保存密码(可选)

5. **多语言支持**: i18n 国际化

6. **错误提示优化**: 更详细的错误信息

7. **加载动画**: 优化 loading 状态显示

8. **表单持久化**: 登录失败后保留输入内容

## 📋 短信平台接入指南

当需要启用短信验证码功能时，请参考以下步骤：

### 1. 选择短信服务商
- **阿里云短信**: https://www.aliyun.com/product/sms
- **腾讯云SMS**: https://cloud.tencent.com/product/sms
- **Twilio**: https://www.twilio.com/sms (国际)

### 2. 后端实现
```typescript
// 后端需要实现的接口
POST /api/auth/send-code
{
  "phone": "13800138000",
  "type": "register" | "reset"
}

// 验证码校验
POST /api/auth/verify-code
{
  "phone": "13800138000",
  "code": "123456"
}
```

### 3. 前端启用
在 `services/auth.service.ts` 中取消注释：
```typescript
// 取消注释这些接口
export interface SendCodeRequest { ... }
export interface ResetPasswordRequest { ... }

authService.sendCode = (data: SendCodeRequest) => { ... }
authService.resetPassword = (data: ResetPasswordRequest) => { ... }
```

在 `app/auth/register.tsx` 和 `reset-password.tsx` 中恢复验证码相关代码。
