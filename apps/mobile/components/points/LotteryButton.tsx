import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface LotteryButtonProps {
  /** 按钮标题 */
  title: string;
  /** 是否显示免费抽奖 */
  isFree?: boolean;
  /** 免费抽奖次数 */
  freeCount?: number;
  /** 积分消耗 */
  cost?: number;
  /** 点击回调 */
  onPress: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义容器样式 */
  style?: ViewStyle;
}

/**
 * 🎰 抽奖按钮组件
 * 
 * 特点:
 * - 统一的抽奖按钮样式
 * - 支持免费次数和积分消耗两种模式
 * - 自动处理禁用状态
 * - 响应式设计，适配不同内容
 */
const LotteryButton: React.FC<LotteryButtonProps> = ({
  title,
  isFree = false,
  freeCount = 0,
  cost = 0,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {/* 标题 */}
        <Text style={styles.buttonText}>{title}</Text>

        {/* 消耗信息 */}
        {isFree && freeCount > 0 ? (
          // 免费抽奖模式
          <View style={styles.freeRow}>
            <Text
              style={styles.freeDrawSubText}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.7}
            >
              免费抽奖次数：{freeCount}次
            </Text>
          </View>
        ) : (
          // 积分消耗模式
          <View style={styles.costRow}>
            <Image
              source={require('../../assets/images/积分.png')}
              style={styles.costIcon}
            />
            <Text style={styles.buttonSubText}>{cost}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: 'rgba(255, 140, 50)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: 'rgba(255, 100, 0, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonSubText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 20,
  },
  costIcon: {
    width: 20,
    height: 20,
  },
  freeRow: {
    minHeight: 20,
    justifyContent: 'center',
  },
  freeDrawSubText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '400',
    opacity: 0.9,
  },
});

export default LotteryButton;
