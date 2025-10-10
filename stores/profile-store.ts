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
};

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  addProfile: (profile) =>
    set((state) => ({
      profiles: [
        ...state.profiles,
        {
          ...profile,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: Date.now(),
        },
      ],
    })),
  reset: () => set({ profiles: [] }),
}));
