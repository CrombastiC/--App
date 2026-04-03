import Modal from '@/components/ui/Modal';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Modal 组件使用示例
 */
export default function ModalExample() {
  const [simpleModalVisible, setSimpleModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Modal 组件示例</Text>

      {/* 示例 1: 简单提示弹窗 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setSimpleModalVisible(true)}
      >
        <Text style={styles.buttonText}>简单提示弹窗</Text>
      </TouchableOpacity>

      <Modal
        visible={simpleModalVisible}
        onClose={() => setSimpleModalVisible(false)}
        title="提示"
        confirmText="知道了"
      >
        <Text style={styles.modalText}>这是一个简单的提示弹窗</Text>
      </Modal>

      {/* 示例 2: 确认弹窗 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setConfirmModalVisible(true)}
      >
        <Text style={styles.buttonText}>确认弹窗</Text>
      </TouchableOpacity>

      <Modal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title="确认操作"
        confirmText="确定"
        cancelText="取消"
        onConfirm={() => {
          console.log('确认操作');
          setConfirmModalVisible(false);
        }}
        onCancel={() => {
          console.log('取消操作');
          setConfirmModalVisible(false);
        }}
      >
        <Text style={styles.modalText}>确定要执行此操作吗？</Text>
      </Modal>

      {/* 示例 3: 自定义样式弹窗 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCustomModalVisible(true)}
      >
        <Text style={styles.buttonText}>自定义样式弹窗</Text>
      </TouchableOpacity>

      <Modal
        visible={customModalVisible}
        onClose={() => setCustomModalVisible(false)}
        title="自定义弹窗"
        confirmText="好的"
        showCloseButton={false}
        maskClosable={true}
        widthRatio={0.9}
        containerStyle={styles.customModal}
      >
        <View style={styles.customContent}>
          <Text style={styles.modalText}>这是一个自定义样式的弹窗</Text>
          <Text style={styles.modalText}>可以点击遮罩层关闭</Text>
          <Text style={styles.modalText}>没有关闭按钮</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  customModal: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  customContent: {
    gap: 8,
  },
});
