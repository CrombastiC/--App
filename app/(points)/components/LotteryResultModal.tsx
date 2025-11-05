import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Prize {
  prizeName: string;
  prizeImage?: string;
}

interface LotteryResultModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 中奖奖品列表 */
  prizes: Prize[];
  /** 是否是多连抽 */
  isMulti?: boolean;
}

/**
 * 🎉 抽奖结果展示弹窗
 * 
 * 特点:
 * - 美观的弹窗设计
 * - 支持单抽和多连抽展示
 * - 带图片和名称的奖品展示
 * - 可滚动查看多个奖品
 */
const LotteryResultModal: React.FC<LotteryResultModalProps> = ({
  visible,
  onClose,
  prizes,
  isMulti = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 关闭按钮 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon source="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>
              {isMulti ? '十连抽结果' : '恭喜中奖'}
            </Text>
          </View>

          {/* 奖品列表 */}
          <ScrollView
            style={styles.prizeList}
            contentContainerStyle={styles.prizeListContent}
            showsVerticalScrollIndicator={false}
          >
            {prizes.map((prize, index) => (
              <View key={index} style={styles.prizeItem}>
                {/* 奖品图片 */}
                {prize.prizeImage && (
                  <Image
                    source={{ uri: prize.prizeImage }}
                    style={styles.prizeImage}
                    resizeMode="contain"
                  />
                )}
                {/* 奖品名称 */}
                <Text style={styles.prizeName} numberOfLines={2}>
                  {prize.prizeName}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* 确认按钮 */}
          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>太棒了！</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    width: SCREEN_WIDTH * 0.85,
    maxHeight: '80%',
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
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7214',
    textAlign: 'center',
  },
  prizeList: {
    maxHeight: 400,
  },
  prizeListContent: {
    gap: 16,
    paddingBottom: 8,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  prizeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  prizeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#FF7214',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
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
});

export default LotteryResultModal;
