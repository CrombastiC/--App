/**
 * MenuItem - 菜单项组件
 * 用于列表项展示，支持图标、文字、右侧内容、箭头等
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface MenuItemProps {
  /** 左侧图标名称 (MaterialCommunityIcons) */
  icon?: string;
  /** 图标颜色 */
  iconColor?: string;
  /** 图标大小 */
  iconSize?: number;
  /** 标签文本 */
  label: string;
  /** 右侧内容文本 */
  value?: string;
  /** 右侧自定义内容 */
  rightContent?: ReactNode;
  /** 是否显示右侧箭头 */
  showArrow?: boolean;
  /** 箭头颜色 */
  arrowColor?: string;
  /** 点击事件 */
  onPress?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 容器样式 */
  containerStyle?: ViewStyle;
  /** 标签样式 */
  labelStyle?: TextStyle;
  /** 值样式 */
  valueStyle?: TextStyle;
  /** 是否显示底部分割线 */
  showDivider?: boolean;
  /** 分割线样式 */
  dividerStyle?: ViewStyle;
}

export default function MenuItem({
  icon,
  iconColor = '#333',
  iconSize = 22,
  label,
  value,
  rightContent,
  showArrow = true,
  arrowColor = '#ccc',
  onPress,
  disabled = false,
  containerStyle,
  labelStyle,
  valueStyle,
  showDivider = false,
  dividerStyle,
}: MenuItemProps) {
  const Container = onPress && !disabled ? TouchableOpacity : View;

  return (
    <>
      <Container
        style={[
          styles.container,
          disabled && styles.containerDisabled,
          containerStyle,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.6}
      >
        <View style={styles.leftSection}>
          {icon && (
            <MaterialCommunityIcons
              name={icon as any}
              size={iconSize}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, disabled && styles.labelDisabled, labelStyle]}>
            {label}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {rightContent ? (
            rightContent
          ) : value ? (
            <Text style={[styles.value, disabled && styles.valueDisabled, valueStyle]}>
              {value}
            </Text>
          ) : null}
          
          {showArrow && !disabled && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={arrowColor}
              style={styles.arrow}
            />
          )}
        </View>
      </Container>
      
      {showDivider && <View style={[styles.divider, dividerStyle]} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    minHeight: 56,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  labelDisabled: {
    color: '#999',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  value: {
    fontSize: 15,
    color: '#666',
    marginRight: 4,
  },
  valueDisabled: {
    color: '#999',
  },
  arrow: {
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
  },
});
