# 移动端 (apps/mobile)

基于 React Native + Expo 构建的餐厅点餐移动应用。

## 快速开始

```bash
pnpm install
pnpm dev:mobile   # 启动 Expo 开发服务器
```

按 `a` 打开 Android 模拟器，`i` 打开 iOS 模拟器，或扫码在真机运行。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React Native + Expo Router 6 |
| UI | React Native Paper (Material Design) |
| 状态管理 | Zustand + AsyncStorage |
| 网络请求 | Axios 封装（`request/index.ts`） |
| 导航 | Expo Router（基于文件系统） |
| 语言 | TypeScript |

## 目录结构

```
apps/mobile/
├── app/                  # 页面（Expo Router 文件路由）
│   ├── (tabs)/           # 底部导航：首页、订单、个人中心
│   ├── (member)/         # 会员：会员码、充值
│   ├── (points)/         # 积分：积分页、商城、抽奖
│   ├── (orderfood)/      # 点餐：人数选择、结算
│   ├── (location)/       # 位置：城市选择、地址选择
│   ├── queue/            # 排队：门店列表、取号和进度
│   ├── auth/             # 认证：登录、注册
│   └── user/             # 用户：账户、优惠券、在线客服
├── components/           # 可复用组件
├── services/             # API 服务层
├── request/              # Axios 封装（返回 [error, data] 元组）
├── hooks/use-request/    # useRequest Hook
├── stores/               # Zustand 状态
├── config/               # API 地址配置
├── utils/                # 工具函数、Toast
├── constants/            # 主题等常量
├── assets/               # 图片等静态资源
├── examples/             # 示例代码
└── docs/                 # 技术文档
```

## 核心约定

- 网络请求统一返回 `[error, data]` 判别元组；成功时 `data` 为已解包的业务数据，失败时为统一错误对象
- Token 通过 `tokenManager`（`services/auth.service.ts`）管理；请求拦截器自动注入，并在 401 时合并并发请求后刷新 Token
- 全局 Toast：`ToastManager.show(msg, options)` 来自 `utils/toast.tsx`
- API 地址配置：`config/api.config.ts`，支持 development / staging / production 三套环境

## 排队与在线客服

- 首页“排队取号”进入真实门店列表，可选择 1-20 位就餐人数并生成 A/B 组号码。
- “我的排队”展示前方桌数与预计等待时间，每 15 秒刷新，也支持手动刷新和取消。
- 消息页“在线客服”展示最近消息及未读数；聊天页每 4 秒与管理后台同步。
- 排队取号和客服发消息都需要登录，门店列表允许未登录浏览。

## 构建

```bash
# 预览版（推荐测试）
eas build --profile preview --platform android

# 生产版
eas build --profile production --platform all
```

详见 [docs/development-guide.md](docs/development-guide.md)。

## 接口契约

移动端服务优先复用 `packages/common/src` 的共享类型。订单、菜单、用户、积分、优惠券等接口变更时，需要同步更新共享类型和 Nest DTO，避免仅靠类型断言掩盖响应差异。
