/**
 * 我的页面
 */

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const handleScanQRCode = () => {
    // 跳转到扫码页面
    router.push('/qrScanner');
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
});
