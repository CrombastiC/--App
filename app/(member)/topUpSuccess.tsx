import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopUpSuccessScreen() {
  const params = useLocalSearchParams<{ amount: string }>();
  const amount = params.amount || '0';

  const handleReturn = () => {
    // 返回到个人中心或充值页面
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* 成功图标 */}
        <View style={styles.iconContainer}>
          <Icon source="check-circle" size={80} color="#52C41A" />
        </View>

        {/* 成功文字 */}
        <Text style={styles.title}>充值成功</Text>
        
        {/* 充值金额 */}
        <Text style={styles.amountLabel}>充值金额：</Text>
        <Text style={styles.amount}>¥{amount}</Text>

        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturn}
          activeOpacity={0.8}
        >
          <Text style={styles.returnButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '300',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 48,
  },
  returnButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FF7214',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
