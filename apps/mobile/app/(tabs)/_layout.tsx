/**
 * 标签页布局组件
 * 定义应用底部的标签页导航结构，包含首页、点餐、订单和我的四个标签
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from 'react-native-paper';

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
          tabBarIcon: ({ color }) => <Icon source="home" size={28} color={color} />,
        }}
      />
      
      {/* 点餐标签页 - 路由名称对应 order.tsx 文件 */}
      <Tabs.Screen
        name="order"
        options={{
          title: '点餐', // 标签页显示的中文标题
          headerShown: true, // 显示头部导航栏
          headerTitleAlign: 'center',
          // 自定义标签图标：餐具图标，大小28，颜色随主题变化
          tabBarIcon: ({ color }) => <Icon source="silverware-fork-knife" size={28} color={color} />,
        }}
      />
      
      {/* 订单标签页 - 路由名称对应 orders.tsx 文件 */}
      <Tabs.Screen
        name="orders"
        options={{
          title: '订单', // 标签页显示的中文标题
          // 自定义标签图标：列表图标，大小28，颜色随主题变化
          tabBarIcon: ({ color }) => <Icon source="clipboard-text-outline" size={28} color={color} />,
        }}
      />
      
      {/* 我的标签页 - 路由名称对应 profile.tsx 文件 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的', // 标签页显示的中文标题
          // 自定义标签图标：人物图标，大小28，颜色随主题变化
          tabBarIcon: ({ color }) => <Icon source="account" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="icon"
        options={{
          title: '图标组', // 标签页显示的中文标题
          // 自定义标签图标：人物图标，大小28，颜色随主题变化
          tabBarIcon: ({ color }) => <Icon source="account" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
