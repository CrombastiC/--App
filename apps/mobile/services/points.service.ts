import request from '@/request';
import type {
  Commodity,
  LuckyRollData,
  LuckyRollDataResponse,
  PaginatedResponse,
  PointRecord,
  WinningInfo,
} from '@orderfood/common';

export type {
  Commodity,
  LuckyRollData,
  LuckyRollDataResponse,
  PointRecord,
  WinningInfo,
} from '@orderfood/common';

/**
 * 获取商品列表响应接口
 */
// axios 拦截器解包后，result 直接就是 Commodity[]
export type CommodityListResponse = Commodity[];

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
    return request.get<PaginatedResponse<PointRecord>>('/api/points/getPointsList', params);
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
    return request.post<LuckyRollData>('/api/points/exchangePrize', { prizeId, costIntegral: integral });
  },

  /**
   * 兑换奖品(十连抽)
   */
  exchangeMultiPrize: (prizeIds: string[], integral: number) => {
    return request.post<LuckyRollData[]>('/api/points/exchangeMultiPrize', { prizeIds, costIntegral: integral });
  },

  /**
   * 获取中奖记录
   * @param isBigPrize 是否为大奖 true表示围观大奖，false表示中奖播报
   */
  getWinningRecords: (isBigPrize: boolean) => {
    return request.get<WinningInfo[]>('/api/points/getWinningRecords', { isBigPrize });
  }
};
