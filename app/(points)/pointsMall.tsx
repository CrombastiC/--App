import { useRequest } from '@/hooks/use-request';
import { Commodity, pointsService } from '@/services/points.service';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PointsMallScreen() {
  const { data, loading, error, refresh } = useRequest(
    pointsService.getCommodityList
  );

  // 渲染商品卡片
  const renderCommodityCard = ({ item }: { item: Commodity }) => {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <Image
          source={{ uri: item.commodityImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.commodityName} numberOfLines={2}>
            {item.commodityName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceNumber}>{item.commodityIntegral}</Text>
            <Text style={styles.priceUnit}> 积分</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染空状态
  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无商品</Text>
      </View>
    );
  };

  // 渲染加载状态
  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  // 渲染错误状态
  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>加载失败，请重试</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 补齐数据，保证每行都有2个元素
  const getFilledData = (list: Commodity[] = []) => {
    const filled = [...list];
    if (filled.length % 2 !== 0) {
      filled.push({
        commodityId: `empty_${filled.length}` as any,
        commodityName: '',
        commodityImage: '',
        commodityIntegral: 0,
      });
    }
    return filled;
  };

  // 渲染卡片，空卡片不显示内容
  const renderCard = ({ item }: { item: Commodity }) => {
    if (!item.commodityName && !item.commodityImage) {
      return <View style={[styles.card, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />;
    }
    return renderCommodityCard({ item });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={getFilledData(data?.data)}
        renderItem={renderCard}
        // keyExtractor={(item) => item.commodityId.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
  },
  cardContent: {
    padding: 12,
  },
  commodityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    // 文本省略由 Text 组件的 numberOfLines 属性控制,不需要这些样式
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  priceUnit: {
    fontSize: 12,
    color: '#FF6B35',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
