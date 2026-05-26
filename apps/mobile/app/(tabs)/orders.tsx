/**
 * 订单页面
 */

import { orderService, Order } from '@/services/order.service';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Appbar, Text, Card, Chip, Divider, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_TABS = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9800',
  paid: '#4CAF50',
  completed: '#2196F3',
  cancelled: '#9E9E9E',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  completed: '已完成',
  cancelled: '已取消',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const loadOrders = useCallback(async (status?: string) => {
    const [error, data] = await orderService.getOrders(status || undefined);
    if (!error && data) {
      setOrders(data as Order[]);
    }
  }, []);

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(activeTab);
    setRefreshing(false);
  };

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    setLoading(true);
  };

  useEffect(() => {
    if (orders.length >= 0) {
      setLoading(false);
    }
  }, [orders]);

  const handleOrderPress = (order: Order) => {
    if (order.status === 'pending') {
      // 跳转到支付页面
      router.push({
        pathname: '/(member)/pay' as any,
        params: {
          orderId: order.id,
          totalAmount: order.payAmount.toString(),
          subject: `订单 #${order.id.slice(-4)}`,
        },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => handleOrderPress(item)}
      activeOpacity={item.status === 'pending' ? 0.7 : 1}
    >
      <Card style={[styles.orderCard, item.status === 'pending' && styles.pendingCard]}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <Text variant="bodySmall" style={styles.orderId}>
              订单号: #{item.id.slice(-6)}
            </Text>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}
              textStyle={{ color: STATUS_COLORS[item.status], fontSize: 12 }}
            >
              {STATUS_LABELS[item.status] || item.status}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.orderInfo}>
            <View style={styles.orderTypeRow}>
              <Text variant="bodyMedium" style={styles.orderType}>
                {item.orderType === 'dine-in' ? '堂食' : '外卖'}
              </Text>
              {item.peopleCount && (
                <Text variant="bodySmall" style={styles.peopleCount}>
                  {item.peopleCount}人
                </Text>
              )}
            </View>
            <Text variant="bodySmall" style={styles.orderTime}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          <View style={styles.itemsPreview}>
            {item.orderItems.slice(0, 2).map((orderItem, index) => (
              <Text key={index} variant="bodySmall" style={styles.itemName} numberOfLines={1}>
                {orderItem.foodName} x{orderItem.quantity}
              </Text>
            ))}
            {item.orderItems.length > 2 && (
              <Text variant="bodySmall" style={styles.moreItems}>
                等{item.orderItems.length}件商品
              </Text>
            )}
          </View>

          <View style={styles.orderFooter}>
            <Text variant="titleMedium" style={styles.amount}>
              ¥{item.payAmount.toFixed(2)}
            </Text>
            {item.status === 'pending' && (
              <Button
                mode="contained"
                compact
                style={styles.payButton}
                labelStyle={styles.payButtonLabel}
                onPress={() => handleOrderPress(item)}
              >
                去支付
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header mode="small">
        <Appbar.Content title="订单" />
      </Appbar.Header>

      {/* 状态筛选标签 */}
      <View style={styles.tabContainer}>
        <FlatList
          data={STATUS_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === item.key && styles.tabItemActive]}
              onPress={() => handleTabPress(item.key)}
            >
              <Text style={[styles.tabText, activeTab === item.key && styles.tabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 订单列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7214" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            暂无订单
          </Text>
          <Button
            mode="contained"
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/order' as any)}
          >
            去点餐
          </Button>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.orderList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FF7214']} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EAE3',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabList: {
    paddingHorizontal: 12,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF7214',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#FF7214',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#999',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#FF7214',
    borderRadius: 20,
  },
  orderList: {
    padding: 12,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  pendingCard: {
    borderWidth: 1,
    borderColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    color: '#999',
    fontSize: 12,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderType: {
    fontWeight: '500',
    color: '#333',
  },
  peopleCount: {
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderTime: {
    color: '#999',
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemName: {
    color: '#666',
    marginBottom: 4,
  },
  moreItems: {
    color: '#999',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontWeight: '600',
    color: '#FF7214',
  },
  payButton: {
    backgroundColor: '#FF7214',
    borderRadius: 16,
  },
  payButtonLabel: {
    fontSize: 13,
    marginVertical: 2,
    marginHorizontal: 8,
  },
});
