/**
 * 点餐页面
 */

import { getProductInfo } from '@/services/order.service';
import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View, ViewToken } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 分类数据类型
interface Category {
  classifyId: string; // 分类ID
  classifyName: string; // 分类名称
  icon: string; // 分类图标
}

// 商品数据类型
interface Product {
  _id: string; // 商品ID
  classifyId: string; // 分类ID
  foodName: string; // 商品名称
  foodImage: string; // 商品图片
  foodPrice: number; // 商品价格
  quantity: number; // 商品数量
}

// API返回的分类数据
interface CategoryData {
  classifyId: string; // 分类ID
  classifyName: string; // 分类名称 
  foods: {
    _id: string; // 商品ID
    classifyId: string; // 分类ID
    foodName: string; // 商品名称
    foodImage: string; // 商品图片
    foodPrice: number; // 商品价格
  }[];
}

// // 渲染用的商品项（带分类标题）
interface ProductItem extends Product {
  isTitle?: boolean;
}

// 图标映射
const categoryIcons: { [key: string]: string } = {
  '人气': 'fire',
  '轻食系列': 'food-apple',
  '牛排系列': 'food-steak',
  '三明治': 'hamburger',
  '水果沙拉': 'fruit-cherries',
  '饮品': 'cup',
};

export default function OrderScreen() {
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [selectedCategory, setSelectedCategory] = useState('');//选择的分类ID
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeName = '中海大厦店';
  const distance = '1.2km';
  const flatListRef = useRef<FlatList>(null);
  const isScrollingRef = useRef(false);

  // 根据订餐类型获取标题
  const title = orderType === 'dine-in' ? '堂食点餐' : '外送点餐';

  // 加载商品数据
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [isError, data] = await getProductInfo();

      if (!isError && data) {
        const responseData = data as any;

        if (responseData.code === 0 && responseData.data) {
          const categoryData: CategoryData[] = responseData.data;

          // 处理分类数据
          const categoryList: Category[] = categoryData.map(cat => ({
            classifyId: cat.classifyId,
            classifyName: cat.classifyName,
            icon: categoryIcons[cat.classifyName] || 'food',
          }));
          setCategories(categoryList);

          // 处理商品数据并添加quantity字段
          const productList: ProductItem[] = [];
          categoryData.forEach(cat => {
            cat.foods.forEach(food => {
              productList.push({
                ...food,
                quantity: 0,
              });
            });
          });
          setProducts(productList);

          // 设置默认选中第一个分类
          if (categoryList.length > 0) {
            setSelectedCategory(categoryList[0].classifyId);
          }
        } else {
          setError('数据格式错误');
        }
      } else {
        setError('加载商品信息失败');
      }
    } catch (err) {
      setError('加载商品信息失败');
      console.error('加载商品信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 计算购物车总数量和总价
  const cartTotal = products.reduce((sum, item) => sum + item.quantity, 0);
  const cartPrice = products.reduce((sum, item) => sum + item.foodPrice * item.quantity, 0);

  // 增加商品数量
  const increaseQuantity = (productId: string) => {
    setProducts(products.map(item =>
      item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // 减少商品数量
  const decreaseQuantity = (productId: string) => {
    setProducts(products.map(item =>
      item._id === productId && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  // 点击分类滚动到对应商品
  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    isScrollingRef.current = true;

    // 找到该分类的第一个商品的索引
    const index = products.findIndex(p => p.classifyId === categoryId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });

      // 延迟重置滚动标志
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  // 监听可见项变化
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (isScrollingRef.current || viewableItems.length === 0) return;

    // 获取第一个可见项的分类ID
    const firstVisibleItem = viewableItems[0]?.item as ProductItem;
    if (firstVisibleItem && firstVisibleItem.classifyId && !firstVisibleItem.isTitle) {
      setSelectedCategory(firstVisibleItem.classifyId);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen options={{ title }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7214" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen options={{ title }} />
        <View style={styles.errorContainer}>
          <Icon source="alert-circle" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title }} />

      {/* 头部 */}
      <View style={styles.header}>
        {/* 左侧：门店信息 */}
        <TouchableOpacity style={styles.storeInfo}>
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName}>{storeName}</Text>
            <Icon source="chevron-down" size={20} color="#333" />
          </View>
          <View style={styles.storeDetailRow}>
            <Text style={styles.storeDetail}>
              {orderType === 'dine-in' ? '堂食' : '外卖'} {distance}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 右侧：堂食/外卖切换 */}
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              orderType === 'dine-in' && styles.typeButtonActive,
            ]}
            onPress={() => setOrderType('dine-in')}
          >
            <Text
              style={[
                styles.typeButtonText,
                orderType === 'dine-in' && styles.typeButtonTextActive,
              ]}
            >
              堂食
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              orderType === 'takeout' && styles.typeButtonActive,
            ]}
            onPress={() => setOrderType('takeout')}
          >
            <Text
              style={[
                styles.typeButtonText,
                orderType === 'takeout' && styles.typeButtonTextActive,
              ]}
            >
              外卖
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 主内容区域：左右布局 */}
      <View style={styles.contentContainer}>
        {/* 左侧：分类菜单 */}
        <View style={styles.categoryContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.classifyId}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.classifyId && styles.categoryItemActive,
                ]}
                onPress={() => handleCategoryPress(category.classifyId)}
              >
                <Icon
                  source={category.icon}
                  size={20}
                  color={selectedCategory === category.classifyId ? '#FF7214' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.classifyId && styles.categoryTextActive,
                  ]}
                >
                  {category.classifyName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 右侧：商品列表 */}
        <View style={styles.productContainer}>
          <FlatList
            ref={flatListRef}
            data={products}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
            renderItem={({ item }) => {
              if (item.isTitle) {
                return <Text style={styles.categoryTitle}>{item.foodName}</Text>;
              }
              
              return (
                <View style={styles.productCard}>
                  {/* 商品图片 */}
                  <View style={styles.productImage}>
                    {item.foodImage ? (
                      <Image
                        source={{ uri: item.foodImage }}
                        style={styles.foodImageStyle}
                        resizeMode="cover"
                      />
                    ) : (
                      <Icon source="food" size={60} color="#ddd" />
                    )}
                  </View>

                  {/* 商品信息 */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.foodName}</Text>
                    <View style={styles.productBottom}>
                      <Text style={styles.price}>¥{item.foodPrice.toFixed(2)}</Text>

                      {/* 数量控制 */}
                      <View style={styles.quantityControl}>
                        {item.quantity > 0 ? (
                          <>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => decreaseQuantity(item._id)}
                            >
                              <Icon source="minus-circle" size={24} color="#FF7214" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                          </>
                        ) : null}
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => increaseQuantity(item._id)}
                        >
                          <Icon source="plus-circle" size={24} color="#FF7214" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}

          />
        </View>
      </View>

      {/* 底部固定按钮 */}
      <View style={styles.bottomBar}>
        <View style={styles.cartInfo}>
          <View style={styles.cartIconContainer}>
            <Icon source="cart" size={24} color="#fff" />
            {cartTotal > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartTotal}</Text>
              </View>
            )}
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.totalPrice}>¥{cartPrice.toFixed(2)}</Text>
            <Text style={styles.deliveryInfo}>配送费¥3</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>去下单</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF7214',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeInfo: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  storeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeDetail: {
    fontSize: 12,
    color: '#999',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FF7214',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FF7214',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // 左侧分类菜单
  categoryContainer: {
    width: 80,
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
  },
  categoryItemActive: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#FF7214',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#FF7214',
    fontWeight: '600',
  },
  // 右侧商品列表
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  productContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  foodImageStyle: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7214',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  // 底部购物车
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2c2c2c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartIconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF7214',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceInfo: {
    flexDirection: 'column',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  deliveryInfo: {
    fontSize: 12,
    color: '#999',
  },
  checkoutButton: {
    backgroundColor: '#FF7214',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
