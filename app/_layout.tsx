/**
 * 应用根布局组件
 * 负责整个应用的全局配置、主题设置和导航结构
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfileStore } from '@/stores/profile-store';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

/**
 * Expo Router 的配置选项
 * anchor: 指定默认的锚点路由，这里设置为 'splash' 表示默认显示开屏页面
 */
export const unstable_settings = {
  anchor: 'splash',
};

/**
 * 根布局组件
 * 这是整个应用的顶层组件，负责：
 * 1. 设置全局主题（深色/浅色模式）
 * 2. 配置导航结构
 * 3. 初始化应用状态
 * 4. 设置状态栏样式
 */
export default function RootLayout() {
  // 获取当前颜色主题（深色/浅色模式）
  const colorScheme = useColorScheme();

  // 根据颜色主题选择对应的导航主题
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  // 根据颜色主题选择对应的 Material Design 3 主题
  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  // 从状态管理 store 中获取加载用户配置的方法
  const loadProfiles = useProfileStore((state) => state.loadProfiles);

  /**
   * 应用启动时加载持久化数据
   * 在组件挂载后执行，用于恢复用户之前保存的应用状态
   */
  useEffect(() => {
    loadProfiles().catch(console.error);
  }, [loadProfiles]);

  return (
    // Material Design 3 主题提供器，为整个应用提供 Material Design 组件样式
    <PaperProvider theme={paperTheme}>
      {/* React Navigation 主题提供器，为导航组件提供样式 */}
      <ThemeProvider value={navigationTheme}>
        {/* Expo Router 的堆栈导航器，管理页面间的导航 */}
        <Stack>
          {/* 开屏页面路由，隐藏默认头部 */}
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          {/* 标签页布局路由，隐藏默认头部 */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* 认证相关页面（登录、注册、重置密码），隐藏默认头部 */}
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          {/* 用户相关页面，具体页面配置在 user/_layout.tsx */}
          <Stack.Screen name="user" options={{ headerShown: false }} />
          {/* 会员相关页面，具体页面配置在 (member)/_layout.tsx */}
          <Stack.Screen name="(member)" options={{ headerShown: false }} />
          {/* 积分相关页面，具体页面配置在 (points)/_layout.tsx */}
          <Stack.Screen name="(points)" options={{ headerShown: false }} />
          {/* 位置相关页面，具体页面配置在 (location)/_layout.tsx */}
          <Stack.Screen name="(location)" options={{ headerShown: false }} />
          {/* 点餐相关页面，具体页面配置在 (orderfood)/_layout.tsx */}
          <Stack.Screen name="(orderfood)" options={{ headerShown: false }} />
        </Stack>
        {/* 状态栏组件，自动适配系统主题 */}
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
