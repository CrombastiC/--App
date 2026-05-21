/**
 * 优惠券
 */
export interface Coupon {
  couponId: string;
  couponName: string;
  couponAmount: number;
  consumeMoney: number;
  couponUseTime: string;
  status: 'unused' | 'used';
}

/**
 * 获取优惠券列表请求
 */
export interface GetCouponListRequest {
  isExpired?: boolean;
}
