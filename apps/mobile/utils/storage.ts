import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储工具类
export class StorageUtils {
  // 存储字符串
  static async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set string for key ${key}:`, error);
    }
  }

  // 获取字符串
  static async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get string for key ${key}:`, error);
      return null;
    }
  }

  // 存储对象（自动序列化为 JSON）
  static async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set object for key ${key}:`, error);
    }
  }

  // 获取对象（自动反序列化）
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get object for key ${key}:`, error);
      return null;
    }
  }

  // 存储数字
  static async setNumber(key: string, value: number): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to set number for key ${key}:`, error);
    }
  }

  // 获取数字
  static async getNumber(key: string): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? Number(value) : null;
    } catch (error) {
      console.error(`Failed to get number for key ${key}:`, error);
      return null;
    }
  }

  // 存储布尔值
  static async setBoolean(key: string, value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to set boolean for key ${key}:`, error);
    }
  }

  // 获取布尔值
  static async getBoolean(key: string): Promise<boolean | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? value === 'true' : null;
    } catch (error) {
      console.error(`Failed to get boolean for key ${key}:`, error);
      return null;
    }
  }

  // 删除键
  static async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
    }
  }

  // 检查键是否存在
  static async contains(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check key ${key}:`, error);
      return false;
    }
  }

  // 获取所有键
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  // 清空所有数据
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }
}

// 存储键常量
export const STORAGE_KEYS = {
  PROFILES: 'profiles',
  USER_SETTINGS: 'user_settings',
  SELECTED_CITY: 'selected_city',
} as const;
