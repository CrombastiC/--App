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
          {/* 会员相关页面 */}
          <Stack.Screen
            name="(member)/memberCode"
            options={{
              // 显示头部导航栏
              headerShown: true,
              title: '会员码',
              // 使用卡片式过渡动画
              presentation: 'card',
              // 标题居中显示
              headerTitleAlign: 'center',
            }}
          />
          {/* 会员充值页面 */}
          <Stack.Screen
            name="(member)/top-up"
            options={{
              // 显示头部导航栏
              headerShown: true,
              title: '余额',
              // 使用卡片式过渡动画
              presentation: 'card',
              // 标题居中显示
              headerTitleAlign: 'center',
            }}
          />
          {/* 充值成功页面 */}
          <Stack.Screen
            name="(member)/topUpSuccess"
            options={{
              // 显示头部导航栏
              headerShown: true,
              title: '充值成功',
              // 使用卡片式过渡动画
              presentation: 'card',
              // 标题居中显示
              headerTitleAlign: 'center',
            }}
          />
          {/* 位置相关页面 - 门店选择 */}
          <Stack.Screen
            name="(location)/addressSelect"
            options={{
              // 显示头部导航栏
              headerShown: true,
              // 标题将在页面内部根据路由参数动态设置
              title: '选择门店',
              // 使用卡片式过渡动画
              presentation: 'card',
              // 标题居中显示
              headerTitleAlign: 'center',
            }}
          />
          {/* 位置相关页面 - 城市选择 */}
          <Stack.Screen
            name="(location)/citySelect"
            options={{
              // 显示头部导航栏
              headerShown: true,
              title: '选择城市',
              // 使用卡片式过渡动画
              presentation: 'card',
              // 标题居中显示
              headerTitleAlign: 'center',
            }}
          />
        </Stack>
        {/* 状态栏组件，自动适配系统主题 */}
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
