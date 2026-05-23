import { create } from 'zustand';

export interface CartItem {
  foodId: string;
  foodName: string;
  foodPrice: number;
  quantity: number;
  foodImage?: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'dine-in' | 'takeout';
  peopleCount: number;
  storeName: string;
  remark: string;
  couponDiscount: number;

  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeItem: (foodId: string) => void;
  clearCart: () => void;
  setOrderType: (type: 'dine-in' | 'takeout') => void;
  setPeopleCount: (count: number) => void;
  setStoreName: (name: string) => void;
  setRemark: (remark: string) => void;
  setCouponDiscount: (discount: number) => void;

  getTotalCount: () => number;
  getTotalPrice: () => number;
  getPayAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine-in',
  peopleCount: 1,
  storeName: '',
  remark: '',
  couponDiscount: 0,

  setItems: (items) => set({ items }),

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.foodId === item.foodId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.foodId === item.foodId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    });
  },

  updateQuantity: (foodId, quantity) => {
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.foodId !== foodId)
          : state.items.map((i) =>
              i.foodId === foodId ? { ...i, quantity } : i
            ),
    }));
  },

  removeItem: (foodId) => {
    set((state) => ({
      items: state.items.filter((i) => i.foodId !== foodId),
    }));
  },

  clearCart: () => set({ items: [], remark: '', couponDiscount: 0 }),

  setOrderType: (orderType) => set({ orderType }),
  setPeopleCount: (peopleCount) => set({ peopleCount }),
  setStoreName: (storeName) => set({ storeName }),
  setRemark: (remark) => set({ remark }),
  setCouponDiscount: (couponDiscount) => set({ couponDiscount }),

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + item.foodPrice * item.quantity,
      0
    );
  },

  getPayAmount: () => {
    const total = get().getTotalPrice();
    return Math.max(0, total - get().couponDiscount);
  },
}));
