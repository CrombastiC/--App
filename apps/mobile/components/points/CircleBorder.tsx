import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CircleBorderProps {
  /** 圆的大小 */
  size?: number;
  /** 容器样式 */
  style?: ViewStyle;
}

/**
 * 🎨 装饰性圆圈边框组件
 * 
 * 特点:
 * - 四条边的装饰性圆圈
 * - 橙色实心、白色空心、浅色实心交替排列
 * - 自动计算位置，无需手动调整
 */
const CircleBorder: React.FC<CircleBorderProps> = ({ size = 12, style }) => {
  // 每条边上的5个圆配置 [橙色实心, 白色空心, 浅色实心, 白色空心, 橙色实心]
  const borderCircles = [
    { type: 'solid', color: 'rgb(227, 120, 21)' }, // 角落 - 橙色
    { type: 'hollow' }, // 空心白色
    { type: 'solid', color: 'rgb(255, 247, 232)' }, // 中间 - 浅色
    { type: 'hollow' }, // 空心白色
    { type: 'solid', color: 'rgb(227, 120, 21)' }, // 角落 - 橙色
  ];

  // 渲染单个圆圈
  const renderCircle = (circle: typeof borderCircles[0], key: string) => (
    <View
      key={key}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        circle.type === 'hollow' 
          ? styles.hollowCircle 
          : { backgroundColor: circle.color },
      ]}
    />
  );

  return (
    <>
      {/* 上边框 - 横向5个圆 */}
      <View style={[styles.upperBorder, { top: -size / 2, left: -size / 2, right: -size / 2, height: size }]}>
        {borderCircles.map((circle, index) => renderCircle(circle, `top-${index}`))}
      </View>

      {/* 右边框 - 纵向5个圆 */}
      <View style={[styles.rightBorder, { right: -size / 2, top: -size / 2, bottom: -size / 2, width: size }]}>
        {borderCircles.map((circle, index) => renderCircle(circle, `right-${index}`))}
      </View>

      {/* 下边框 - 横向5个圆 */}
      <View style={[styles.lowerBorder, { bottom: -size / 2, left: -size / 2, right: -size / 2, height: size }]}>
        {borderCircles.map((circle, index) => renderCircle(circle, `bottom-${index}`))}
      </View>

      {/* 左边框 - 纵向5个圆 */}
      <View style={[styles.leftBorder, { left: -size / 2, top: -size / 2, bottom: -size / 2, width: size }]}>
        {borderCircles.map((circle, index) => renderCircle(circle, `left-${index}`))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  // 上边框 - 横向5个圆
  upperBorder: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 右边框 - 纵向5个圆
  rightBorder: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 下边框 - 横向5个圆
  lowerBorder: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 左边框 - 纵向5个圆
  leftBorder: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 通用圆样式
  circle: {
    // 动态设置大小
  },
  // 空心圆样式
  hollowCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default CircleBorder;
