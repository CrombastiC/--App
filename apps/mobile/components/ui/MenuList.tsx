/**
 * MenuList - 菜单列表组件
 * 通过配置数组快速渲染多个 MenuItem
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import MenuItem, { MenuItemProps } from './MenuItem';

export interface MenuListItem extends Omit<MenuItemProps, 'showDivider'> {
  /** 唯一标识 */
  key: string;
}

export interface MenuListProps {
  /** 菜单项配置数组 */
  items: MenuListItem[];
  /** 容器样式 */
  containerStyle?: ViewStyle;
  /** 是否显示分割线（默认显示） */
  showDivider?: boolean;
  /** 是否显示最后一项的分割线（默认不显示） */
  showLastDivider?: boolean;
}

export default function MenuList({
  items,
  containerStyle,
  showDivider = true,
  showLastDivider = false,
}: MenuListProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const { key, ...itemProps } = item;
        
        return (
          <MenuItem
            key={key}
            {...itemProps}
            showDivider={showDivider && (!isLast || showLastDivider)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});
