/**
 * 标签页布局组件
 * 定义应用底部的标签页导航结构，包含首页和列表两个标签
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * 标签页布局组件
 * 负责配置和管理底部标签页导航
 * 
 * 功能特性：
 * 1. 支持深色/浅色主题切换
 * 2. 提供触觉反馈的标签按钮
 * 3. 自定义图标和标题
 * 4. 隐藏默认头部导航栏
 * 
 * @returns JSX.Element 标签页布局的渲染结果
 */
export default function TabLayout() {
  // 获取当前颜色主题（深色/浅色模式）
  const colorScheme = useColorScheme();

  return (
    // Expo Router 的标签页导航器
    <Tabs
      screenOptions={{
        // 设置激活标签的颜色，根据当前主题动态调整
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // 隐藏默认的头部导航栏
        headerShown: false,
        // 使用自定义的触觉反馈标签按钮组件
        tabBarButton: HapticTab,
      }}>
      
      {/* 首页标签页 - 路由名称对应 index.tsx 文件 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '首页', // 标签页显示的中文标题
          // 自定义标签图标：房屋图标，大小28，颜色随主题变化
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* 列表标签页 - 路由名称对应 explore.tsx 文件 */}
      <Tabs.Screen
        name="explore"
        options={{
          title: '列表', // 标签页显示的中文标题
          // 自定义标签图标：纸飞机图标，大小28，颜色随主题变化
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
