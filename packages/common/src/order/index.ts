/**
 * 订单类型
 */
export type OrderType = 'dine-in' | 'takeout';

/**
 * 订单状态
 */
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled';

/**
 * 订单明细项
 */
export interface OrderItem {
  foodId: string;
  foodName: string;
  foodPrice: number;
  quantity: number;
  subtotal: number;
}

/**
 * 订单
 */
export interface Order {
  id: string;
  userId: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  payAmount: number;
  address?: string;
  peopleCount?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

/**
 * 创建订单请求
 */
export interface CreateOrderRequest {
  orderType: OrderType;
  totalAmount: number;
  payAmount: number;
  address?: string;
  peopleCount?: number;
  remark?: string;
  items: OrderItem[];
}
