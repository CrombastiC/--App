import React, { ReactNode } from 'react';
import {
  Dimensions,
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Icon } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 弹窗标题 */
  title?: string;
  /** 弹窗内容 */
  children: ReactNode;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 确认按钮回调 */
  onConfirm?: () => void;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 取消按钮回调 */
  onCancel?: () => void;
  /** 自定义弹窗宽度比例 (0-1) */
  widthRatio?: number;
  /** 自定义最大高度比例 (0-1) */
  maxHeightRatio?: number;
  /** 自定义容器样式 */
  containerStyle?: ViewStyle;
  /** 点击遮罩层是否关闭 */
  maskClosable?: boolean;
  /** 动画类型 */
  animationType?: 'none' | 'slide' | 'fade';
}

/**
 * 🎯 通用 Modal 弹窗组件
 * 
 * 特点:
 * - 高度可定制化
 * - 支持标题、内容、按钮的灵活配置
 * - 美观的默认样式
 * - 支持自定义样式
 * 
 * @example
 * ```tsx
 * <Modal
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   title="提示"
 *   confirmText="确定"
 *   onConfirm={() => handleConfirm()}
 * >
 *   <Text>这是弹窗内容</Text>
 * </Modal>
 * ```
 */
const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  widthRatio = 0.85,
  maxHeightRatio = 0.8,
  containerStyle,
  maskClosable = false,
  animationType = 'fade',
}) => {
  const handleOverlayPress = () => {
    if (maskClosable) {
      onClose();
    }
  };

  const handleConfirmPress = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancelPress = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.modalContainer,
            {
              width: SCREEN_WIDTH * widthRatio,
              maxHeight: `${maxHeightRatio * 100}%`,
            },
            containerStyle,
          ]}
        >
          {/* 关闭按钮 */}
          {showCloseButton && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon source="close" size={24} color="#666" />
            </TouchableOpacity>
          )}

          {/* 标题 */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          {/* 内容区域 */}
          <View style={styles.content}>{children}</View>

          {/* 按钮区域 */}
          {(confirmText || cancelText) && (
            <View style={styles.buttonContainer}>
              {cancelText && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    !confirmText && styles.buttonFull,
                  ]}
                  onPress={handleCancelPress}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              {confirmText && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    !cancelText && styles.buttonFull,
                  ]}
                  onPress={handleConfirmPress}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  header: {
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#FF7214',
    shadowColor: 'rgba(255, 114, 20, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default Modal;
