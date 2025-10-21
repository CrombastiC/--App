/**
 * 我的页面
 */

import { tokenManager } from '@/services';
import { StorageUtils } from '@/utils/storage';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
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
            // 调用退出登录接口
            // await authService.logout();
            // 清除本地登录信息
            await tokenManager.clearLoginInfo();
            // 清除用户名
            await StorageUtils.delete('userName');
            // 清除头像
            await StorageUtils.delete('userAvatar');
            // 跳转到登录页
            router.replace('/auth/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header mode="small">
        <Appbar.Content title="我的" />
        <Appbar.Action 
          icon="qrcode-scan" 
          onPress={handleScanQRCode}
          iconColor="#FF7214"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="titleLarge">我的页面</Text>
        
        <Button 
          mode="contained" 
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#FF7214"
          icon="logout"
        >
          退出登录
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
