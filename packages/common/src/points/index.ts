/**
 * 积分商城商品
 */
export interface Commodity {
  commodityId: number;
  commodityName: string;
  commodityImage: string;
  commodityIntegral: number;
  commodityDescription?: string;
}

/**
 * 积分记录
 */
export interface PointRecord {
  integral: number;
  isGet: boolean; // true: 收入, false: 支出
  remark: string;
  createdAt: string;
}

/**
 * 抽奖奖品
 */
export interface LuckyRollData {
  id: string;
  prizeName: string;
  prizeImage: string;
  prizeIntegral: number;
}

/**
 * 抽奖数据响应
 */
export interface LuckyRollDataResponse {
  luckyDrawCount: number;
  userIntegral: number;
  prizeList: LuckyRollData[];
}

/**
 * 中奖信息
 */
export interface WinningInfo {
  id: string;
  userAvatar: string;
  username: string;
  prizeName: string;
  prizeImage: string;
  createdAt: string;
}

/**
 * 兑换奖品请求（单抽）
 */
export interface ExchangePrizeRequest {
  prizeId: string;
  costIntegral: number;
}

/**
 * 兑换奖品请求（十连抽）
 */
export interface ExchangeMultiPrizeRequest {
  prizeIds: string[];
  costIntegral: number;
}

/**
 * 获取积分列表请求
 */
export interface GetPointsListRequest {
  page: number;
  limit: number;
}
