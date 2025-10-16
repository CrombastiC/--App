/**
 * 首页
 */

import { ImageBackground, StyleSheet, View } from 'react-native';
import { Card, Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
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
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Icon source="account" size={24} color="#666" />
              <Text style={styles.cardText}>授权登录</Text>
              <Icon source="qrcode-scan" size={24} color="#FF6B35" />
            </Card.Content>
          </Card>
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
    height: 60,
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});
