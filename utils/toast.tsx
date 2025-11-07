import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

/**
 * Toast 位置类型
 */
export type ToastPosition = 'top' | 'center' | 'bottom';

/**
 * Toast 配置接口
 */
interface ToastConfig {
  message: string;
  duration?: number;
  position?: ToastPosition;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Toast 显示选项
 */
export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

class ToastManager {
  private static callback: ((config: ToastConfig | null) => void) | null = null;

  static setCallback(callback: (config: ToastConfig | null) => void) {
    this.callback = callback;
  }

  /**
   * 显示 Toast
   * @param message 提示消息
   * @param options 配置选项
   */
  static show(message: string, options?: ToastOptions) {
    if (this.callback) {
      this.callback({
        message,
        duration: options?.duration || 2000,
        position: options?.position || 'bottom',
        containerStyle: options?.containerStyle,
        textStyle: options?.textStyle,
      });
    }
  }

  static hide() {
    if (this.callback) {
      this.callback(null);
    }
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ToastManager.setCallback(setConfig);
    return () => ToastManager.setCallback(() => {});
  }, []);

  useEffect(() => {
    if (config) {
      // 淡入动画
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 设置自动隐藏
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setConfig(null);
        });
      }, config.duration || 2000);

      return () => clearTimeout(timer);
    }
  }, [config, opacity]);

  // 根据位置计算样式
  const getPositionStyle = (): ViewStyle => {
    const position = config?.position || 'bottom';
    switch (position) {
      case 'top':
        return { top: 100 };
      case 'center':
        return { top: '50%', transform: [{ translateY: -20 }] };
      case 'bottom':
      default:
        return { bottom: 100 };
    }
  };

  return (
    <>
      {children}
      {config && (
        <Animated.View
          style={[
            styles.toast,
            getPositionStyle(),
            config.containerStyle,
            {
              opacity: opacity,
            },
          ]}
        >
          <Text style={[styles.toastText, config.textStyle]}>{config.message}</Text>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    maxWidth: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default ToastManager;
