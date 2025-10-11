import { MMKV } from 'react-native-mmkv';

// 创建 MMKV 实例
export const storage = new MMKV({
  id: 'rn-components-storage',
  encryptionKey: 'your-encryption-key-here', // 可选：用于数据加密
});

// 存储工具类
export class StorageUtils {
  // 存储字符串
  static setString(key: string, value: string): void {
    storage.set(key, value);
  }

  // 获取字符串
  static getString(key: string): string | undefined {
    return storage.getString(key);
  }

  // 存储对象（自动序列化为 JSON）
  static setObject<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  }

  // 获取对象（自动反序列化）
  static getObject<T>(key: string): T | undefined {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        console.error(`Failed to parse JSON for key ${key}:`, error);
        return undefined;
      }
    }
    return undefined;
  }

  // 存储数字
  static setNumber(key: string, value: number): void {
    storage.set(key, value);
  }

  // 获取数字
  static getNumber(key: string): number | undefined {
    return storage.getNumber(key);
  }

  // 存储布尔值
  static setBoolean(key: string, value: boolean): void {
    storage.set(key, value);
  }

  // 获取布尔值
  static getBoolean(key: string): boolean | undefined {
    return storage.getBoolean(key);
  }

  // 删除键
  static delete(key: string): void {
    storage.delete(key);
  }

  // 检查键是否存在
  static contains(key: string): boolean {
    return storage.contains(key);
  }

  // 获取所有键
  static getAllKeys(): string[] {
    return storage.getAllKeys();
  }

  // 清空所有数据
  static clearAll(): void {
    storage.clearAll();
  }
}

// 存储键常量
export const STORAGE_KEYS = {
  PROFILES: 'profiles',
  USER_SETTINGS: 'user_settings',
} as const;
