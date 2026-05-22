# OrderFoodApp

点餐系统 Monorepo，React Native (Expo) 前端 + NestJS 后端。

## 结构

```
apps/
├── mobile/          # Expo React Native
└── api/             # NestJS + Prisma
packages/
└── common/          # 共享类型
```

## 技术栈

| | 前端 | 后端 |
|---|---|---|
| 框架 | Expo Router 6 | NestJS 10 |
| 样式 | NativeWind (TailwindCSS) | - |
| 状态 | Zustand | - |
| 请求 | Axios | - |
| ORM | - | Prisma |
| 数据库 | - | PostgreSQL |
| 认证 | - | JWT |

## 快速开始

```bash
pnpm install          # 依赖
pnpm dev:api          # 后端 http://localhost:5000
pnpm dev:mobile       # 前端 Expo Go
```

后端 API 文档：`http://localhost:5000/api-docs`

## 环境变量

`apps/api/.env`：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orderfood?schema=public"
JWT_SECRET="your-secret"
```

`apps/mobile` 高德定位 Key 通过 `app.config.js` extra 注入，生产环境用 EAS Secrets。

## 核心功能

- **堂食点餐**：选人数 → 菜单 → 购物车 → 结算
- **外卖**：选地址 → 门店列表 → 点餐
- **积分抽奖**：单抽 / 十连抽，中奖播报
- **会员充值**：余额 + 积分
- **签到**：每日签到获积分

## 数据库

```bash
pnpm prisma:migrate   # 迁移
pnpm prisma:studio    # 管理界面
pnpm prisma:seed      # 种子数据
```

## 许可证

MIT
