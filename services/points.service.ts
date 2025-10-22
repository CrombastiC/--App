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
 * 获取商品列表响应接口
 */
export interface CommodityListResponse {
  code: number;
  data: Commodity[];
}

/**
 * 积分商城服务
 */
export const pointsService = {
  /**
   * 获取商品列表
   */
  getCommodityList: () => {
    return request.get<CommodityListResponse>('/api/store/getCommodityList');
  },
};
