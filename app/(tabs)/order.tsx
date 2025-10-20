/**
 * 点餐页面
 */

import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 分类数据类型
interface Category {
  id: string;
  name: string;
  icon: string;
}

// 商品数据类型
interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  categoryId: string;
  quantity: number;
}

// 模拟分类数据
const categories: Category[] = [
  { id: '1', name: '人气', icon: 'fire' },
  { id: '2', name: '轻食系列', icon: 'food-apple' },
  { id: '3', name: '午排系列', icon: 'food-steak' },
  { id: '4', name: '三明治', icon: 'hamburger' },
  { id: '5', name: '水果沙拉', icon: 'fruit-cherries' },
  { id: '6', name: '饮品', icon: 'cup' },
];

// 模拟商品数据
const products: Product[] = [
  { id: '1', name: '热烤鸡胸蔬菜沙拉', price: 42.0, rating: 5.4, image: '', categoryId: '1', quantity: 0 },
  { id: '2', name: '热烤鸡胸蔬菜沙拉', price: 42.0, rating: 5.4, image: '', categoryId: '1', quantity: 0 },
  { id: '3', name: '热烤鸡胸蔬菜沙拉', price: 42.0, rating: 5.4, image: '', categoryId: '1', quantity: 0 },
  { id: '4', name: '热烤鸡胸蔬菜沙拉', price: 42.0, rating: 5.4, image: '', categoryId: '1', quantity: 0 },
  { id: '5', name: '热烤鸡胸蔬菜沙拉', price: 42.0, rating: 5.4, image: '', categoryId: '1', quantity: 0 },
];

export default function OrderScreen() {
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [cart, setCart] = useState<Product[]>(products);
  const storeName = '中海大厦店';
  const distance = '1.2km';

  // 根据订餐类型获取标题
  const title = orderType === 'dine-in' ? '堂食点餐' : '外送点餐';

  // 计算购物车总数量和总价
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 增加商品数量
  const increaseQuantity = (productId: string) => {
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // 减少商品数量
  const decreaseQuantity = (productId: string) => {
    setCart(cart.map(item => 
      item.id === productId && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

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
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon
                  source={category.icon}
                  size={20}
                  color={selectedCategory === category.id ? '#FF7214' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 右侧：商品列表 */}
        <View style={styles.productContainer}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                {/* 商品图片 */}
                <View style={styles.productImage}>
                  <Icon source="food" size={60} color="#ddd" />
                </View>

                {/* 商品信息 */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={styles.ratingRow}>
                    <Icon source="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>{item.rating}分</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>¥{item.price.toFixed(1)}</Text>
                    <Text style={styles.oldPrice}>(¥)</Text>
                  </View>
                </View>

                {/* 数量控制 */}
                <View style={styles.quantityControl}>
                  {item.quantity > 0 ? (
                    <>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => decreaseQuantity(item.id)}
                      >
                        <Icon source="minus-circle" size={24} color="#FF7214" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    </>
                  ) : null}
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseQuantity(item.id)}
                  >
                    <Icon source="plus-circle" size={24} color="#FF7214" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
            <Text style={styles.totalPrice}>¥{cartPrice.toFixed(0)}</Text>
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFB800',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7214',
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
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
