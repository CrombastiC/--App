# EAS 构建指南

## 📱 项目已配置完成！

您的餐厅 App 已经配置好 EAS Build，可以开始构建了。

## 🚀 构建命令

### 1. 开发版本（用于内部测试）
```bash
eas build --profile development --platform android
```

### 2. 预览版本（用于测试分发）
```bash
eas build --profile preview --platform android
```

### 3. 生产版本（用于发布到应用商店）
```bash
eas build --profile production --platform android
```

### 4. 同时构建 iOS 和 Android
```bash
eas build --profile production --platform all
```

## 📋 构建配置说明

### eas.json 配置文件
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

## 🔑 已配置的权限

### Android 权限
- ✅ 相机权限（扫描二维码）
- ✅ 位置权限（显示附近门店）
- ✅ Package: `com.ar1se.restaurant`

### iOS 权限
- ✅ 相机权限（扫描二维码）
- ✅ 位置权限（显示附近门店）
- ✅ Bundle Identifier: `com.ar1se.restaurant`

## 📦 构建流程

### 第一次构建（推荐预览版）
```bash
# 1. 确保代码已提交
git add .
git commit -m "准备构建"

# 2. 开始构建
eas build --profile preview --platform android

# 3. 等待构建完成（通常需要 5-15 分钟）
# 构建完成后会显示下载链接
```

### 构建选项说明
在构建过程中，可能会询问：
1. **是否自动生成凭证？** → 选择 `Yes`（首次构建）
2. **是否要生成新的 Keystore？** → 选择 `Yes`（Android）
3. **应用商店凭证** → 如果只是测试，可以跳过

## 📥 下载和安装

### 方法 1：通过 EAS 网站
1. 访问：https://expo.dev/accounts/ar1se/projects/rn-components
2. 找到最新的构建
3. 下载 APK 文件
4. 在 Android 设备上安装

### 方法 2：通过命令行
```bash
# 查看构建列表
eas build:list

# 下载最新构建
eas build:download --latest
```

### 方法 3：扫码安装
构建完成后，会生成一个二维码，用手机扫描即可安装

## 🔄 更新版本

### 更新版本号
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

## 🐛 常见问题

### 1. 构建失败
```bash
# 查看详细错误日志
eas build:list
# 点击失败的构建查看日志
```

### 2. 清理缓存重新构建
```bash
eas build --profile preview --platform android --clear-cache
```

### 3. 本地构建（需要 Android Studio/Xcode）
```bash
eas build --profile preview --platform android --local
```

## 📱 测试安装

### Android
1. 在手机上启用"未知来源安装"
2. 下载 APK 文件
3. 点击安装

### iOS（需要 Apple Developer 账号）
1. 使用 TestFlight
2. 或通过 Ad Hoc 分发

## 🎯 推荐工作流程

### 开发阶段
```bash
npm start  # 本地开发，使用 Expo Go
```

### 测试阶段
```bash
eas build --profile preview --platform android
```

### 发布阶段
```bash
# 1. 更新版本号
# 2. 构建生产版本
eas build --profile production --platform all

# 3. 提交到应用商店
eas submit --platform android
eas submit --platform ios
```

## 📊 构建状态查看

```bash
# 查看所有构建
eas build:list

# 查看特定构建
eas build:view <build-id>

# 取消正在进行的构建
eas build:cancel
```

## 🔗 有用的链接

- EAS 项目页面: https://expo.dev/accounts/ar1se/projects/rn-components
- EAS 构建文档: https://docs.expo.dev/build/introduction/
- EAS 提交文档: https://docs.expo.dev/submit/introduction/

## ✅ 下一步

现在您可以运行以下命令开始构建：

```bash
eas build --profile preview --platform android
```

构建完成后，您将获得一个可以直接安装到 Android 设备的 APK 文件！
