/**
 * Toast 增强功能演示
 * 
 * 展示如何使用新的位置和自定义样式功能
 */

import ToastManager from '@/utils/toast';
import React from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ToastDemo() {
  // ============ 位置演示 ============
  
  const showTopToast = () => {
    ToastManager.show('这是顶部提示', { 
      position: 'top' 
    });
  };

  const showCenterToast = () => {
    ToastManager.show('这是居中提示', { 
      position: 'center' 
    });
  };

  const showBottomToast = () => {
    ToastManager.show('这是底部提示', { 
      position: 'bottom' 
    });
  };

  // ============ 样式演示 ============

  const showSuccessToast = () => {
    ToastManager.show('保存成功！', {
      position: 'top',
      containerStyle: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        paddingHorizontal: 25,
        paddingVertical: 15,
      },
      textStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
    });
  };

  const showErrorToast = () => {
    ToastManager.show('操作失败，请重试', {
      position: 'center',
      duration: 3000,
      containerStyle: {
        backgroundColor: '#f44336',
        borderRadius: 15,
        paddingHorizontal: 30,
        paddingVertical: 15,
        minWidth: 220,
      },
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    });
  };

  const showWarningToast = () => {
    ToastManager.show('请注意检查！', {
      position: 'top',
      containerStyle: {
        backgroundColor: '#FF9800',
        borderRadius: 12,
      },
      textStyle: {
        fontSize: 15,
        fontWeight: '500',
      },
    });
  };

  const showInfoToast = () => {
    ToastManager.show('您有新消息', {
      position: 'bottom',
      containerStyle: {
        backgroundColor: '#2196F3',
        borderRadius: 18,
        paddingHorizontal: 28,
      },
    });
  };

  // ============ 特殊效果演示 ============

  const showCustomToast = () => {
    ToastManager.show('自定义样式 Toast', {
      position: 'center',
      duration: 2500,
      containerStyle: {
        backgroundColor: '#9C27B0',
        borderRadius: 25,
        paddingHorizontal: 35,
        paddingVertical: 18,
        minWidth: 200,
      },
      textStyle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1,
      },
    });
  };

  const showLongTextToast = () => {
    ToastManager.show('这是一个很长的提示信息，用来测试 Toast 组件对长文本的处理能力', {
      position: 'center',
      duration: 3500,
      containerStyle: {
        minWidth: 280,
        maxWidth: '90%',
        paddingHorizontal: 20,
        paddingVertical: 16,
      },
      textStyle: {
        fontSize: 14,
        lineHeight: 20,
      },
    });
  };

  // ============ 实际场景模拟 ============

  const simulateLogin = () => {
    ToastManager.show('登录成功，欢迎回来！', {
      position: 'top',
      duration: 2000,
      containerStyle: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
      },
      textStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
    });
  };

  const simulateSave = () => {
    ToastManager.show('保存成功', {
      position: 'bottom',
      containerStyle: {
        backgroundColor: '#4CAF50',
      },
    });
  };

  const simulateNetworkError = () => {
    ToastManager.show('网络连接失败，请检查网络', {
      position: 'center',
      duration: 3000,
      containerStyle: {
        backgroundColor: '#f44336',
        minWidth: 250,
      },
      textStyle: {
        fontSize: 16,
      },
    });
  };

  const simulateValidation = () => {
    ToastManager.show('请填写完整信息', {
      position: 'top',
      containerStyle: {
        backgroundColor: '#FF9800',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Button title="顶部提示" onPress={showTopToast} color="#2196F3" />
        </View>

        <View style={styles.section}>
          <Button title="居中提示" onPress={showCenterToast} color="#2196F3" />
        </View>

        <View style={styles.section}>
          <Button title="底部提示" onPress={showBottomToast} color="#2196F3" />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Button title="成功提示（绿色）" onPress={showSuccessToast} color="#4CAF50" />
        </View>

        <View style={styles.section}>
          <Button title="错误提示（红色）" onPress={showErrorToast} color="#f44336" />
        </View>

        <View style={styles.section}>
          <Button title="警告提示（橙色）" onPress={showWarningToast} color="#FF9800" />
        </View>

        <View style={styles.section}>
          <Button title="信息提示（蓝色）" onPress={showInfoToast} color="#2196F3" />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Button title="自定义样式" onPress={showCustomToast} color="#9C27B0" />
        </View>

        <View style={styles.section}>
          <Button title="长文本提示" onPress={showLongTextToast} color="#607D8B" />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Button title="模拟登录成功" onPress={simulateLogin} color="#4CAF50" />
        </View>

        <View style={styles.section}>
          <Button title="模拟保存成功" onPress={simulateSave} color="#4CAF50" />
        </View>

        <View style={styles.section}>
          <Button title="模拟网络错误" onPress={simulateNetworkError} color="#f44336" />
        </View>

        <View style={styles.section}>
          <Button title="模拟表单验证" onPress={simulateValidation} color="#FF9800" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 15,
  },
  divider: {
    height: 20,
    marginVertical: 10,
  },
});
