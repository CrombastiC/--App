# Toast 组件使用文档

增强版的全局 Toast 提示组件，支持位置控制和自定义样式。

## 📋 功能特性

- ✅ **位置控制**：支持顶部、居中、底部三种位置
- ✅ **自定义样式**：可自定义容器和文字样式
- ✅ **淡入淡出动画**：流畅的显示/隐藏动画
- ✅ **全局调用**：在任何地方都可以调用
- ✅ **自动消失**：可配置显示时长

## 🚀 快速开始

### 1. 基础使用

```tsx
import ToastManager from '@/utils/toast';

// 默认样式（底部，2秒后消失）
ToastManager.show('操作成功');
```

### 2. 位置控制

```tsx
// 顶部显示
ToastManager.show('顶部提示', { position: 'top' });

// 居中显示
ToastManager.show('居中提示', { position: 'center' });

// 底部显示（默认）
ToastManager.show('底部提示', { position: 'bottom' });
```

### 3. 自定义时长

```tsx
// 显示 3 秒
ToastManager.show('加载中...', { duration: 3000 });

// 显示 1.5 秒
ToastManager.show('保存成功', { duration: 1500 });
```

## 🎨 自定义样式

### 1. 自定义容器样式

```tsx
ToastManager.show('成功提示', {
  containerStyle: {
    backgroundColor: '#4CAF50',  // 绿色背景
    borderRadius: 20,
    paddingHorizontal: 30,
  },
});
```

### 2. 自定义文字样式

```tsx
ToastManager.show('重要提示', {
  textStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

### 3. 完整自定义

```tsx
ToastManager.show('自定义 Toast', {
  position: 'top',
  duration: 3000,
  containerStyle: {
    backgroundColor: '#FF9800',
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 15,
    minWidth: 200,
  },
  textStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## 💡 常用场景示例

### 成功提示（绿色）

```tsx
ToastManager.show('保存成功', {
  containerStyle: {
    backgroundColor: '#4CAF50',
  },
});
```

### 错误提示（红色）

```tsx
ToastManager.show('操作失败', {
  duration: 3000,
  containerStyle: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### 警告提示（橙色）

```tsx
ToastManager.show('请注意！', {
  position: 'top',
  containerStyle: {
    backgroundColor: '#FF9800',
  },
});
```

### 信息提示（蓝色）

```tsx
ToastManager.show('新消息', {
  containerStyle: {
    backgroundColor: '#2196F3',
  },
});
```

## 📝 API 文档

### ToastManager.show(message, options?)

显示一个 Toast 提示。

**参数：**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| message | string | ✅ | - | 提示消息内容 |
| options | ToastOptions | ❌ | - | 配置选项 |

**ToastOptions：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| duration | number | 2000 | 显示时长（毫秒） |
| position | 'top' \| 'center' \| 'bottom' | 'bottom' | 显示位置 |
| containerStyle | ViewStyle | - | 容器自定义样式 |
| textStyle | TextStyle | - | 文字自定义样式 |

### ToastManager.hide()

手动隐藏当前显示的 Toast。

```tsx
ToastManager.hide();
```

## 🛠️ 高级用法

### 创建预设样式

```tsx
// 创建常用样式的工具函数
export const Toast = {
  success: (message: string) => {
    ToastManager.show(message, {
      containerStyle: { backgroundColor: '#4CAF50' },
    });
  },
  
  error: (message: string) => {
    ToastManager.show(message, {
      duration: 3000,
      containerStyle: { backgroundColor: '#f44336' },
    });
  },
  
  warning: (message: string) => {
    ToastManager.show(message, {
      containerStyle: { backgroundColor: '#FF9800' },
    });
  },
  
  info: (message: string) => {
    ToastManager.show(message, {
      containerStyle: { backgroundColor: '#2196F3' },
    });
  },
};

// 使用
Toast.success('保存成功');
Toast.error('删除失败');
```

### 在组件中使用

```tsx
import React from 'react';
import { Button, View } from 'react-native';
import ToastManager from '@/utils/toast';

export const MyComponent = () => {
  const handleSave = async () => {
    try {
      // 保存逻辑
      await saveData();
      
      // 显示成功提示
      ToastManager.show('保存成功', {
        position: 'top',
        containerStyle: {
          backgroundColor: '#4CAF50',
        },
      });
    } catch (error) {
      // 显示错误提示
      ToastManager.show('保存失败，请重试', {
        position: 'center',
        duration: 3000,
        containerStyle: {
          backgroundColor: '#f44336',
        },
      });
    }
  };

  return (
    <View>
      <Button title="保存" onPress={handleSave} />
    </View>
  );
};
```

## 🎯 默认样式

**容器样式：**
- 半透明黑色背景 `rgba(0, 0, 0, 0.8)`
- 圆角 8px
- 最小宽度 150px
- 最大宽度 80%
- 水平居中显示

**文字样式：**
- 白色文字
- 字体大小 15px
- 居中对齐

**位置：**
- top: 距离顶部 100px
- center: 垂直居中
- bottom: 距离底部 100px（默认）

## ⚠️ 注意事项

1. 确保 `ToastProvider` 已在根组件中配置（通常在 `app/_layout.tsx`）
2. 自定义样式会覆盖默认样式
3. Toast 会自动堆叠在最上层（zIndex: 9999）
4. 同时只能显示一个 Toast

## 📦 已集成的位置

Toast 已在以下位置集成：
- ✅ `app/_layout.tsx` - 根布局已包裹 ToastProvider
- ✅ `request/index.ts` - 401 错误提示
- ✅ `app/user/account.tsx` - 账户信息修改提示
