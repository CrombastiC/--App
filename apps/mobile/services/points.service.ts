import request from '@/request';

/**
 * 商品信息接口
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
  isGet: boolean;
  remark: string;
  createdAt: string;
}

/**
 * 获取商品列表响应接口
 */
// axios 拦截器解包后，result 直接就是 Commodity[]
export type CommodityListResponse = Commodity[];

/**
 * 获取抽奖数据接口
 */
export interface LuckyRollData {
  id: string;
  prizeName: string;
  prizeImage: string;
  prizeIntegral: number; // 奖品积分值，0表示大奖，非0表示积分奖励
}

/**
 * 获取抽奖数据响应接口
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
  userAvatar: string;// 用户头像
  username: string;// 用户名
  prizeName: string;// 奖品名称
  prizeImage: string;// 奖品图片
  createdAt: string;// 中奖时间
}
/**
 * 获取围观大奖数据响应接口
 */
export interface BigPrizeDataResponse {
  code: number;
  data: WinningInfo[];
}

// axios 拦截器解包后实际类型
export type WinningRecordsResult = WinningInfo[];

/**
 * 积分商城服务
 */
export const pointsService = {
  /**
   * 获取商品列表
   */
  getCommodityList: () => {
    return request.get<CommodityListResponse>('/api/points/getCommodityList');
  },

  /**
   * 获取积分列表
   */
  getPointsList: (params: { page: number; limit: number }) => {
    return request.get<PointRecord[]>('/api/points/getPointsList', params);
  },

  /**
   * 获取抽奖数据
   */
  getLuckyRollData: () => {
    return request.get<LuckyRollDataResponse>('/api/points/getLuckyRollData');
  },

  /**
   * 兑换奖品(单抽)
   */
  exchangePrize: (prizeId: string, integral: number) => {
    return request.post<any>('/api/points/exchangePrize', { prizeId, costIntegral: integral });
  },

  /**
   * 兑换奖品(十连抽)
   */
  exchangeMultiPrize: (prizeIds: string[], integral: number) => {
    return request.post<any>('/api/points/exchangeMultiPrize', { prizeIds, costIntegral: integral });
  },

  /**
   * 获取中奖记录
   * @param isBigPrize 是否为大奖 true表示围观大奖，false表示中奖播报
   */
  getWinningRecords: (isBigPrize: boolean) => {
    return request.get<BigPrizeDataResponse>(`/api/points/getWinningRecords?isBigPrize=${isBigPrize}`);
  }
};
