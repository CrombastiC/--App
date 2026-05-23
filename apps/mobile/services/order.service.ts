import request from '@/request';

/**
 * 订单项
 */
export interface OrderItem {
  foodId: string;
  foodName: string;
  foodPrice: number;
  quantity: number;
  subtotal: number;
}

/**
 * 创建订单请求
 */
export interface CreateOrderRequest {
  orderType: string;      // dine-in: 堂食, takeout: 外卖
  totalAmount: number;
  payAmount: number;
  address?: string;
  peopleCount?: number;
  remark?: string;
  items: OrderItem[];
}

/**
 * 订单响应
 */
export interface Order {
  id: string;
  orderType: string;
  status: string;         // pending, paid, completed, cancelled
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
 * 获取商品信息
 * @param id 商品ID 不传就是获取全部商品
 */
export const getProductInfo = (id?: string) => {
  return request.get(`/api/menu/getMenuList/${id || ''}`);
};
/**
 * 创建菜品（测试用）
 */
export const createDish = (data: any) => {
  return request.post('/api/menu/createFood', data);
};

/**
 * 上传图片
 */
export const uploadImage = (data: any) => {
  return request.post('/api/upload/uploadImg', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 订单服务
 */
export const orderService = {
  /**
   * 创建订单
   */
  createOrder: (data: CreateOrderRequest) => {
    return request.post<Order>('/api/order/create', data);
  },

  /**
   * 获取订单列表
   * @param status 可选状态筛选
   */
  getOrders: (status?: string) => {
    return request.get<Order[]>('/api/order/list', status ? { status } : undefined);
  },

  /**
   * 获取订单详情
   * @param id 订单ID
   */
  getOrderDetail: (id: string) => {
    return request.get<Order>(`/api/order/detail/${id}`);
  },
};
