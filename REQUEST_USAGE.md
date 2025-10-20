# API 请求封装使用指南

## 📁 文件结构

```
request/
  └── index.ts           # Request 类封装 (axios)
  
hooks/
  └── use-request/
      └── index.ts       # useRequest Hook
      
config/
  └── api.config.ts      # API配置文件
  
examples/
  └── request-example.tsx # 使用示例
```

## 🚀 快速开始

### 1. 配置服务端地址

在 `config/api.config.ts` 中修改：

```typescript
export const ENV = {
  development: {
    baseURL: 'http://192.168.1.100:3000', // 改成你的服务器地址
    timeout: 10000,
  },
};

export const CURRENT_ENV = 'development'; // 当前环境
```

### 2. 使用方式

#### 方式A: 直接使用 request

```typescript
import request from '@/request';

// GET 请求
const [error, data] = await request.get<User[]>('/api/users', {
  page: 1,
  size: 10,
});

if (!error) {
  console.log('用户列表:', data);
}

// POST 请求
const [error, result] = await request.post('/api/login', {
  username: 'test',
  password: '123456',
});
```

#### 方式B: 使用 useRequest Hook（推荐）

```typescript
import { useRequest } from '@/hooks/use-request';

function UserList() {
  // 自动请求
  const { data, loading, error, refresh } = useRequest(
    () => request.get('/api/users', { page: 1 }),
    {
      manual: false, // 组件加载时自动请求
    }
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>加载失败</Text>;

  return (
    <View>
      {data?.map(user => <Text key={user.id}>{user.name}</Text>)}
      <Button title="刷新" onPress={refresh} />
    </View>
  );
}
```

#### 方式C: 封装成服务（最佳实践）

```typescript
// services/user.ts
import request from '@/request';

export const userService = {
  login: (username: string, password: string) => {
    return request.post<{ token: string }>('/api/login', {
      username,
      password,
    });
  },
  
  getList: (page: number, size: number) => {
    return request.get<User[]>('/api/users', { page, size });
  },
};

// 在组件中使用
const { data, loading } = useRequest(() => userService.getList(1, 10));
```

## 📝 API 说明

### request 对象

```typescript
// GET 请求
request.get<T>(url: string, params?: any, config?: AxiosRequestConfig): Response<T>

// POST 请求  
request.post<T>(url: string, data?: any, config?: AxiosRequestConfig): Response<T>

// PUT 请求
request.put<T>(url: string, data?: any, config?: AxiosRequestConfig): Response<T>

// DELETE 请求
request.delete<T>(url: string, params?: any, config?: AxiosRequestConfig): Response<T>

// PATCH 请求
request.patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Response<T>

// 上传文件
request.upload<T>(url: string, file: any, config?: AxiosRequestConfig): Response<T>
```

**返回值 Response<T>:**
```typescript
type Response<T> = Promise<[boolean, T, AxiosResponse<T>]>
// [是否错误, 数据, 原始响应]
```

**示例:**
```typescript
const [error, data, response] = await request.get('/api/users');

if (error) {
  console.error('请求失败:', data);
} else {
  console.log('请求成功:', data);
}
```

### useRequest Hook

```typescript
useRequest<T>(
  serviceMethod: (...args: any) => Response<T>,
  options?: {
    manual?: boolean;        // 是否手动触发，默认false
    defaultParams?: any[];   // 默认参数
  }
)
```

**返回值:**
```typescript
{
  data: T | undefined;           // 响应数据
  loading: boolean;              // 加载状态
  error: boolean | undefined;    // 错误状态
  run: (...params: any) => void; // 手动触发（不返回Promise）
  runAsync: (...params: any) => Response<T>; // 手动触发（返回Promise）
  refresh: () => void;           // 使用上次参数重新请求
}
```

**自动请求示例:**
```typescript
const { data, loading, error } = useRequest(
  () => request.get('/api/users'),
  { manual: false } // 组件加载时自动请求
);
```

**手动触发示例:**
```typescript
const { runAsync, loading } = useRequest(
  (username, password) => request.post('/api/login', { username, password }),
  { manual: true } // 手动触发
);

const handleLogin = async () => {
  const [error, data] = await runAsync('user', 'pass');
  if (!error) {
    console.log('登录成功', data);
  }
};
```

## 🔐 Token 管理

### 自动 Token 处理

请求会自动从 `AsyncStorage` 中读取 token 并添加到请求头：

```typescript
Authorization: Bearer <token>
```

### 登录后保存 Token

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
  const [error, data] = await request.post('/api/login', { username, password });
  
  if (!error) {
    // 保存 token
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }
};
```

### 退出登录清除 Token

```typescript
const handleLogout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('userId');
};
```

## 🔄 自动 Token 刷新

当请求返回 `401` 未授权时，会自动：
1. 暂停所有新请求
2. 调用刷新 token 接口
3. 保存新的 token
4. 重新发起失败的请求

**刷新 token 接口配置:**
```typescript
// request/index.ts 中
private refreshTokenUrl = '/api/auth/refresh-token';
```

后端需要提供对应的刷新接口，接收 `refreshToken` 并返回新的 token。

## ⚙️ 高级功能

### 1. 并发控制

默认最大并发数为 100，可以调整：

```typescript
import request from '@/request';

request.setLimit(50); // 设置最大并发数为50
```

### 2. 请求队列

当并发达到上限或正在刷新 token 时，新请求会自动加入队列，等待处理。

### 3. 开发环境日志

开发环境下会自动打印：
- 📤 请求日志：url、method、params、data
- 📥 响应日志：url、status、data
- ❌ 错误日志：url、message、status

## 📋 完整示例

查看 `examples/request-example.tsx` 获取完整的使用示例，包括：

- ✅ 直接使用 request
- ✅ 封装成服务
- ✅ 在组件中使用 request
- ✅ 使用 useRequest Hook（自动请求）
- ✅ 使用 useRequest Hook（手动触发）
- ✅ 创建订单示例

## 🎯 最佳实践

1. **统一管理 API 路径**
   ```typescript
   // config/api.config.ts
   export const API_PATHS = {
     user: {
       login: '/api/user/login',
       profile: '/api/user/profile',
     },
   };
   ```

2. **封装服务层**
   ```typescript
   // services/user.ts
   export const userService = {
     login: (data) => request.post(API_PATHS.user.login, data),
     getProfile: () => request.get(API_PATHS.user.profile),
   };
   ```

3. **使用 TypeScript 类型**
   ```typescript
   interface User {
     id: string;
     name: string;
   }
   
   const [error, user] = await request.get<User>('/api/user');
   ```

4. **错误处理**
   ```typescript
   const [error, data] = await request.get('/api/users');
   
   if (error) {
     Alert.alert('错误', '加载失败');
     return;
   }
   
   // 使用 data
   ```

5. **使用 useRequest 简化状态管理**
   ```typescript
   // 不推荐：手动管理状态
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState();
   
   // 推荐：使用 useRequest
   const { data, loading } = useRequest(() => request.get('/api/users'));
   ```

## 🔧 故障排查

### 1. 请求失败
- 检查 `config/api.config.ts` 中的 `baseURL` 是否正确
- 检查网络连接
- 查看控制台日志

### 2. Token 相关
- 确认已保存 token 到 AsyncStorage
- 检查 token 格式是否正确
- 确认后端返回的 token 字段名

### 3. 类型错误
- 确保使用正确的泛型类型
- 检查后端返回的数据结构

## 📞 支持

如有问题，请查看：
- `examples/request-example.tsx` - 完整示例
- `config/api.config.ts` - 配置说明
- 控制台日志 - 开发环境会输出详细日志
