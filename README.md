# 餐厅 App# Welcome to your Expo app 👋



基于 React Native 和 Expo 构建的餐厅点餐应用。This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).



## 🚀 快速开始## Get started



```bash1. Install dependencies

# 安装依赖

npm install   ```bash

   npm install

# 启动开发服务器   ```

npx expo start

2. Start the app

# 扫码或选择平台打开

# - 使用 Expo Go (iOS/Android)   ```bash

# - 按 'a' 打开 Android 模拟器   npx expo start

# - 按 'i' 打开 iOS 模拟器   ```

```

In the output, you'll find options to open the app in a

## ✨ 主要功能

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

- 🍽️ **堂食/外卖点餐** - 支持不同就餐方式- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

- 📍 **智能定位** - 自动定位当前城市- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

- 🔍 **城市搜索** - 支持中文、拼音、首字母搜索- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

- 🏪 **门店查找** - 根据城市显示附近门店

- 👤 **会员管理** - 个人信息和订单管理You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

- 💾 **智能缓存** - 记住上次选择的城市

## Get a fresh project

## 📱 定位功能使用

When you're ready, run:

### 如何区分真实定位和缓存

```bash

在城市选择页面，"当前定位城市"旁会显示：npm run reset-project

```

- **[已保存]** (蓝色) - 来自上次选择的缓存

- **[定位中...]** (橙色) - 正在进行 GPS 定位This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

- **✓ 绿色对勾** - 刚完成的真实定位

## Learn more

### 查看定位日志

To learn more about developing your project with Expo, look at the following resources:

打开开发者工具控制台，查看详细日志：

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

```- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

💾 [缓存] 从本地存储加载城市: 北京市  ← 缓存数据

📍 [定位] 无缓存，开始真实定位...      ← 真实定位## Join the community

✅ [成功] 真实定位获取到城市: 北京市   ← 定位成功

```Join our community of developers creating universal apps.



### 清除缓存测试- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

当显示 `[已保存]` 时，点击下方的 **"清除缓存并重新定位"** 按钮即可立即重新定位。

## 🗂️ 项目结构

```
├── app/                    # 页面路由
│   ├── (tabs)/            # 底部导航
│   │   ├── index.tsx     # 首页
│   │   ├── order.tsx     # 点餐
│   │   ├── orders.tsx    # 订单
│   │   └── profile.tsx   # 我的
│   ├── (location)/        # 位置相关页面
│   │   ├── citySelect.tsx    # 城市选择（定位功能）
│   │   └── addressSelect.tsx # 门店选择
│   ├── (member)/          # 会员相关页面
│   │   └── memberCode.tsx    # 会员码
│   └── splash.tsx         # 启动页
├── components/            # 可复用组件
├── stores/               # 状态管理 (Zustand)
├── utils/                # 工具函数
└── constants/            # 常量配置
```

## 📦 技术栈

- **React Native** + **Expo** - 跨平台开发
- **Expo Router** - 文件路由
- **React Native Paper** - Material Design UI
- **expo-location** - 定位服务
- **Zustand** - 状态管理
- **TypeScript** - 类型安全
- **pinyin-pro** - 拼音搜索

## 🔧 权限配置

定位权限已在 `app.json` 中配置：

- ✅ iOS: NSLocationWhenInUseUsageDescription
- ✅ Android: ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION

## 📝 开发说明

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

## 📝 License

MIT
