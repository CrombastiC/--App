/**
 * TabSwitch - Tab切换组件
 * 用于页面顶部的选项卡切换，支持2个或多个选项
 */

import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface TabItem<T = string> {
  key: T;
  label: string;
}

export interface TabSwitchProps<T = string> {
  /** Tab选项列表 */
  tabs: TabItem<T>[];
  /** 当前激活的tab */
  activeTab: T;
  /** Tab切换回调 */
  onChange: (tab: T) => void;
  /** 容器样式 */
  containerStyle?: ViewStyle;
  /** Tab项样式 */
  tabItemStyle?: ViewStyle;
  /** Tab文字样式 */
  tabTextStyle?: TextStyle;
  /** 激活的Tab文字样式 */
  activeTabTextStyle?: TextStyle;
  /** 指示器样式 */
  indicatorStyle?: ViewStyle;
  /** 激活颜色 */
  activeColor?: string;
  /** 非激活颜色 */
  inactiveColor?: string;
}

export default function TabSwitch<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  containerStyle,
  tabItemStyle,
  tabTextStyle,
  activeTabTextStyle,
  indicatorStyle,
  activeColor = '#FF7214',
  inactiveColor = '#666',
}: TabSwitchProps<T>) {
  return (
    <View style={[styles.tabContainer, containerStyle]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, tabItemStyle]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { color: inactiveColor },
                tabTextStyle,
                isActive && styles.tabTextActive,
                isActive && { color: activeColor },
                isActive && activeTabTextStyle,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: activeColor },
                  indicatorStyle,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
});
