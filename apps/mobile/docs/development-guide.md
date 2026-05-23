# 开发指南

## Android HTTP 明文传输配置

Android 9（API 28）及以上版本默认屏蔽 HTTP 明文传输。使用 EAS Build 时需通过插件配置，**不能**直接修改本地 `android/` 原生文件。

**`app.config.js` 配置：**

```js
plugins: [
  "expo-router",
  [
    "expo-build-properties",
    {
      android: {
        usesCleartextTraffic: true,
        networkInspector: true,
      },
    },
  ],
],
android: {
  usesCleartextTraffic: true,
  // ...
}
```

安装依赖：`pnpm add expo-build-properties`

> 生产环境建议升级为 HTTPS（如 Let's Encrypt）。

---

## 环境配置

编辑 `config/api.config.ts`：

```ts
export const ENV = {
  development: { baseURL: 'http://192.168.x.x:5000', timeout: 10000 },
  staging:     { baseURL: 'https://staging.example.com', timeout: 10000 },
  production:  { baseURL: 'https://api.example.com', timeout: 10000 },
};
export const CURRENT_ENV = 'development';
```

EAS 构建环境映射（`eas.json`）：
- `development` → `APP_ENV=development`
- `preview` → `APP_ENV=staging`
- `production` → `APP_ENV=production`

---

## EAS 构建

```bash
# 开发版（内部测试）
eas build --profile development --platform android

# 预览版（测试分发）
eas build --profile preview --platform android

# 生产版（应用商店）
eas build --profile production --platform all

# 清除缓存重新构建
eas build --profile preview --platform android --clear-cache
```

构建完成后：
- EAS 网站：https://expo.dev/accounts/ar1se/projects/rn-components
- 命令行查看：`eas build:list`

---

## 调试

```bash
# ADB 日志过滤
adb logcat | grep -E "🌍|🔗|❌"

# Development 构建 + 开发服务器（推荐）
eas build --profile development --platform android
npx expo start --dev-client
```

---

## Toast 组件

详见 [toast-guide.md](toast-guide.md)。

```ts
import ToastManager from '@/utils/toast';

ToastManager.show('操作成功');
ToastManager.show('错误', { position: 'top', duration: 3000, containerStyle: { backgroundColor: '#f44336' } });
```

---

## 权限配置

已在 `app.config.js` 中配置：
- Android：`CAMERA`、`ACCESS_COARSE_LOCATION`、`ACCESS_FINE_LOCATION`
- iOS：`NSCameraUsageDescription`、`NSLocationWhenInUseUsageDescription`
- Package：`com.ar1se.restaurant`
