import request from '@/request';

/**
 * 支付相关接口类型
 */

/** 创建支付请求参数 */
export interface CreatePayRequest {
  orderId: string;
  subject: string;
  body?: string;
  totalAmount: number;
  payType?: 'app' | 'page';
}

/** 创建支付响应（网页支付） */
export interface PayPageResult {
  payUrl: string;
  outTradeNo: string;
  timeExpire: number;
}

/** 创建支付响应（App 支付） */
export interface PayAppResult {
  payString: string;
  outTradeNo: string;
  timeExpire: number;
}

/** 支付状态 */
export interface PayStatus {
  outTradeNo: string;
  tradeNo: string | null;
  tradeStatus: string;
  amount: number;
  payTime: string | null;
}

/**
 * 支付服务
 */
export const payService = {
  /**
   * 创建支付订单
   * @param data 支付请求参数
   * @returns 支付URL（page模式）或签名串（app模式）
   */
  createPay: (data: CreatePayRequest) => {
    return request.post<PayPageResult | PayAppResult>('/api/pay/create', data);
  },

  /**
   * 查询订单支付状态
   * @param orderId 订单ID
   */
  queryPayStatus: (orderId: string) => {
    return request.get<PayStatus>(`/api/pay/status/${orderId}`);
  },
};
