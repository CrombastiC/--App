/**
 * 我的页面
 */

import MenuList, { MenuListItem } from '@/components/ui/MenuList';
import { userService } from '@/services';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  avatar?: string;
  balance?: number;
  integral?: number;
  couponCount?: number;
}

// 功能菜单配置
const menuItems: MenuListItem[] = [
  {
    key: 'member-benefits',
    icon: 'map-marker',
    label: '会员权益',
  },
  {
    key: 'task-center-1',
    icon: 'checkbox-marked-circle-outline',
    label: '任务中心',
  },
  {
    key: 'create-order',
    icon: 'checkbox-marked-circle-outline',
    label: '创建订单',
    onPress: () => router.push('/user/createOrder'),
  },
  {
    key: 'task-center-2',
    icon: 'checkbox-marked-circle-outline',
    label: '任务中心',
  },
  {
    key: 'task-center-3',
    icon: 'checkbox-marked-circle-outline',
    label: '任务中心',
  },
  {
    key: 'task-center-4',
    icon: 'checkbox-marked-circle-outline',
    label: '任务中心',
  },
  {
    key: 'task-center-5',
    icon: 'checkbox-marked-circle-outline',
    label: '任务中心',
  },
];

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [phone, setPhone] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  // 页面获得焦点时重新加载用户信息（从充值成功页返回时触发）
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [])
  );

  const loadUserInfo = async () => {
    try {
      // 从API获取用户信息
      const [error, result] = await userService.getProfile();
      if (error) {
        console.error('Failed to load user info:', error);
        return;
      }

      // result 是包含 code 和 data 的对象，真正的用户数据在 result.data 中
      const data = (result as any)?.data;
      if (data) {
        const user = data as UserInfo;
        setUserInfo(user);

        // 格式化手机号，隐藏中间4位
        if (data.phone) {
          const formattedPhone = data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
          setPhone(formattedPhone);
        }
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const handleScanQRCode = () => {
    // 跳转到扫码页面
    router.push('/qrScanner');
  };



  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserInfo();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF7214']} // Android
            tintColor="#FF7214" // iOS
          />
        }
      >


        {/* 用户信息卡片 */}
        <View style={styles.userCard}>
          {/* 头像和基本信息 */}
          <View style={styles.userHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push('/user/account')}
            >
              {userInfo?.avatar ? (
                <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={40} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.userBasicInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{userInfo?.username || 'Daisy'}</Text>
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>普通会员</Text>
                </View>
              </View>
              <Text style={styles.userPhone}>{phone || '156****3499'}</Text>
            </View>
          </View>

          {/* 统计信息 */}
          <View style={styles.statsContainer}>
            <TouchableOpacity onPress={() => router.push('/(member)/top-up')} activeOpacity={0.7} style={[styles.statItem, styles.statItemLeft]}>
              <View style={[styles.statContent, styles.statContentLeft]}>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statPrefix}>¥</Text>
                  <Text style={styles.statValue}>{formatNumber(userInfo?.balance || 0)}</Text>
                </View>
                <Text style={styles.statLabel}>余额</Text>
              </View>
            </TouchableOpacity>

            {/* <View style={styles.statDivider} /> */}
            <TouchableOpacity onPress={() => router.push('/user/coupon')} activeOpacity={0.7} style={[styles.statItem, styles.statItemCenter]}>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{userInfo?.couponCount || 0}</Text>
                <Text style={styles.statLabel}>优惠券</Text>
              </View>
            </TouchableOpacity>

            {/* <View style={styles.statDivider} /> */}
            <TouchableOpacity onPress={() => router.push('/(points)/pointPage')} activeOpacity={0.7} style={[styles.statItem, styles.statItemCenter]}>
                <View style={[styles.statContent, styles.statContentRight]}>
                  <Text style={styles.statValue}>{userInfo?.integral || 0}</Text>
                  <Text style={styles.statLabel}>积分</Text>
                </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 功能列表 */}
        <MenuList
          items={menuItems}
          containerStyle={styles.functionsContainer}
        />
      </ScrollView>
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
    backgroundColor: '#fff',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 60,
    paddingHorizontal: 4,
    paddingVertical: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF7214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBasicInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 20,
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
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  userPhone: {
    fontSize: 13,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statItemLeft: {
    alignItems: 'flex-start',
  },
  statItemCenter: {
    alignItems: 'center',
  },
  statItemRight: {
    alignItems: 'flex-end',
  },
  statContent: {
    alignItems: 'center',
  },
  statContentLeft: {
    alignSelf: 'flex-start',
  },
  statContentRight: {
    alignSelf: 'flex-end',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  statPrefix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  functionsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});
