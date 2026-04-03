# OrderFoodApp Monorepo

点餐系统 Monorepo 项目，包含 React Native 前端和 NestJS 后端。

## 项目结构

```
OrderFoodApp/
├── apps/
│   ├── mobile/          # React Native 前端 (Expo)
│   └── api/             # NestJS 后端
├── packages/
│   └── shared-types/    # 共享类型定义
└── plans/
    └── monorepo-architecture.md  # 架构设计文档
```

## 技术栈

### 前端 (apps/mobile)
- React Native + Expo
- Expo Router (文件路由)
- NativeWind (Tailwind CSS)
- Zustand (状态管理)
- Axios (HTTP 请求)

### 后端 (apps/api)
- NestJS 10.x
- Prisma 5.x (ORM)
- PostgreSQL
- JWT 认证
- Swagger API 文档

## 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 15

### 安装依赖

```bash
# 安装 pnpm (如果还没有)
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 配置数据库

1. 修改 `apps/api/.env` 中的数据库配置：
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orderfood?schema=public"
```

2. 生成 Prisma 客户端：
```bash
pnpm prisma:generate
```

3. 运行数据库迁移：
```bash
pnpm prisma:migrate
```

### 启动开发服务器

```bash
# 启动后端 API 服务
pnpm dev:api

# 启动前端移动端
pnpm dev:mobile
```

### API 文档

启动后端服务后，访问 http://localhost:5000/api-docs 查看 Swagger API 文档。

## 可用脚本

```bash
# 根目录
pnpm dev:api          # 启动后端开发服务器
pnpm dev:mobile       # 启动前端开发服务器
pnpm prisma:generate  # 生成 Prisma 客户端
pnpm prisma:migrate   # 运行数据库迁移
pnpm prisma:studio    # 打开 Prisma Studio 数据库管理界面

# 后端 (apps/api)
pnpm start            # 启动生产服务器
pnpm start:dev        # 启动开发服务器 (watch 模式)
pnpm build            # 构建项目
pnpm test             # 运行测试
```

## API 接口

### 认证模块
- `POST /api/users/login` - 用户登录
- `POST /api/users/register` - 用户注册
- `POST /api/auth/refresh-token` - 刷新 Token
- `GET /api/auth/verify` - 验证 Token

### 用户模块
- `GET /api/users/getUserInfo` - 获取用户信息
- `PUT /api/users/update` - 更新用户信息
- `POST /api/users/rechargeAndDeduct` - 余额充值/扣除
- `GET /api/users/getRechargeRecord` - 获取充值记录
- `GET /api/users/getCheckInStatus` - 获取签到状态
- `POST /api/users/checkIn` - 签到

### 菜单模块
- `GET /api/menu/getMenuList/:id?` - 获取菜单列表
- `POST /api/menu/createFood` - 创建菜品

### 积分模块
- `GET /api/points/getLuckyRollData` - 获取抽奖数据
- `POST /api/points/exchangePrize` - 兑换奖品(单抽)
- `POST /api/points/exchangeMultiPrize` - 十连抽
- `GET /api/points/getWinningRecords` - 获取中奖记录
- `GET /api/points/getCommodityList` - 获取积分商城商品
- `GET /api/points/getPointsList` - 获取积分收支记录

### 优惠券模块
- `POST /api/coupon/getCouponList` - 获取用户优惠券列表

### 充值模块
- `GET /api/money/getMoneyList` - 获取充值选项列表

### 文件上传
- `POST /api/upload/uploadImg` - 上传图片

## 数据库模型

- User (用户)
- TopUpRecord (充值记录)
- MoneyOption (充值选项)
- FoodCategory (菜品分类)
- Food (菜品)
- LotteryPrize (抽奖奖品)
- LotteryRecord (抽奖记录)
- Commodity (积分商城商品)
- PointRecord (积分收支)
- Coupon (优惠券)
- UserCoupon (用户优惠券)
- CheckInRecord (签到记录)
- Order (订单)
- OrderItem (订单明细)

## 许可证

MIT
