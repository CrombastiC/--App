import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { create } from 'zustand';

import { STORAGE_KEYS, StorageUtils } from '@/utils/storage';

// 缓存有效期：24 小时
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// 高德逆地理编码 API（Web 服务，免费）
// Key 来源：app.config.js extra.AMAP_KEY
//   - 开发/测试环境：app.config.js 内默认值
//   - 生产环境：通过 EAS Secrets 注入 AMAP_KEY 环境变量
const AMAP_KEY = Constants.expoConfig?.extra?.AMAP_KEY as string || '';
const AMAP_GEOCODE_URL = 'https://restapi.amap.com/v3/geocode/regeo';

interface LocationCache {
  city: string;
  timestamp: number;
}

type LocationState = {
  /** 当前城市名称 */
  city: string;
  /** 是否正在定位 */
  isLocating: boolean;
  /** 定位错误信息 */
  error: string | null;
  /** 是否已完成初始化（缓存或定位） */
  initialized: boolean;

  /** 从缓存加载城市 */
  loadFromCache: () => Promise<boolean>;
  /** 执行 GPS 定位 */
  locate: () => Promise<void>;
  /** 手动设置城市（用户选择） */
  setCity: (city: string) => void;
  /** 清除缓存并重新定位 */
  refresh: () => Promise<void>;
};

const loadCache = async (): Promise<LocationCache | null> => {
  // 先用 getString 读取原始值，兼容旧格式（纯字符串）和新格式（JSON 对象）
  const raw = await StorageUtils.getString(STORAGE_KEYS.SELECTED_CITY);
  if (!raw) return null;

  // 尝试解析为 JSON 对象（新格式）
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.city) {
      return { city: parsed.city, timestamp: parsed.timestamp || Date.now() };
    }
  } catch {
    // JSON.parse 失败 → 旧格式纯字符串，如 "郑州"
    const city = raw.trim();
    if (city) {
      return { city, timestamp: Date.now() };
    }
  }

  return null;
};

const saveCache = async (city: string): Promise<void> => {
  await StorageUtils.setObject<LocationCache>(STORAGE_KEYS.SELECTED_CITY, {
    city,
    timestamp: Date.now(),
  });
};

const clearCache = async (): Promise<void> => {
  await StorageUtils.delete(STORAGE_KEYS.SELECTED_CITY);
};

const isCacheValid = (cache: LocationCache): boolean => {
  return Date.now() - cache.timestamp < CACHE_TTL_MS;
};

/**
 * 通过高德 API 将经纬度转换为城市名称
 * 解决 expo-location reverseGeocodeAsync 在国内无法返回城市的问题
 */
const reverseGeocodeWithAmap = async (
  latitude: number,
  longitude: number,
  timeoutMs = 10000
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${AMAP_GEOCODE_URL}?key=${AMAP_KEY}&location=${longitude},${latitude}&radius=1000&extensions=base`;
    const res = await fetch(url, { signal: controller.signal });
    const json = await res.json();

    if (json.status === '1' && json.regeocode) {
      const addr = json.regeocode.addressComponent;
      // 直辖市 city 为空数组，取 province；非直辖市 city 为字符串
      const city = Array.isArray(addr.city) ? '' : addr.city;
      return city || addr.province || '未知城市';
    }

    throw new Error(`高德逆地理编码失败: ${json.info || '未知错误'}`);
  } finally {
    clearTimeout(timer);
  }
};

export const useLocationStore = create<LocationState>((set, get) => ({
  city: '定位中...',
  isLocating: false,
  error: null,
  initialized: false,

  loadFromCache: async () => {
    const cache = await loadCache();
    if (cache && isCacheValid(cache)) {
      set({ city: cache.city, initialized: true });
      return true;
    }
    return false;
  },

  locate: async () => {
    if (!AMAP_KEY) {
      console.warn('AMAP_KEY 未配置，跳过定位');
      set({ city: '定位失败', isLocating: false, error: 'no_key', initialized: true });
      return;
    }

    set({ isLocating: true, error: null });

    try {
      // 1. 请求权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({
          city: '定位权限未授予',
          isLocating: false,
          error: 'permission_denied',
          initialized: true,
        });
        return;
      }

      // 2. 获取 GPS 坐标（10s 超时）
      const location = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ]);

      const { latitude, longitude } = location.coords;

      // 3. 用高德 API 逆地理编码获取城市（替代 expo-location 的 reverseGeocodeAsync）
      let cityName: string;
      try {
        cityName = await reverseGeocodeWithAmap(latitude, longitude);
      } catch (geocodeErr) {
        // 高德 API 失败时降级：直接用坐标展示
        console.warn('高德逆地理编码失败，使用坐标降级:', geocodeErr);
        cityName = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      }

      await saveCache(cityName);
      set({ city: cityName, isLocating: false, error: null, initialized: true });
    } catch (err) {
      const message = err instanceof Error ? err : null;
      const errorMsg = message?.message === 'timeout' ? '定位超时' : '定位失败';
      set({ city: errorMsg, isLocating: false, error: errorMsg, initialized: true });
    }
  },

  setCity: (city: string) => {
    saveCache(city);
    set({ city, error: null });
  },

  refresh: async () => {
    await clearCache();
    await get().locate();
  },
}));
