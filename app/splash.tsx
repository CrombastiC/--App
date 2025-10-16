/**
 * 开屏页面组件
 * 显示餐厅名称、图标和加载动画
 */

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 开屏页面组件
 * 功能特性：
 * 1. 显示餐厅图标
 * 2. 显示餐厅名称
 * 3. 闪烁的省略号加载动画
 * 4. 自动跳转到主应用
 * 
 * @returns JSX.Element 开屏页面的渲染结果
 */
export default function SplashScreen() {
  const [dotOpacity] = useState(new Animated.Value(0));

  /**
   * 省略号闪烁动画效果
   */
  useEffect(() => {
    // 创建无限循环的闪烁动画
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnimation.start();

    // 3秒后自动跳转到主应用
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);

    // 组件卸载时清理动画和定时器
    return () => {
      blinkAnimation.stop();
      clearTimeout(timer);
    };
  }, [dotOpacity]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 餐厅图标 */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🍽️</Text>
        </View>

        {/* 餐厅名称 */}
        <Text variant="displayMedium" style={styles.restaurantName}>
          美食餐厅
        </Text>

        {/* 闪烁的省略号 */}
        <Animated.View style={[styles.dotsContainer, { opacity: dotOpacity }]}>
          <Text style={styles.dots}>...</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

/**
 * 样式定义
 * 使用 StyleSheet.create 创建样式对象，提供更好的性能和类型检查
 */
const styles = StyleSheet.create({
  /** 主容器样式 */
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  /** 内容区域样式 */
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  /** 图标容器样式 */
  iconContainer: {
    marginBottom: 32,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    backgroundColor: '#FFF3E0',
  },
  /** 餐厅图标样式 */
  icon: {
    fontSize: 72,
  },
  /** 餐厅名称样式 */
  restaurantName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 24,
    textAlign: 'center',
  },
  /** 省略号容器样式 */
  dotsContainer: {
    marginTop: 16,
  },
  /** 省略号样式 */
  dots: {
    fontSize: 48,
    color: '#FF6B35',
    letterSpacing: 4,
  },
});
