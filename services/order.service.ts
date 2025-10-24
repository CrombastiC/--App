import request from '@/request';

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
