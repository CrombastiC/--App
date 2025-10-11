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
  loadProfiles: () => void;
  saveProfiles: (profiles: ProfileRecord[]) => void;
};

// 从存储中加载数据的函数
const loadProfilesFromStorage = (): ProfileRecord[] => {
  const savedProfiles = StorageUtils.getObject<ProfileRecord[]>(STORAGE_KEYS.PROFILES);
  return savedProfiles || [];
};

// 保存数据到存储的函数
const saveProfilesToStorage = (profiles: ProfileRecord[]): void => {
  StorageUtils.setObject(STORAGE_KEYS.PROFILES, profiles);
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  
  // 初始化时加载数据
  loadProfiles: () => {
    const savedProfiles = loadProfilesFromStorage();
    set({ profiles: savedProfiles });
  },
  
  // 保存数据到存储
  saveProfiles: (profiles) => {
    saveProfilesToStorage(profiles);
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
