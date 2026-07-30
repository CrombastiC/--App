/**
 * 菜品
 */
export interface Food {
  id: string;
  classifyId: string;
  foodName: string;
  foodImage?: string | null;
  foodPrice: number;
}

/**
 * 菜品分类
 */
export interface Category {
  classifyId: string;
  classifyName: string;
  icon?: string | null;
  foods: Food[];
}

/**
 * 创建菜品请求
 */
export interface CreateFoodRequest {
  classifyId: string;
  foodName: string;
  foodPrice: number;
  foodImage?: string;
}
