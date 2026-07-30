# 管理后台

`apps/admin` 是 OrderFoodApp 的运营管理端，基于 React、Vite 和 Ant Design。

## 启动

先启动 API，再启动管理后台：

```bash
pnpm dev:api
pnpm dev:admin
```

开发服务器会把 `/api` 和 `/uploads` 代理到 `http://localhost:5000`。

默认管理员：`13800000000 / admin123`。

## 页面

| 路由 | 功能 |
|------|------|
| `/dashboard` | 今日/累计营收、订单与库存概览 |
| `/orders` | 订单搜索、筛选、详情和状态处理 |
| `/users` | 用户资料、余额、积分和业务统计 |
| `/menu` | 分类、菜品、图片和上下架管理 |
| `/money` | 充值金额与赠送金额配置 |
| `/commodity` | 积分商城商品与库存管理 |
| `/prizes` | 抽奖奖品、积分奖励、库存和排序 |
| `/coupons` | 优惠券库存、启停和定向发放 |
| `/gift-cards` | 礼品卡创建、有效期和兑换状态 |

页面使用路由懒加载，Vite 会按管理模块拆分生产资源。

## 管理接口

新增管理接口位于 `/api/admin`，统一要求 JWT 管理员身份：

```text
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status

GET    /api/admin/coupons
POST   /api/admin/coupons
PUT    /api/admin/coupons/:id
DELETE /api/admin/coupons/:id
POST   /api/admin/coupons/:id/grant

GET    /api/admin/gift-cards
POST   /api/admin/gift-cards
PUT    /api/admin/gift-cards/:id
DELETE /api/admin/gift-cards/:id
```

菜单、充值档位、积分商品和奖品继续使用各自的管理员接口。

## 请求封装

`src/lib/request.ts` 负责注入管理员 Token、处理 401，并提供自动解包统一响应的 `api` 方法：

```ts
const result = await api.get<PaginatedResult<AdminOrder>>('/admin/orders', {
  params: { page: 1, limit: 10 },
});
```

页面业务类型集中在 `src/types/admin.ts`。

## 构建

```bash
pnpm --filter @orderfood/admin build
```

构建包含 TypeScript 检查和 Vite 生产打包。
