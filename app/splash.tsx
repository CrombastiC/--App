/**
 * 开屏页面组件
 * 显示欢迎语、倒计时和跳过按钮
 */

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 开屏页面组件
 * 功能特性：
 * 1. 显示欢迎语
 * 2. 右上角倒计时显示
 * 3. 手动跳过按钮
 * 4. 自动跳转到主应用
 * 
 * @returns JSX.Element 开屏页面的渲染结果
 */
export default function SplashScreen() {
  // 倒计时状态，初始值为3秒
  const [countdown, setCountdown] = useState(3);

  /**
   * 倒计时效果
   * 每秒递减，到0时自动跳转到主应用
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // 倒计时结束，使用 setTimeout 延迟跳转避免渲染期间状态更新
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 组件卸载时清理定时器
    return () => clearInterval(timer);
  }, []);

  /**
   * 手动跳过开屏页面
   * 直接跳转到主应用
   */
  const handleSkip = () => {
    // 使用 setTimeout 延迟跳转避免渲染期间状态更新
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 右上角倒计时和跳过按钮 */}
      <View style={styles.header}>
        <View style={styles.countdownContainer}>
          <Text variant="bodyMedium" style={styles.countdownText}>
            {countdown}s
          </Text>
          <Button
            mode="text"
            onPress={handleSkip}
            style={styles.skipButton}
            labelStyle={styles.skipButtonText}
          >
            跳过
          </Button>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 欢迎语 */}
        <View style={styles.welcomeContainer}>
          <Text variant="displaySmall" style={styles.welcomeTitle}>
            欢迎使用
          </Text>
          <Text variant="headlineMedium" style={styles.appName}>
            RN Components
          </Text>
          <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
            探索 React Native 组件的无限可能
          </Text>
        </View>

        {/* 装饰性元素 */}
        <View style={styles.decorativeContainer}>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </View>
      </View>

      {/* 底部提示 */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          正在为您准备最佳体验...
        </Text>
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
    backgroundColor: '#f5f5f5',
  },
  /** 头部区域样式 */
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  /** 倒计时容器样式 */
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  /** 倒计时文本样式 */
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  /** 跳过按钮样式 */
  skipButton: {
    minWidth: 0,
  },
  /** 跳过按钮文本样式 */
  skipButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  /** 内容区域样式 */
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  /** 欢迎语容器样式 */
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  /** 欢迎标题样式 */
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#333',
    marginBottom: 8,
  },
  /** 应用名称样式 */
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 16,
  },
  /** 欢迎副标题样式 */
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  /** 装饰性元素容器样式 */
  decorativeContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** 装饰性圆圈1样式 */
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
  },
  /** 装饰性圆圈2样式 */
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#BBDEFB',
    opacity: 0.8,
  },
  /** 装饰性圆圈3样式 */
  decorativeCircle3: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    opacity: 1,
  },
  /** 底部区域样式 */
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  /** 底部文本样式 */
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
