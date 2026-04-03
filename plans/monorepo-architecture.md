# OrderFoodApp Monorepo 架构设计

## 1. 项目结构

```
OrderFoodApp/
├── apps/
│   ├── mobile/                 # 现有的 React Native 前端 (Expo)
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── package.json
│   └── api/                    # NestJS 后端
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/         # 公共模块
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── pipes/
│       │   ├── modules/
│       │   │   ├── auth/       # 认证模块
│       │   │   ├── user/       # 用户模块
│       │   │   ├── menu/       # 菜单/菜品模块
│       │   │   ├── order/      # 订单模块
│       │   │   ├── points/     # 积分/抽奖模块
│       │   │   ├── coupon/     # 优惠券模块
│       │   │   ├── money/      # 充值模块
│       │   │   └── upload/     # 文件上传模块
│       │   └── prisma/
│       │       └── prisma.service.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── test/
│       └── package.json
├── packages/
│   ├── shared-types/           # 前后端共享类型定义
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── order.ts
│   │   │   ├── menu.ts
│   │   │   ├── points.ts
│   │   │   └── coupon.ts
│   │   └── package.json
│   └── config/                 # 共享配置
│       ├── eslint/
│       ├── typescript/
│       └── package.json
├── package.json                # Root package.json (workspaces)
├── pnpm-workspace.yaml         # pnpm workspaces 配置
├── tsconfig.json
└── README.md
```

## 2. API 接口分析

根据前端代码分析，后端需要实现以下 API 接口：

### 2.1 认证模块 (`/api/users`, `/api/auth`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | `/api/users/login` | 用户登录 | `{ phone, password }` | `{ code, token, user }` |
| POST | `/api/users/register` | 用户注册 | `{ phone, password, username }` | `{ code, token, user }` |
| POST | `/api/auth/logout` | 退出登录 | - | `{ message }` |
| POST | `/api/auth/refresh-token` | 刷新Token | `{ refreshToken }` | `{ token, refreshToken }` |
| GET | `/api/auth/verify` | 验证Token | - | `{ valid }` |

### 2.2 用户模块 (`/api/users`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/users/getUserInfo` | 获取用户信息 | - | `{ code, data: User }` |
| PUT | `/api/users/update` | 更新用户信息 | `{ username?, avatar?, gender?, birthday? }` | `{ code, data: User }` |
| POST | `/api/users/rechargeAndDeduct` | 余额充值/扣除 | `{ balance, giveBalance, isRecharge }` | `{ code, data: User }` |
| GET | `/api/users/getRechargeRecord` | 获取充值记录 | - | `{ code, data: TopUpRecord[] }` |
| GET | `/api/users/getCheckInStatus` | 获取签到状态 | - | `{ code, data }` |
| POST | `/api/users/checkIn` | 签到 | - | `{ code, data }` |

### 2.3 菜单/菜品模块 (`/api/menu`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/menu/getMenuList/:id?` | 获取菜单列表 | - | `{ code, data: CategoryData[] }` |
| POST | `/api/menu/createFood` | 创建菜品 | `{ classifyId, foodName, foodPrice, foodImage }` | `{ code, data }` |

### 2.4 文件上传模块 (`/api/upload`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | `/api/upload/uploadImg` | 上传图片 | `FormData { file }` | `{ code, data: { url } }` |

### 2.5 优惠券模块 (`/api/coupon`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | `/api/coupon/getCouponList` | 获取优惠券列表 | `{ isExpired? }` | `{ code, data: Coupon[] }` |

### 2.6 充值金额模块 (`/api/money`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/money/getMoneyList` | 获取充值选项 | - | `{ code, data: MoneyOption[] }` |

### 2.7 积分/抽奖模块 (`/api/points`)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/points/getLuckyRollData` | 获取抽奖数据 | - | `{ code, data: { prizeList, userIntegral, luckyDrawCount } }` |
| POST | `/api/points/exchangePrize` | 兑换奖品(单抽) | `{ prizeId, costIntegral }` | `{ code, data }` |
| POST | `/api/points/exchangeMultiPrize` | 十连抽 | `{ prizeIds, costIntegral }` | `{ code, data }` |
| GET | `/api/points/getWinningRecords` | 获取中奖记录 | `{ isBigPrize? }` | `{ code, data: WinningInfo[] }` |
| GET | `/api/points/getCommodityList` | 获取积分商城商品 | - | `{ code, data: Commodity[] }` |
| GET | `/api/points/getPointsList` | 获取积分收支记录 | `{ page, limit }` | `{ code, data: PointRecord[] }` |

## 3. 数据库设计 (Prisma Schema)

```prisma
// 用户模型
model User {
  id        String   @id @default(cuid())
  phone     String   @unique
  username  String
  password  String
  avatar    String?
  gender    Int      @default(2) // 0: 男, 1: 女, 2: 保密
  birthday  DateTime?
  balance   Float    @default(0)
  integral  Int      @default(0) // 积分
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联
  topUpRecords    TopUpRecord[]
  pointRecords    PointRecord[]
  lotteryRecords  LotteryRecord[]
  coupons         UserCoupon[]
  orders          Order[]
  checkInRecords  CheckInRecord[]
}

// 充值记录
model TopUpRecord {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  balance     Float    // 充值金额
  giveBalance Float    @default(0) // 赠送金额
  totalBalance Float  // 充值后余额
  createdAt   DateTime @default(now())
}

// 充值选项配置
model MoneyOption {
  id        String  @id @default(cuid())
  money     Float   // 充值金额
  giveMoney Float   @default(0) // 赠送金额
  sortOrder Int     @default(0)
  isActive  Boolean @default(true)
}

// 菜品分类
model FoodCategory {
  id           String   @id @default(cuid())
  classifyName String
  icon         String?
  sortOrder    Int      @default(0)
  foods        Food[]
}

// 菜品
model Food {
  id           String   @id @default(cuid())
  classifyId   String
  category     FoodCategory @relation(fields: [classifyId], references: [id])
  foodName     String
  foodImage    String?
  foodPrice    Float
  sortOrder    Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// 抽奖奖品配置
model LotteryPrize {
  id             String   @id @default(cuid())
  prizeName      String
  prizeImage     String
  prizeIntegral  Int      @default(0) // 0表示实物大奖，>0表示积分
  prizeValue     Float?   // 奖品价值
  stock          Int      @default(0) // 库存
  sortOrder      Int      @default(0)
  isActive       Boolean  @default(true)
  lotteryRecords LotteryRecord[]
}

// 抽奖记录
model LotteryRecord {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  prizeId    String
  prize      LotteryPrize @relation(fields: [prizeId], references: [id])
  costIntegral Int    // 消耗积分
  createdAt  DateTime @default(now())
}

// 积分商城商品
model Commodity {
  id                 String   @id @default(cuid())
  commodityName      String
  commodityImage     String
  commodityIntegral  Int      // 所需积分
  stock              Int      @default(0)
  sortOrder          Int      @default(0)
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
}

// 积分收支记录
model PointRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  integral  Int      // 正数表示收入，负数表示支出
  isGet     Boolean  // true: 收入, false: 支出
  remark    String
  createdAt DateTime @default(now())
}

// 优惠券
model Coupon {
  id              String   @id @default(cuid())
  couponName      String
  couponAmount    Float    // 优惠券金额
  consumeMoney    Float    // 使用门槛
  couponUseTime   DateTime // 有效期
  totalStock      Int      @default(0)
  remainStock     Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  userCoupons     UserCoupon[]
}

// 用户优惠券
model UserCoupon {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  couponId  String
  coupon    Coupon   @relation(fields: [couponId], references: [id])
  status    String   @default("unused") // unused: 未使用, used: 已使用
  usedAt    DateTime?
  createdAt DateTime @default(now())
}

// 签到记录
model CheckInRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  integral  Int      @default(0) // 签到获得的积分
  createdAt DateTime @default(now())

  @@unique([userId, createdAt(sort: DESC)])
}

// 订单
model Order {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  orderType   String   // dine-in: 堂食, takeout: 外卖
  status      String   @default("pending") // pending, paid, completed, cancelled
  totalAmount Float
  payAmount   Float    // 实际支付金额
  address     String?  // 外卖地址
  peopleCount Int?     // 就餐人数
  remark      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orderItems  OrderItem[]
}

// 订单明细
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  foodId    String
  foodName  String
  foodPrice Float
  quantity  Int
  subtotal  Float
}
```

## 4. 技术栈

### 后端
- **框架**: NestJS 10.x
- **ORM**: Prisma 5.x
- **数据库**: PostgreSQL 15+
- **认证**: JWT (jsonwebtoken / @nestjs/jwt)
- **密码加密**: bcrypt
- **文件上传**: @nestjs/platform-express (multer)
- **验证**: class-validator, class-transformer
- **文档**: @nestjs/swagger

### Monorepo 工具
- **包管理**: pnpm
- **Workspaces**: pnpm-workspace.yaml

## 5. 模块依赖关系

```mermaid
graph TD
    A[AppModule] --> B[AuthModule]
    A --> C[UserModule]
    A --> D[MenuModule]
    A --> E[OrderModule]
    A --> F[PointsModule]
    A --> G[CouponModule]
    A --> H[MoneyModule]
    A --> I[UploadModule]
    
    B --> C
    D --> B
    E --> B
    E --> C
    E --> D
    F --> B
    F --> C
    G --> B
    G --> C
    H --> B
    H --> C
```

## 6. 认证流程

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant API as API Gateway
    participant Auth as Auth Module
    participant DB as Database
    
    Client->>API: POST /api/users/login {phone, password}
    API->>Auth: 验证凭据
    Auth->>DB: 查询用户
    DB-->>Auth: 用户数据
    Auth->>Auth: 验证密码
    Auth->>Auth: 生成 JWT Token
    Auth-->>API: {token, user}
    API-->>Client: {code: 0, token, user}
    
    Note over Client,DB: 后续请求携带 Token
    
    Client->>API: GET /api/users/getUserInfo
    API->>Auth: 验证 JWT
    Auth-->>API: 用户信息
    API-->>Client: {code: 0, data: user}
```

## 7. 实施步骤

### Phase 1: 基础设施搭建
1. 初始化 monorepo 项目结构
2. 配置 pnpm workspaces
3. 创建 NestJS 应用
4. 配置 Prisma 和 PostgreSQL
5. 实现数据库迁移脚本

### Phase 2: 核心模块开发
1. 用户认证模块 (登录、注册、JWT)
2. 用户管理模块 (CRUD、充值、签到)
3. 文件上传模块

### Phase 3: 业务模块开发
1. 菜单/菜品模块
2. 订单模块
3. 积分/抽奖模块
4. 优惠券模块
5. 充值金额模块

### Phase 4: 集成与测试
1. 前后端联调
2. 编写单元测试
3. 编写 E2E 测试
4. API 文档生成

## 8. 环境变量配置

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/orderfood?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880 # 5MB
```

## 9. 注意事项

1. **密码安全**: 使用 bcrypt 进行密码哈希，盐值 rounds = 10
2. **Token 管理**: 实现 Token 刷新机制，支持 refresh token
3. **文件上传**: 限制文件大小和类型，防止恶意上传
4. **数据验证**: 使用 class-validator 进行请求体验证
5. **错误处理**: 统一异常处理，返回标准格式响应
6. **日志记录**: 记录关键操作日志，便于问题排查
7. **并发控制**: 抽奖模块需要处理并发问题，防止超发
