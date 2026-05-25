/**
 * API 请求使用示例
 * 展示如何使用 request 和 useRequest
 */
import { useRequest } from '@/hooks/use-request';
import request from '@/request';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

// ==================== 定义数据类型 ====================

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// ==================== 示例1: 直接使用 request ====================

// 用户登录
export const loginExample = async (username: string, password: string) => {
  const [error, data, response] = await request.post<{ token: string; user: User }>(
    '/api/user/login',
    {
      username,
      password,
    }
  );

  if (error) {
    console.error('登录失败:', data);
    Alert.alert('错误', '登录失败');
    return null;
  }

  console.log('登录成功:', data);
  return data;
};

// 获取用户列表
export const getUsersExample = async () => {
  const [error, data] = await request.get<User[]>('/api/users', {
    page: 1,
    size: 10,
  });

  if (error) {
    console.error('获取用户列表失败');
    return [];
  }

  return data;
};

// ==================== 示例2: 封装成服务（推荐） ====================

export const userService = {
  // 登录
  login: (username: string, password: string) => {
    return request.post<{ token: string; user: User }>('/api/user/login', {
      username,
      password,
    });
  },

  // 获取用户信息
  getProfile: () => {
    return request.get<User>('/api/user/profile');
  },

  // 更新用户信息
  updateProfile: (data: Partial<User>) => {
    return request.put<User>('/api/user/profile', data);
  },

  // 获取用户列表
  getList: (page: number, size: number) => {
    return request.get<User[]>('/api/users', { page, size });
  },
};

export const orderService = {
  // 获取订单列表
  getList: (page: number, size: number) => {
    return request.get<Order[]>('/api/orders', { page, size });
  },

  // 获取订单详情
  getDetail: (orderId: string) => {
    return request.get<Order>(`/api/orders/${orderId}`);
  },

  // 创建订单
  create: (items: OrderItem[]) => {
    return request.post<Order>('/api/orders', { items });
  },

  // 取消订单
  cancel: (orderId: string) => {
    return request.post<void>(`/api/orders/${orderId}/cancel`);
  },
};

// ==================== 示例3: 在组件中直接使用 request ====================

export function UserListComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);

    const [error, data] = await userService.getList(1, 20);

    setLoading(false);

    if (error) {
      Alert.alert('错误', '获取用户列表失败');
      return;
    }

    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>用户列表</Text>
      {users.map((user) => (
        <View key={user.id} style={styles.item}>
          <Text>{user.name}</Text>
          <Text style={styles.subText}>{user.email}</Text>
        </View>
      ))}
      <Button title="刷新" onPress={loadUsers} />
    </View>
  );
}

// ==================== 示例4: 使用 useRequest Hook（推荐） ====================

export function OrderListComponent() {
  // 自动请求订单列表
  const { data: orders, loading, error, refresh } = useRequest(
    () => orderService.getList(1, 10),
    {
      manual: false, // false: 自动请求, true: 手动触发
    }
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>加载失败</Text>
        <Button title="重试" onPress={refresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>订单列表</Text>
      {orders?.map((order) => (
        <View key={order.id} style={styles.item}>
          <Text>订单号: {order.id}</Text>
          <Text>总价: ¥{order.total}</Text>
          <Text>状态: {order.status}</Text>
        </View>
      ))}
      <Button title="刷新" onPress={refresh} />
    </View>
  );
}

// ==================== 示例5: 手动触发请求 ====================

export function LoginComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 手动模式，需要调用run来触发请求
  const { runAsync: doLogin, loading } = useRequest(
    (user: string, pass: string) => userService.login(user, pass),
    {
      manual: true, // 手动触发
    }
  );

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('提示', '请输入用户名和密码');
      return;
    }

    const [error, data] = await doLogin(username, password);

    if (error) {
      Alert.alert('错误', '登录失败');
      return;
    }

    // 保存token
    // await AsyncStorage.setItem('token', data.token);
    Alert.alert('成功', '登录成功');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>用户登录</Text>
      
      <TextInput
        style={styles.input}
        placeholder="用户名"
        value={username}
        onChangeText={setUsername}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <Button
        title={loading ? '登录中...' : '登录'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

// ==================== 示例6: 创建订单（手动触发） ====================

export function CreateOrderComponent() {
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '商品1', price: 99, quantity: 1 },
    { id: '2', name: '商品2', price: 199, quantity: 2 },
  ]);

  const { runAsync: createOrder, loading, data } = useRequest(
    (orderItems: OrderItem[]) => orderService.create(orderItems),
    {
      manual: true,
    }
  );

  const handleCreateOrder = async () => {
    const [error, order] = await createOrder(items);

    if (error) {
      Alert.alert('错误', '创建订单失败');
      return;
    }

    Alert.alert('成功', `订单 ${order.id} 创建成功`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>创建订单</Text>
      
      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text>{item.name}</Text>
          <Text>¥{item.price} x {item.quantity}</Text>
        </View>
      ))}
      
      <View style={styles.total}>
        <Text style={styles.totalText}>
          总计: ¥{items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        </Text>
      </View>
      
      <Button
        title={loading ? '创建中...' : '创建订单'}
        onPress={handleCreateOrder}
        disabled={loading}
      />
      
      {data && (
        <Text style={styles.success}>订单创建成功！订单号: {data.id}</Text>
      )}
    </View>
  );
}

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  subText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  total: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
    marginTop: 16,
    textAlign: 'center',
  },
});

// ==================== 使用说明 ====================
/*
📚 使用指南:

1. 配置服务端地址
   在 config/api.config.ts 中设置:
   baseURL: 'http://你的服务器IP:端口'

2. 两种使用方式:

   方式A - 直接使用 request (适合简单场景):
   ```typescript
   const [error, data] = await request.get('/api/users');
   if (!error) {
     console.log(data);
   }
   ```

   方式B - 使用 useRequest Hook (推荐):
   ```typescript
   const { data, loading, error, refresh } = useRequest(
     () => userService.getList(1, 10)
   );
   ```

3. 返回值说明:
   - request 返回: [error, data, response]
   - error: boolean - 是否有错误
   - data: T - 响应数据
   - response: AxiosResponse - 原始响应对象

4. useRequest Hook 特性:
   - 自动管理 loading、error、data 状态
   - manual: false - 组件加载时自动请求
   - manual: true - 需手动调用 run 触发
   - refresh() - 使用上次参数重新请求
   - runAsync() - 返回Promise，可await获取结果

5. Token 管理:
   - Token 自动从 AsyncStorage 读取
   - 登录后保存: await AsyncStorage.setItem('token', token)
   - 401 错误会自动尝试刷新 token 并重试

6. 高级特性:
   - 自动 Token 刷新
   - 请求队列管理
   - 并发控制 (默认100)
   - 开发环境日志输出
*/
