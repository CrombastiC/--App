# 餐厅 App

基于 React Native 和 Expo 构建的餐厅点餐应用。

## 📑 目录

- [快速开始](#-快速开始)
- [主要功能](#-主要功能)
- [项目结构](#-项目结构)
- [技术栈](#-技术栈)
- [核心功能实现](#-核心功能实现)
- [认证功能](#-认证功能)
- [API 请求封装](#-api-请求封装)
- [EAS 构建指南](#-eas-构建指南)
- [开发说明](#-开发说明)
- [更新日志](#-更新日志)

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 扫码或选择平台打开
# - 使用 Expo Go (iOS/Android)
# - 按 'a' 打开 Android 模拟器
# - 按 'i' 打开 iOS 模拟器
```

---

## ✨ 主要功能

### 📍 智能定位与城市选择
- **自动定位** - 应用启动时自动获取当前城市
- **城市搜索** - 支持中文、拼音、首字母三种搜索方式
- **字母索引** - 快速跳转到对应城市列表
- **智能缓存** - 记住上次选择的城市，避免重复定位
- **定位状态标识** - 清晰展示数据来源（缓存/定位中/已定位）

### 🏪 门店选择
- **按城市筛选** - 根据定位或选择的城市显示门店
- **门店详情** - 地址、距离等信息展示

### 🍽️ 点餐功能
- **扫码点餐** - 二维码扫描进入点餐流程
- **选择人数** - 支持选择就餐人数
- **结算功能** - 订单结算和支付
- **订单管理** - 查看当前订单和历史订单
- **创建订单** - 快速创建新订单

### 👤 会员中心
- **会员卡管理** - 查看会员码、余额
- **在线充值** - 支持多档位充值，实时到账
- **充值记录** - 查看充值历史
- **个人信息** - 管理个人资料
- **优惠券** - 查看和使用优惠券
- **账户管理** - 账户信息设置

### 🎁 积分系统
- **积分页面** - 查看积分余额和获取记录
- **积分商城** - 使用积分兑换商品
- **幸运抽奖** - 使用积分参与抽奖活动
- **积分任务** - 完成任务获得积分

### 🔐 用户认证
- **登录功能** - 手机号 + 密码登录
- **注册功能** - 手机号 + 昵称 + 密码注册
- **Token 管理** - 自动 Token 注入和刷新
- **第三方登录** - 预留微信、QQ 登录入口

---

## 📂 项目结构

```
app/                          # 应用主目录
├── (tabs)/                   # 底部导航标签页
│   ├── _layout.tsx           # 标签页布局
│   ├── index.tsx             # 首页（点餐入口）
│   ├── order.tsx             # 当前订单
│   ├── orders.tsx            # 历史订单
│   ├── profile.tsx           # 个人中心
│   └── icon.tsx              # 图标页
├── (location)/               # 定位模块
│   ├── _layout.tsx           # 定位模块布局
│   ├── citySelect.tsx        # 城市选择页
│   └── addressSelect.tsx     # 地址选择页
├── (member)/                 # 会员模块
│   ├── _layout.tsx           # 会员模块布局
│   ├── memberCode.tsx        # 会员码
│   ├── top-up.tsx            # 在线充值
│   └── topUpSuccess.tsx      # 充值成功页
├── (orderfood)/              # 点餐模块
│   ├── _layout.tsx           # 点餐模块布局
│   ├── peopleSelect.tsx      # 选择就餐人数
│   └── settlement.tsx        # 结算页面
├── (points)/                 # 积分模块
│   ├── _layout.tsx           # 积分模块布局
│   ├── pointPage.tsx         # 积分页面
│   ├── pointsMall.tsx        # 积分商城
│   └── luckyRoll.tsx         # 幸运抽奖
├── auth/                     # 认证模块
│   ├── _layout.tsx           # 认证模块布局
│   ├── login.tsx             # 登录页面
│   └── register.tsx          # 注册页面
├── user/                     # 用户模块
│   ├── _layout.tsx           # 用户模块布局
│   ├── account.tsx           # 账户信息
│   ├── coupon.tsx            # 优惠券管理
│   └── createOrder.tsx       # 创建订单
├── qrScanner.tsx             # 二维码扫描
├── splash.tsx                # 启动页
└── _layout.tsx               # 根路由配置

components/                   # 组件目录
├── ui/                       # UI 组件
│   ├── collapsible.tsx       # 折叠组件
│   ├── icon-symbol.tsx       # 图标符号
│   ├── icon-symbol.ios.tsx   # iOS 图标符号
│   ├── MenuItem.tsx          # 菜单项组件
│   ├── MenuList.tsx          # 菜单列表组件
│   └── TabSwitch.tsx         # 标签切换组件
├── external-link.tsx         # 外部链接组件
├── haptic-tab.tsx            # 触感标签组件
├── hello-wave.tsx            # 欢迎动画组件
├── parallax-scroll-view.tsx  # 视差滚动视图
├── themed-text.tsx           # 主题文本组件
└── themed-view.tsx           # 主题视图组件

config/                       # 配置文件
└── api.config.ts             # API 配置

constants/                    # 常量
└── theme.ts                  # 主题配置

hooks/                        # 自定义 Hooks
├── use-request/              # 请求 Hook
│   └── index.ts              # useRequest Hook
├── use-color-scheme.ts       # 颜色方案 Hook
├── use-color-scheme.web.ts   # Web 颜色方案 Hook
└── use-theme-color.ts        # 主题颜色 Hook

request/                      # 网络请求
└── index.ts                  # Request 请求封装

services/                     # 服务层
├── auth.service.ts           # 认证服务
├── user.service.ts           # 用户服务
├── order.service.ts          # 订单服务
├── points.service.ts         # 积分服务
└── index.ts                  # 服务导出

stores/                       # 状态管理
└── profile-store.ts          # Zustand 全局状态管理

utils/                        # 工具函数
├── storage.ts                # AsyncStorage 封装
└── topUpStorage.ts           # 充值记录存储

assets/                       # 静态资源
└── images/                   # 图片资源
    ├── icon.png              # 应用图标
    ├── splash-icon.png       # 启动图标
    ├── cooker.png            # 厨师背景图
    ├── rollBackground.png    # 抽奖背景图
    └── ...                   # 其他图片

json/                         # JSON 数据
└── MaterialCommunityIcons.json  # 图标库数据

examples/                     # 示例代码
└── request-example.tsx       # 请求使用示例
```

---

## 🛠 技术栈

- **框架**: React Native + Expo Router
- **UI 组件**: React Native Paper
- **状态管理**: Zustand
- **本地存储**: AsyncStorage
- **导航**: Expo Router (file-based routing)
- **图标**: MaterialCommunityIcons
- **开发语言**: TypeScript
- **网络请求**: Axios 封装

---

## 🔧 核心功能实现

### 1. 定位功能使用

#### 定位状态标识
在城市选择页面，"当前定位城市"旁会显示：
- **[已保存]** (蓝色) - 来自上次选择的缓存
- **[定位中...]** (橙色) - 正在进行 GPS 定位
- **✓ 绿色对勾** - 刚完成的真实定位

#### 查看定位日志
打开开发者工具控制台，查看详细日志：
```
💾 [缓存] 从本地存储加载城市: 北京市  ← 缓存数据
📍 [定位] 无缓存，开始真实定位...      ← 真实定位
✅ [成功] 真实定位获取到城市: 北京市   ← 定位成功
```

#### 清除缓存测试
当显示 `[已保存]` 时，点击下方的 **"清除缓存并重新定位"** 按钮即可立即重新定位。

### 2. 城市搜索功能

支持三种搜索方式：
- **中文搜索**: 直接输入"北京"
- **全拼搜索**: 输入"beijing"
- **首字母搜索**: 输入"bj"

### 3. 会员充值功能

#### 充值流程
1. 进入"个人中心" → 点击"在线充值"
2. 默认选中 500元 充值档位
3. 可选择其他充值金额（500/1000/2000/3000元）
4. 阅读充值须知
5. 勾选"我已阅读并同意充值协议"
6. 点击"确认充值"按钮
7. 跳转到充值成功页面

#### 充值界面特点
- 🎯 默认选中500元档位
- 🎨 选中卡片高亮橙色边框
- 📋 充值须知明显展示
- ✅ 协议勾选后按钮才可用
- 📌 底部按钮固定显示

#### 账户余额管理
- 💰 **实时显示账户余额** - 从本地缓存读取余额
- ♻️ **自动更新余额** - 充值成功后自动增加账户余额
- 🔄 **页面刷新** - 从成功页返回时自动刷新余额显示
- 💾 **持久化存储** - 余额保存在本地，应用重启不丢失

#### 充值记录
- 💾 自动保存充值记录到本地存储
- 📊 支持查看历史充值记录
- 🔄 切换到"充值记录"标签查看
- 📝 记录包含：充值金额、赠送金额、充值时间、状态
- 🗂️ 记录按时间倒序排列（最新的在前）

#### 数据持久化
- 使用 AsyncStorage 存储充值记录和账户余额
- 记录结构：`{ id, amount, bonus, totalAmount, timestamp, status }`
- 余额数据：`accountBalance` (number)
- 支持跨会话保存，应用重启后数据不丢失
- 充值时自动更新余额：余额 = 原余额 + 充值金额 + 赠送金额

---

## 🔐 认证功能

### 功能特性

#### 1. 首页未登录状态
- **位置**: `app/(tabs)/index.tsx`
- **功能**: 
  - 检查用户登录状态 (`tokenManager.isLoggedIn()`)
  - 未登录时显示"授权登录"卡片
  - 点击卡片跳转到登录页面
  - 已登录时显示用户信息卡片

#### 2. 登录页面
- **路径**: `/auth/login`
- **功能**:
  - 手机号 + 密码登录
  - 表单验证(手机号格式、密码长度)
  - 密码显示/隐藏切换
  - 注册跳转
  - 第三方登录入口(微信、QQ)
  - 登录成功后自动保存 token 并跳转到首页

#### 3. 注册页面
- **路径**: `/auth/register`
- **功能**:
  - 手机号 + 昵称 + 密码注册（简化版，无需验证码）
  - 昵称验证（2-20个字符）
  - 密码确认验证
  - 表单验证
  - 注册成功后自动登录并跳转首页

#### 4. 重置密码页面
- **路径**: `/auth/reset-password`
- **状态**: ⚠️ 暂时不可用（需要短信验证码）

### 🎨 UI 设计

#### 主题色
- **主色调**: `#FF7214` (橙色)
- **背景色**: `#F6EAE3` (浅棕色)
- **辅助色**: 
  - 成功/积分: `#4ECDC4` (青色)
  - 会员: `#9B59B6` (紫色)

#### 设计亮点
1. **背景图片**: 使用 `cooker.png` 作为背景，增强餐厅氛围
2. **半透明卡片**: 表单使用白色半透明背景 `rgba(255, 255, 255, 0.95)`
3. **图标 Logo**: 使用餐具图标 (`silverware-fork-knife`) 作为品牌标识
4. **Material Design**: 使用 React Native Paper 组件库
5. **圆角阴影**: 所有卡片和按钮都有圆角和阴影效果

### 认证流程

#### 登录流程
```
1. 用户输入手机号和密码
2. 前端验证格式
3. 调用 authService.login()
4. 成功后 tokenManager.saveLoginInfo() 保存 token
5. 跳转到首页 (tabs)
```

#### 注册流程
```
1. 用户输入手机号
2. 输入昵称（2-20个字符）
3. 输入密码和确认密码
4. 前端验证格式和密码一致性
5. 调用 authService.register({ phone, nickname, password })
6. 成功后自动登录(保存 token)
7. 跳转到首页
```

### 技术实现

#### 1. 状态管理
```typescript
// 使用 useRequest hook 管理请求状态
const { loading, runAsync } = useRequest(authService.login, {
  manual: true,
});

// 调用时使用 runAsync 获取结果
const [error, data] = await runAsync({ phone, password });
```

#### 2. 表单验证
```typescript
// 手机号验证
const phoneRegex = /^1[3-9]\d{9}$/;

// 昵称验证
nickname.length >= 2 && nickname.length <= 20

// 密码长度验证
password.length >= 6

// 确认密码验证
confirmPassword === password
```

#### 3. Token 管理
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

### API 接口

所有接口定义在 `services/auth.service.ts`:

```typescript
// 登录（手机号 + 密码）
authService.login({ phone, password })

// 注册（手机号 + 昵称 + 密码）
authService.register({ phone, nickname, password })

// 登出
authService.logout()

// 刷新 Token
authService.refreshToken(refreshToken)
```

### ⚠️ 注意事项

1. **短信验证码**: 当前版本**不支持**短信验证码功能
   - 注册页面已简化为：手机号 + 昵称 + 密码
   - 登录页面已移除"忘记密码"链接
   - 重置密码功能暂时不可用
   - 需要接入短信平台（阿里云SMS/腾讯云SMS等）后再启用相关功能

2. **路由类型**: 由于 Expo Router 的类型限制，新增路由需要使用 `as any` 断言
   ```typescript
   router.push('/auth/login' as any)
   ```

3. **AsyncStorage**: 所有 token 操作都是异步的，需要使用 `await`

4. **错误处理**: API 返回的是 `[error, data]` 元组，需要解构处理

5. **登录保持**: Token 保存在 AsyncStorage，app 重启后仍然有效

6. **自动刷新**: Token 过期时(401)会自动尝试刷新，失败后清除登录状态

---

## 📡 API 请求封装

### 配置服务端地址

在 `config/api.config.ts` 中修改：

```typescript
export const ENV = {
  development: {
    baseURL: 'http://192.168.1.136:5000', // 改成你的服务器地址
    timeout: 10000,
  },
};

export const CURRENT_ENV = 'development'; // 当前环境
```

### 使用方式

#### 方式A: 直接使用 request

```typescript
import request from '@/request';

// GET 请求
const [error, data] = await request.get<User[]>('/api/users', {
  page: 1,
  size: 10,
});

if (!error) {
  console.log('用户列表:', data);
}

// POST 请求
const [error, result] = await request.post('/api/login', {
  username: 'test',
  password: '123456',
});
```

#### 方式B: 使用 useRequest Hook（推荐）

```typescript
import { useRequest } from '@/hooks/use-request';

function UserList() {
  // 自动请求
  const { data, loading, error, refresh } = useRequest(
    () => request.get('/api/users', { page: 1 }),
    {
      manual: false, // 组件加载时自动请求
    }
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>加载失败</Text>;

  return (
    <View>
      {data?.map(user => <Text key={user.id}>{user.name}</Text>)}
      <Button title="刷新" onPress={refresh} />
    </View>
  );
}
```

#### 方式C: 封装成服务（最佳实践）

```typescript
// services/user.ts
import request from '@/request';

export const userService = {
  login: (username: string, password: string) => {
    return request.post<{ token: string }>('/api/login', {
      username,
      password,
    });
  },
  
  getList: (page: number, size: number) => {
    return request.get<User[]>('/api/users', { page, size });
  },
};

// 在组件中使用
const { data, loading } = useRequest(() => userService.getList(1, 10));
```

### request 对象 API

```typescript
// GET 请求
request.get<T>(url: string, params?: any, config?: AxiosRequestConfig): Response<T>

// POST 请求  
request.post<T>(url: string, data?: any, config?: AxiosRequestConfig): Response<T>

// PUT 请求
request.put<T>(url: string, data?: any, config?: AxiosRequestConfig): Response<T>

// DELETE 请求
request.delete<T>(url: string, params?: any, config?: AxiosRequestConfig): Response<T>

// PATCH 请求
request.patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Response<T>

// 上传文件
request.upload<T>(url: string, file: any, config?: AxiosRequestConfig): Response<T>
```

**返回值 Response<T>:**
```typescript
type Response<T> = Promise<[boolean, T, AxiosResponse<T>]>
// [是否错误, 数据, 原始响应]
```

### useRequest Hook API

```typescript
useRequest<T>(
  serviceMethod: (...args: any) => Response<T>,
  options?: {
    manual?: boolean;        // 是否手动触发，默认false
    defaultParams?: any[];   // 默认参数
  }
)
```

**返回值:**
```typescript
{
  data: T | undefined;           // 响应数据
  loading: boolean;              // 加载状态
  error: boolean | undefined;    // 错误状态
  run: (...params: any) => void; // 手动触发（不返回Promise）
  runAsync: (...params: any) => Response<T>; // 手动触发（返回Promise）
  refresh: () => void;           // 使用上次参数重新请求
}
```

### Token 管理

#### 自动 Token 处理

请求会自动从 `AsyncStorage` 中读取 token 并添加到请求头：

```typescript
Authorization: Bearer <token>
```

#### 登录后保存 Token

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
  const [error, data] = await request.post('/api/login', { username, password });
  
  if (!error) {
    // 保存 token
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }
};
```

#### 自动 Token 刷新

当请求返回 `401` 未授权时，会自动：
1. 暂停所有新请求
2. 调用刷新 token 接口
3. 保存新的 token
4. 重新发起失败的请求

### 高级功能

#### 1. 并发控制

默认最大并发数为 100，可以调整：

```typescript
import request from '@/request';

request.setLimit(50); // 设置最大并发数为50
```

#### 2. 请求队列

当并发达到上限或正在刷新 token 时，新请求会自动加入队列，等待处理。

#### 3. 开发环境日志

开发环境下会自动打印：
- 📤 请求日志：url、method、params、data
- 📥 响应日志：url、status、data
- ❌ 错误日志：url、message、status

### 最佳实践

1. **统一管理 API 路径**
   ```typescript
   // config/api.config.ts
   export const API_PATHS = {
     user: {
       login: '/api/user/login',
       profile: '/api/user/profile',
     },
   };
   ```

2. **封装服务层**
   ```typescript
   // services/user.ts
   export const userService = {
     login: (data) => request.post(API_PATHS.user.login, data),
     getProfile: () => request.get(API_PATHS.user.profile),
   };
   ```

3. **使用 TypeScript 类型**
   ```typescript
   interface User {
     id: string;
     name: string;
   }
   
   const [error, user] = await request.get<User>('/api/user');
   ```

4. **错误处理**
   ```typescript
   const [error, data] = await request.get('/api/users');
   
   if (error) {
     Alert.alert('错误', '加载失败');
     return;
   }
   
   // 使用 data
   ```

5. **使用 useRequest 简化状态管理**
   ```typescript
   // 推荐：使用 useRequest
   const { data, loading } = useRequest(() => request.get('/api/users'));
   ```

---

## 📱 EAS 构建指南

### 构建命令

#### 1. 开发版本（用于内部测试）
```bash
eas build --profile development --platform android
```

#### 2. 预览版本（用于测试分发）
```bash
eas build --profile preview --platform android
```

#### 3. 生产版本（用于发布到应用商店）
```bash
eas build --profile production --platform android
```

#### 4. 同时构建 iOS 和 Android
```bash
eas build --profile production --platform all
```

### 构建配置说明

#### eas.json 配置文件
```json
{
  "build": {
    "development": {
      "developmentClient": true,  // 开发客户端
      "distribution": "internal"   // 内部分发
    },
    "preview": {
      "distribution": "internal"   // 预览版，内部分发
    },
    "production": {
      "autoIncrement": true        // 自动递增版本号
    }
  }
}
```

### 已配置的权限

#### Android 权限
- ✅ 相机权限（扫描二维码）
- ✅ 位置权限（显示附近门店）
- ✅ Package: `com.ar1se.restaurant`

#### iOS 权限
- ✅ 相机权限（扫描二维码）
- ✅ 位置权限（显示附近门店）
- ✅ Bundle Identifier: `com.ar1se.restaurant`

### 构建流程

#### 第一次构建（推荐预览版）
```bash
# 1. 确保代码已提交
git add .
git commit -m "准备构建"

# 2. 开始构建
eas build --profile preview --platform android

# 3. 等待构建完成（通常需要 5-15 分钟）
# 构建完成后会显示下载链接
```

#### 构建选项说明
在构建过程中，可能会询问：
1. **是否自动生成凭证？** → 选择 `Yes`（首次构建）
2. **是否要生成新的 Keystore？** → 选择 `Yes`（Android）
3. **应用商店凭证** → 如果只是测试，可以跳过

### 下载和安装

#### 方法 1：通过 EAS 网站
1. 访问：https://expo.dev/accounts/ar1se/projects/rn-components
2. 找到最新的构建
3. 下载 APK 文件
4. 在 Android 设备上安装

#### 方法 2：通过命令行
```bash
# 查看构建列表
eas build:list

# 下载最新构建
eas build:download --latest
```

#### 方法 3：扫码安装
构建完成后，会生成一个二维码，用手机扫描即可安装

### 更新版本

编辑 `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // 更新这里
    "android": {
      "versionCode": 2   // 可选：手动设置 Android 版本码
    },
    "ios": {
      "buildNumber": "2" // 可选：手动设置 iOS 构建号
    }
  }
}
```

或者使用 `production` 配置文件，它会自动递增版本号。

### 常见问题

#### 1. 构建失败
```bash
# 查看详细错误日志
eas build:list
# 点击失败的构建查看日志
```

#### 2. 清理缓存重新构建
```bash
eas build --profile preview --platform android --clear-cache
```

#### 3. 本地构建（需要 Android Studio/Xcode）
```bash
eas build --profile preview --platform android --local
```

### 推荐工作流程

#### 开发阶段
```bash
npm start  # 本地开发，使用 Expo Go
```

#### 测试阶段
```bash
eas build --profile preview --platform android
```

#### 发布阶段
```bash
# 1. 更新版本号
# 2. 构建生产版本
eas build --profile production --platform all

# 3. 提交到应用商店
eas submit --platform android
eas submit --platform ios
```

### 构建状态查看

```bash
# 查看所有构建
eas build:list

# 查看特定构建
eas build:view <build-id>

# 取消正在进行的构建
eas build:cancel
```

---

## 📝 开发说明

### 测试充值功能
1. 首次使用时账户余额为 0
2. 选择充值档位（默认500元）
3. 勾选协议后点击"确认充值"
4. 查看充值成功页面
5. 返回后余额自动更新（原余额 + 充值金额 + 赠送金额）
6. 切换到"充值记录"标签查看历史

**清除测试数据**：
在 Expo Go 中可以清除应用数据重新开始测试。

### 测试定位功能
1. 使用真机测试（推荐）- 定位效果最好
2. 模拟器需要手动设置位置
3. 首次使用会请求定位权限
4. 如需重新定位，点击"清除缓存"按钮

### 控制台日志说明
- 🚀 定位流程开始
- 💾 从缓存加载
- 📍 真实定位
- 🔐 权限处理
- 📡 GPS 获取坐标
- 🗺️ 地理编码
- ✅ 成功
- ❌ 失败

### 权限配置

定位权限已在 `app.json` 中配置：
- ✅ iOS: NSLocationWhenInUseUsageDescription
- ✅ Android: ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION

---

## 📅 更新日志

### 2025-10-20 - 认证功能实现

#### ✨ 新增功能

**1. 登录功能**
- **登录页面**: `/auth/login`
- **输入字段**: 手机号 + 密码
- **功能**:
  - 手机号格式验证（11位，1开头）
  - 密码长度验证（最少6位）
  - 密码显示/隐藏切换
  - 第三方登录入口（微信、QQ）
  - 登录成功自动保存 Token
  - 自动跳转到首页

**2. 注册功能**
- **注册页面**: `/auth/register`
- **输入字段**: 手机号 + 昵称 + 密码 + 确认密码
- **功能**:
  - 手机号格式验证
  - **昵称验证**（2-20个字符）
  - 密码长度验证（最少6位）
  - 密码一致性验证
  - 注册成功自动登录
  - 自动跳转到首页

**3. 首页未登录状态**
- **修改文件**: `app/(tabs)/index.tsx`
- **功能**:
  - 检测用户登录状态
  - 未登录时显示"授权登录"卡片
  - 点击卡片跳转到登录页
  - 已登录时显示用户信息卡片

#### 🔧 技术实现

**请求封装**
- **位置**: `request/index.ts`
- **功能**:
  - Axios 封装
  - 自动 Token 注入
  - 401 自动刷新 Token
  - 请求队列管理（并发限制100）
  - 返回 `[error, data, response]` 元组

**useRequest Hook**
- **位置**: `hooks/use-request/index.ts`
- **功能**:
  - 管理 loading、error、data 状态
  - `run` / `runAsync` 方法
  - `refresh` 刷新功能
  - 支持手动/自动模式

**认证服务**
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

**Token 管理**
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

#### 📝 API 配置
- **位置**: `config/api.config.ts`
- **后端地址**: `http://192.168.1.136:5000`
- **环境**: development (dev)

#### ⚠️ 重要说明

**已移除的功能**
1. **短信验证码**
   - 原因：未接入短信平台
   - 影响：注册不需要验证码，直接使用手机号+昵称+密码
   - 后续：接入阿里云SMS或腾讯云SMS后可启用

2. **忘记密码**
   - 原因：依赖短信验证码
   - 状态：登录页已隐藏"忘记密码"链接
   - 文件：`app/auth/reset-password.tsx` 已创建但暂不可用

**接口变更**
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



## 🎯 待办事项

### 认证功能优化
- [ ] 接入短信验证码平台（阿里云SMS/腾讯云SMS）
- [ ] 启用忘记密码功能
- [ ] 添加生物识别登录（指纹/Face ID）
- [ ] 实现微信、QQ 第三方登录
- [ ] 添加记住密码功能

### 支付功能
- [ ] 支付接口集成（微信支付/支付宝）
- [ ] 在线支付流程
- [ ] 支付结果回调处理
- [ ] 退款功能

### 订单功能
- [ ] 订单详情页面完善
- [ ] 菜品详情页面
- [ ] 购物车功能
- [ ] 订单状态追踪

### 社交功能
- [ ] 评价系统
- [ ] 评论晒图
- [ ] 分享功能

### 系统功能
- [ ] 推送通知
- [ ] 消息中心
- [ ] 客服系统
- [ ] 数据统计分析

---

## 📞 支持

如有问题，请查看控制台日志 - 开发环境会输出详细日志。

## 📝 License

MIT

---

**开发者**: WEB-Nest  
**最后更新**: 2025年10月31日
