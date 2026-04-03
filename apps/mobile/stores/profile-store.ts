import { STORAGE_KEYS, StorageUtils } from '@/utils/storage';
import { create } from 'zustand';

export type ProfileRecord = {
  id: string;
  name: string;
  age: string;
  role: string;
  gender: 'male' | 'female' | 'other';
  notes?: string;
  avatarUri?: string;
  createdAt: number;
};

type ProfileState = {
  profiles: ProfileRecord[];
  addProfile: (profile: Omit<ProfileRecord, 'id' | 'createdAt'>) => void;
  reset: () => void;
  // 添加持久化相关方法
  loadProfiles: () => Promise<void>;
  saveProfiles: (profiles: ProfileRecord[]) => Promise<void>;
};

// 从存储中加载数据的函数
const loadProfilesFromStorage = async (): Promise<ProfileRecord[]> => {
  const savedProfiles = await StorageUtils.getObject<ProfileRecord[]>(STORAGE_KEYS.PROFILES);
  return savedProfiles || [];
};

// 保存数据到存储的函数
const saveProfilesToStorage = async (profiles: ProfileRecord[]): Promise<void> => {
  await StorageUtils.setObject(STORAGE_KEYS.PROFILES, profiles);
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  
  // 初始化时加载数据
  loadProfiles: async () => {
    const savedProfiles = await loadProfilesFromStorage();
    set({ profiles: savedProfiles });
  },
  
  // 保存数据到存储
  saveProfiles: async (profiles) => {
    await saveProfilesToStorage(profiles);
  },
  
  addProfile: (profile) => {
    const newProfile: ProfileRecord = {
      ...profile,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    
    set((state) => {
      const updatedProfiles = [...state.profiles, newProfile];
      // 自动保存到存储
      saveProfilesToStorage(updatedProfiles);
      return { profiles: updatedProfiles };
    });
  },
  
  reset: () => {
    set({ profiles: [] });
    // 清空存储中的数据
    StorageUtils.delete(STORAGE_KEYS.PROFILES);
  },
}));
