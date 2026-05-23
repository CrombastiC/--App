# OrderFoodApp 架构与接口对照

## 1. 项目结构

```
OrderFoodApp/
├── apps/
│   ├── mobile/                 # Expo React Native 前端
│   └── api/                    # NestJS + Prisma 后端
├── packages/
│   ├── common/                 # 共享代码
│   └── shared-types/           # 共享类型
├── package.json
└── pnpm-workspace.yaml
```

## 2. 后端已实现接口（Controller）

### 2.1 认证模块 — `AuthController` (`/api/user`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/user/login` | 登录 | 公开 |
| POST | `/api/user/register` | 注册 | 公开 |
| POST | `/api/user/refresh-token` | 刷新 Token | 公开 |
| GET | `/api/user/verify` | 验证 Token | 需 JWT |
| POST | `/api/user/logout` | 退出登录 | 需 JWT |

### 2.2 用户模块 — `UserController` (`/api/user`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/user/getUserInfo` | 获取用户信息 | 需 JWT |
| PUT | `/api/user/update` | 更新用户信息 | 需 JWT |
| POST | `/api/user/rechargeAndDeduct` | 余额充值/扣除 | 需 JWT |
| GET | `/api/user/getRechargeRecord` | 获取充值记录 | 需 JWT |
| GET | `/api/user/getCheckInStatus` | 获取签到状态 | 需 JWT |
| POST | `/api/user/checkIn` | 签到 | 需 JWT |
| POST | `/api/user/change-password` | 修改密码 | 需 JWT |
| GET | `/api/user/stats` | 用户统计 | 需 JWT |
| DELETE | `/api/user/account` | 注销账户 | 需 JWT |

### 2.3 菜单模块 — `MenuController` (`/api/menu`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/menu/getMenuList/:id?` | 获取菜单列表 | 公开 |
| POST | `/api/menu/createFood` | 创建菜品 | 公开 |

### 2.4 优惠券模块 — `CouponController` (`/api/coupon`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/coupon/getCouponList` | 获取优惠券列表 | 需 JWT |

### 2.5 充值金额模块 — `MoneyController` (`/api/money`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/money/getMoneyList` | 获取充值选项 | 需 JWT |

### 2.6 订单模块 — `OrderController` (`/api/order`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/order/create` | 创建订单 | 需 JWT |
| GET | `/api/order/list` | 获取订单列表 | 需 JWT |
| GET | `/api/order/detail/:id` | 获取订单详情 | 需 JWT |

### 2.7 积分模块 — `PointsController` (`/api/points`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/points/getLuckyRollData` | 获取抽奖数据 | 需 JWT |
| POST | `/api/points/exchangePrize` | 兑换奖品（单抽） | 需 JWT |
| POST | `/api/points/exchangeMultiPrize` | 十连抽 | 需 JWT |
| GET | `/api/points/getWinningRecords` | 中奖记录 | 需 JWT |
| GET | `/api/points/getCommodityList` | 积分商城商品 | 需 JWT |
| GET | `/api/points/getPointsList` | 积分收支记录 | 需 JWT |

### 2.8 奖品管理模块 — `PrizeController` (`/api/points/prize`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/points/prize/list` | 奖品列表 | 需 JWT |
| POST | `/api/points/prize/create` | 创建奖品 | 需 JWT |
| PUT | `/api/points/prize/update/:id` | 更新奖品 | 需 JWT |
| DELETE | `/api/points/prize/delete/:id` | 删除奖品 | 需 JWT |
| PUT | `/api/points/prize/toggle/:id` | 启用/禁用奖品 | 需 JWT |

### 2.9 文件上传模块 — `UploadController` (`/api/upload`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/upload/uploadImg` | 上传图片 | 需 JWT |

---

## 3. 前端 Service 调用清单

### 3.1 `auth.service.ts`

| 调用路径 | 对应后端 | 状态 |
|----------|----------|------|
| `POST /api/user/login` | `/api/user/login` | 一致 |
| `POST /api/user/register` | `/api/user/register` | 一致 |
| `POST /api/auth/logout` | `/api/user/logout` | **路径不一致** |
| `POST /api/auth/refresh-token` | `/api/user/refresh-token` | **路径不一致** |
| `GET /api/auth/verify` | `/api/user/verify` | **路径不一致** |

### 3.2 `user.service.ts`

| 调用路径 | 对应后端 | 状态 |
|----------|----------|------|
| `GET /api/user/getUserInfo` | `/api/user/getUserInfo` | 一致 |
| `PUT /api/user/update` | `/api/user/update` | 一致 |
| `POST /api/user/rechargeAndDeduct` | `/api/user/rechargeAndDeduct` | 一致 |
| `GET /api/user/getRechargeRecord` | `/api/user/getRechargeRecord` | 一致 |
| `GET /api/user/getCheckInStatus` | `/api/user/getCheckInStatus` | 一致 |
| `POST /api/user/checkIn` | `/api/user/checkIn` | 一致 |
| `POST /api/user/change-password` | `/api/user/change-password` | **路径不一致** |
| `GET /api/user/stats` | `/api/user/stats` | **路径不一致** |
| `DELETE /api/user/account` | `/api/user/account` | **路径不一致** |
| `POST /api/user/avatar` | — | **后端不存在此接口** |
| `POST /api/coupon/getCouponList` | `/api/coupon/getCouponList` | 一致 |
| `GET /api/money/getMoneyList` | `/api/money/getMoneyList` | 一致 |

### 3.3 `order.service.ts`

| 调用路径 | 对应后端 | 状态 |
|----------|----------|------|
| `GET /api/menu/getMenuList/:id` | `/api/menu/getMenuList/:id` | 一致 |
| `POST /api/menu/createFood` | `/api/menu/createFood` | 一致 |
| `POST /api/upload/uploadImg` | `/api/upload/uploadImg` | 一致 |
| `POST /api/order/create` | `/api/order/create` | **前端未封装** |
| `GET /api/order/list` | `/api/order/list` | **前端未封装** |
| `GET /api/order/detail/:id` | `/api/order/detail/:id` | **前端未封装** |

### 3.4 `points.service.ts`

| 调用路径 | 对应后端 | 状态 |
|----------|----------|------|
| `GET /api/points/getCommodityList` | `/api/points/getCommodityList` | 一致 |
| `GET /api/points/getPointsList` | `/api/points/getPointsList` | 一致 |
| `GET /api/points/getLuckyRollData` | `/api/points/getLuckyRollData` | 一致 |
| `POST /api/points/exchangePrize` | `/api/points/exchangePrize` | 一致 |
| `POST /api/points/exchangeMultiPrize` | `/api/points/exchangeMultiPrize` | 一致 |
| `GET /api/points/getWinningRecords` | `/api/points/getWinningRecords` | 一致 |

---

## 4. 问题汇总

> **接口路径约定**：若前后端接口路径不一致，且前端已在 `services/*.service.ts` 中定义并调用，**一律以前端调用路径为准，修改后端路由匹配前端**。避免前端已写好的调用逻辑被无故改动。

### 4.1 路径不一致（需修复前端调用路径）

| # | 前端调用路径 | 应改为 | 所在文件 |
|---|-------------|--------|----------|
| 1 | `POST /api/auth/logout` | `POST /api/user/logout` | `auth.service.ts` |
| 2 | `POST /api/auth/refresh-token` | `POST /api/user/refresh-token` | `auth.service.ts` |
| 3 | `GET /api/auth/verify` | `GET /api/user/verify` | `auth.service.ts` |
| 4 | `POST /api/user/change-password` | `POST /api/user/change-password` | `user.service.ts` |
| 5 | `GET /api/user/stats` | `GET /api/user/stats` | `user.service.ts` |
| 6 | `DELETE /api/user/account` | `DELETE /api/user/account` | `user.service.ts` |

### 4.2 前端调用不存在的接口

| # | 前端调用路径 | 说明 | 建议 |
|---|-------------|------|------|
| 1 | `POST /api/user/avatar` | 后端无此路由 | 改为调用 `/api/upload/uploadImg`，或后端新增头像上传接口 |

### 4.3 后端已实现但前端未封装

| # | 后端接口 | 说明 | 优先级 |
|---|---------|------|--------|
| 1 | `POST /api/order/create` | 创建订单 | 高 |
| 2 | `GET /api/order/list` | 订单列表 | 高 |
| 3 | `GET /api/order/detail/:id` | 订单详情 | 高 |

### 4.4 后台管理接口（前端暂不需要）

| 路径前缀 | 说明 |
|---------|------|
| `/api/points/prize/*` | 奖品 CRUD，供管理后台使用 |

---

## 5. 后台管理系统规划（admin）

利用 monorepo 架构，在同一仓库中新增管理后台应用 `apps/admin/`，共享后端 API。

### 5.1 技术选型

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| UI 库 | Ant Design 5 |
| 状态/请求 | TanStack Query |
| 样式 | CSS Modules / TailwindCSS |
| 图表 | Ant Design Charts |
| 共享 | 复用 `apps/api` 全部接口 |

### 5.2 项目结构更新

```
OrderFoodApp/
├── apps/
│   ├── mobile/          # 移动端
│   ├── api/             # NestJS 后端
│   └── admin/           # 管理后台（新增）
│       ├── app/         # Next.js App Router
│       ├── components/  # 业务组件
│       ├── lib/         # 工具、API 封装
│       └── package.json
```

### 5.3 功能模块

| 模块 | 功能 | 依赖后端接口 |
|------|------|-------------|
| 仪表盘 | 订单统计、用户增长、销售额 | 新增聚合接口 |
| 菜单管理 | 菜品分类 CRUD、菜品 CRUD | `menu/*` + 新增分类管理 |
| 奖品管理 | 抽奖奖品 CRUD、启用/禁用 | `points/prize/*`（已有） |
| 积分商城 | 商品 CRUD、库存管理 | 新增 `commodity/*` |
| 用户管理 | 用户列表、余额调整、冻结 | 新增 `users/list`、`users/:id` |
| 订单管理 | 订单列表、详情、状态流转 | `order/*` + 新增状态更新 |
| 优惠券 | 优惠券创建、发放、核销 | 新增 `coupon/*` CRUD |
| 充值配置 | 充值金额档位、赠送比例 | `money/*` + 新增 CRUD |
| 系统设置 | 轮播图、公告、基本配置 | 新增 `settings/*` |

### 5.4 后端需补充的接口

| 模块 | 需新增接口 | 说明 |
|------|-----------|------|
| 认证 | `POST /api/auth/admin-login` | 管理员独立登录（或登录后返回角色） |
| 用户 | `GET /api/user/list` | 用户列表（分页、筛选） |
| 用户 | `GET /api/user/:id` | 用户详情 |
| 用户 | `PUT /api/user/:id/balance` | 调整用户余额 |
| 订单 | `PUT /api/order/:id/status` | 修改订单状态 |
| 菜单 | `POST /api/menu/category` | 创建分类 |
| 菜单 | `PUT /api/menu/category/:id` | 更新分类 |
| 菜单 | `DELETE /api/menu/category/:id` | 删除分类 |
| 积分商城 | `POST /api/commodity` | 创建商品 |
| 积分商城 | `PUT /api/commodity/:id` | 更新商品 |
| 积分商城 | `DELETE /api/commodity/:id` | 删除商品 |
| 优惠券 | `POST /api/coupon` | 创建优惠券 |
| 优惠券 | `PUT /api/coupon/:id` | 更新优惠券 |
| 优惠券 | `DELETE /api/coupon/:id` | 删除优惠券 |
| 充值 | `POST /api/money` | 创建充值档位 |
| 充值 | `PUT /api/money/:id` | 更新充值档位 |
| 充值 | `DELETE /api/money/:id` | 删除充值档位 |
| 统计 | `GET /api/dashboard/stats` | 仪表盘聚合数据 |

### 5.5 权限控制

- 用户表增加 `role` 字段：`user`（默认）/ `admin`
- JWT payload 携带 `role`
- 新增 `AdminGuard`：验证 `role === 'admin'`，否则返回 403
- 管理后台路由统一加 `@UseGuards(JwtAuthGuard, AdminGuard)`

### 5.6 实施优先级

| 阶段 | 内容 | 预计工作量 |
|------|------|-----------|
| Phase 1 | 后端：role 字段 + AdminGuard + 用户列表/详情 | 1 天 |
| Phase 2 | 后端：菜单分类 CRUD + 订单状态更新 | 1 天 |
| Phase 3 | 后端：优惠券 CRUD + 积分商品 CRUD + 充值档位 CRUD | 1 天 |
| Phase 4 | 前端 admin：脚手架 + 登录 + 布局框架 | 1 天 |
| Phase 5 | 前端 admin：菜单管理 + 奖品管理 + 订单管理 | 2 天 |
| Phase 6 | 前端 admin：用户管理 + 优惠券 + 积分商城 + 仪表盘 | 2 天 |

---

## 6. 技术栈

### 后端
- **框架**: NestJS 10.x
- **ORM**: Prisma 5.x
- **数据库**: PostgreSQL 15+
- **认证**: JWT
- **密码加密**: bcrypt
- **文件上传**: multer

### Monorepo 工具
- **包管理**: pnpm
- **Workspaces**: pnpm-workspace.yaml
