# OrderFoodApp

点餐系统 Monorepo，React Native (Expo) 前端 + NestJS 后端。

## 项目结构

```
OrderFoodApp/
├── apps/
│   ├── mobile/           # Expo React Native 前端
│   └── api/              # NestJS + Prisma 后端
├── packages/
│   ├── common/           # 共享代码
│   └── shared-types/     # 共享类型
├── package.json          # pnpm workspaces
└── pnpm-workspace.yaml
```

## 技术栈

| | 前端 (mobile) | 后端 (api) |
|---|---|---|
| 框架 | Expo Router 6 | NestJS 10 |
| 样式 | NativeWind (Tailwind) | - |
| 状态 | Zustand | - |
| 请求 | Axios 封装 | - |
| ORM | - | Prisma 5 |
| 数据库 | - | PostgreSQL |
| 认证 | AsyncStorage + JWT | JWT + bcrypt |

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev:api          # 后端开发 http://localhost:5000
pnpm dev:mobile       # 前端 Expo Go
pnpm dev              # 同 dev:api
pnpm prisma:migrate   # 数据库迁移
pnpm prisma:studio    # Prisma Studio
pnpm prisma:seed      # 种子数据
```

后端 API 文档：`http://localhost:5000/api-docs`

## 编码约定

- 所有文档和注释使用中文编写
- 组件命名使用大驼峰（PascalCase），变量/函数使用小驼峰（camelCase）
- 避免使用 `any` 类型，必须有适当的类型注解
- 所有异步操作使用 `async/await`，包含错误处理
- 样式使用 `StyleSheet.create` 定义，避免内联样式
- 状态管理优先 React `useState`/`useEffect`，其次 Zustand
- 列表渲染优先使用 `FlatList`
- 废弃 API 及时提示替代方案
- 示例文件放在 `examples/` 目录

## 前端架构

### 网络请求

`apps/mobile/request/index.ts` 封装 Axios，返回 `[error, data, response]` 元组：

```ts
const [error, data] = await request.get<User[]>('/api/user', { page: 1 });
if (!error) { /* 使用 data */ }
```

推荐使用 `useRequest` Hook（`hooks/use-request/index.ts`）管理 loading/error/data 状态。

Token 自动注入和刷新：请求拦截器从 AsyncStorage 读取 token，401 时自动调用刷新接口。

### 认证流程

- `services/auth.service.ts`：登录/注册/登出接口 + `tokenManager`（存取 token）
- 登录后 `tokenManager.saveLoginInfo()` 保存 token + 用户信息
- 登出 `tokenManager.clearLoginInfo()` 清除并跳转登录页
- 注册流程：手机号 + 昵称 + 密码（**无短信验证码**，后续需接入 SMS 平台）

### 路由

使用 Expo Router 文件系统路由。由于类型限制，新路由使用 `as any`：

```ts
router.push('/auth/login' as any);
```

### 全局 Toast

```ts
import ToastManager from '@/utils/toast';
ToastManager.show('成功', { position: 'top', containerStyle: { backgroundColor: '#4CAF50' } });
```

## 后端架构

### 模块

`apps/api/src/modules/`：
- `auth` — JWT 认证（登录、注册、Token 刷新）
- `user` — 用户信息、余额充值、签到
- `menu` — 菜品分类、菜品管理
- `order` — 订单创建、列表
- `points` — 积分商城、抽奖、积分记录
- `coupon` — 优惠券
- `money` — 充值金额选项配置
- `upload` — 图片上传

### 公共模块

`apps/api/src/common/`：
- `interceptors/` — 统一响应拦截器（返回 `{ code, data, message }`）
- `filters/` — 全局异常过滤器
- `decorators/` — 自定义装饰器（如 `@CurrentUser`）

### 数据库

Prisma schema 在 `apps/api/prisma/schema.prisma`，主要模型：
`User`、`TopUpRecord`、`MoneyOption`、`FoodCategory`、`Food`、`LotteryPrize`、`LotteryRecord`、`Commodity`、`PointRecord`、`Coupon`、`UserCoupon`、`Order`、`OrderItem`

## 重要注意事项

1. **Android HTTP 明文传输**：EAS Build 需在 `app.config.js` 中配置 `expo-build-properties` 插件，设置 `usesCleartextTraffic: true`。不能直接修改本地 `android/` 文件。
2. **路由类型**：Expo Router 导航需 `as any` 断言
3. **Token 操作**：所有 token 操作都是异步的，需要 `await`
4. **环境变量**：前端 API 地址在 `apps/mobile/config/api.config.ts`；后端在 `apps/api/.env`
5. **高德定位 Key**：通过 `app.config.js` extra 注入，生产环境用 EAS Secrets
