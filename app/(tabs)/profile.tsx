/**
 * 我的页面
 */

import { tokenManager } from '@/services';
import { StorageUtils } from '@/utils/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  avatar?: string;
}

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // 从缓存中获取用户信息
      const userInfoStr = await StorageUtils.getString('userInfo');
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr) as UserInfo;
        setUserInfo(user);

        // 格式化手机号，隐藏中间4位
        if (user.phone) {
          const formattedPhone = user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
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

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗?',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: async () => {
            // 清除本地登录信息
            await tokenManager.clearLoginInfo();
            await StorageUtils.delete('userName');
            await StorageUtils.delete('userAvatar');
            // 跳转到登录页
            router.replace('/auth/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 顶部右侧菜单按钮 */}
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#999" />
        </TouchableOpacity>

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
            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statPrefix}>¥</Text>
                <Text style={styles.statValue}>{formatNumber(1200.0)}</Text>
              </View>
              <Text style={styles.statLabel}>余额</Text>
            </View>

            {/* <View style={styles.statDivider} /> */}

            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>优惠券</Text>
            </View>

            {/* <View style={styles.statDivider} /> */}

            <View style={styles.statItem}>
              <Text style={styles.statValue}>200</Text>
              <Text style={styles.statLabel}>积分</Text>
            </View>
          </View>
        </View>

        {/* 功能列表 */}
        <View style={styles.functionsContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="map-marker" size={22} color="#333" />
              <Text style={styles.menuItemText}>会员权益</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>任务中心</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>任务中心</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>任务中心</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>任务中心</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>任务中心</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>任务中心</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
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
    // paddingTop: 24,
    // paddingBottom: 8,
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  functionsContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuItem: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
    marginLeft: 12,
  },
});
