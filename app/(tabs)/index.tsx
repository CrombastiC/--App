/**
 * 首页
 */

import { tokenManager, userService } from '@/services';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Card, Icon, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState('用户名');
  const [balance, setBalance] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadData = async () => {
    // 检查是否已登录
    const loggedIn = await tokenManager.isLoggedIn();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      // 调用获取用户信息接口
      const [error, userInfo] = await userService.getProfile();
      if (error) {
        console.error('Failed to load user info:', error);
        return;
      }
      const data = (userInfo as any)?.data;
      if (data) {
        const { username, avatar, balance, integral } = data;
        setUserName(username || '用户名');
        setAvatar(avatar || null);
        setBalance(balance || 0);
        setPoints(integral || 0);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 上半部分 - 带背景色的区域 */}
        <View style={styles.topSection}>
          <ImageBackground
            source={require('@/assets/images/cooker.png')}
            style={styles.imageBackground}
            resizeMode="contain"
          />
        </View>

        {/* 下半部分 - 纯白色背景 */}
        <View style={styles.bottomSection}>
          {/* 圆角卡片 - 向上偏移 */}
          {isLoggedIn ? (
            <Card style={styles.card} mode="elevated" onPress={() => router.push('/(tabs)/profile')}>
              <Card.Content style={styles.cardContent}>
                {/* 头像 */}
                {avatar ? (
                   <Image source={{ uri:avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon source="account" size={24} color="#999" />
                  </View>
                )}
                
                {/* 用户信息 */}
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{userName}</Text>
                    <View style={styles.memberBadge}>
                      <Text style={styles.memberBadgeText}>普通会员</Text>
                    </View>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>余额</Text>
                    <Text style={styles.balanceValue}>¥{balance.toFixed(0)}</Text>
                    <Text style={styles.pointsLabel}>积分</Text>
                    <Text style={styles.pointsValue}>{points}</Text>
                  </View>
                </View>
                
                {/* 扫码按钮 */}
                <IconButton
                  icon="qrcode-scan"
                  size={24}
                  iconColor="#FF7214"
                  onPress={() => router.push('/(member)/memberCode')}
                />
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.card} mode="elevated" onPress={() => router.push('/auth/login')}>
              <Card.Content style={styles.loginCardContent}>
                <View style={styles.loginIconContainer}>
                  <Icon source="account-circle" size={48} color="#FF7214" />
                </View>
                <View style={styles.loginTextContainer}>
                  <Text style={styles.loginTitle}>授权登录</Text>
                  <Text style={styles.loginSubtitle}>点击登录享受更多服务</Text>
                </View>
                <Icon source="qrcode-scan" size={28} color="#FF7214" />
              </Card.Content>
            </Card>
          )}
          <View style={styles.eatTypeContainer}>
            <Card
              style={styles.eatTypeCard}
              mode="elevated"
              onPress={() => router.push('/(orderfood)/peopleSelect')}
            >
              <Card.Content style={styles.eatTypeContent}>
                <Icon source="food" size={35} color="#FF7214" />
                <Text style={styles.eatTypeText}>堂食</Text>
              </Card.Content>
            </Card>
            <Card
              style={styles.eatTypeCard}
              mode="elevated"
              onPress={() => router.push('/(location)/addressSelect?type=takeout')}
            >
              <Card.Content style={styles.eatTypeContent}>
                <Icon source="bike" size={35} color="#FF7214" />
                <Text style={styles.eatTypeText}>外卖</Text>
              </Card.Content>
            </Card>
          </View>
          {/* 取号，充值，商城 */}
          <View style={styles.serviceContainer}>
            <Card 
              style={[styles.serviceCard, styles.queueCard]} 
              mode="elevated"
              onPress={() => router.push('/(location)/addressSelect?type=queue')}
            >
              <Card.Content style={styles.serviceContent}>
                <Icon source="ticket" size={40} color="#FF7214" />
                <Text style={styles.serviceText}>排队取号</Text>
              </Card.Content>
            </Card>
            <Card style={[styles.serviceCard, styles.rechargeCard]} mode="elevated" onPress={() => router.push('/(member)/top-up')}>
              <Card.Content style={styles.serviceContent}>
                <Icon source="credit-card" size={40} color="#4ECDC4" />
                <Text style={styles.serviceText}>会员充值</Text>
              </Card.Content>
            </Card>
            <Card style={[styles.serviceCard, styles.mallCard]} mode="elevated" onPress={() => router.push('/pointsMall')}>
              <Card.Content style={styles.serviceContent}>
                <Icon source="store" size={40} color="#9B59B6" />
                <Text style={styles.serviceText}>积分商城</Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1.2,
    width: '100%',
    backgroundColor: 'rgb(246, 234, 227)', // 浅棕色背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: -20, // 负边距让卡片向上移动
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4, // Android 阴影
    shadowColor: '#000', // iOS 阴影
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginTop: -30, // 额外向上偏移
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 80, // 改为 minHeight 确保有足够空间
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden', // 防止头像超出圆形边界
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  memberBadge: {
    backgroundColor: '#FF7214',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 6,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7214',
    marginRight: 16,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 6,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  loginCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginIconContainer: {
    marginRight: 16,
  },
  loginTextContainer: {
    flex: 1,
  },
  loginTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  eatTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // 中间间距为12
  },
  eatTypeCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4, // Android 阴影
    shadowColor: '#000', // iOS 阴影
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginTop: 16,
    flex: 1, // 使用flex:1让两个卡片平分空间
    height: 100,
  },
  eatTypeContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  eatTypeText: {
    fontWeight: 'bold',
  },
  serviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12, // 中间间距为12
  },
  serviceCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4, // Android 阴影
    shadowColor: '#000', // iOS 阴影
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    flex: 1, // 使用flex:1让三个卡片平分空间
    height: 100,
  },
  serviceContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceText: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  queueCard: {
    backgroundColor: 'rgb(254, 241, 233)', // 浅橙色
  },
  rechargeCard: {
    backgroundColor: 'rgb(222, 245, 241)', // 浅青色
  },
  mallCard: {
    backgroundColor: 'rgb(235, 228, 255)', // 浅紫色
  },
});
