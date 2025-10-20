/**
 * 二维码扫描页面
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // 页面加载时检查权限
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    Alert.alert(
      '扫描成功',
      `类型: ${type}\n内容: ${data}`,
      [
        {
          text: '继续扫描',
          onPress: () => setScanned(false),
        },
        {
          text: '确定',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // 权限未加载
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF7214" />
      </SafeAreaView>
    );
  }

  // 权限被拒绝
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: '扫描二维码' }} />
        <View style={styles.permissionContainer}>
          <Icon source="camera-off" size={64} color="#999" />
          <Text style={styles.permissionText}>需要相机权限才能扫描二维码</Text>
          <Button 
            mode="contained" 
            onPress={requestPermission}
            buttonColor="#FF7214"
            style={styles.permissionButton}
          >
            授予权限
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: '扫描二维码',
          headerShown: true,
        }} 
      />
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        >
          <View style={styles.overlay}>
            {/* 顶部遮罩 */}
            <View style={styles.overlayTop} />
            
            {/* 中间扫描区域 */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea}>
                {/* 四个角的边框 */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            
            {/* 底部遮罩和提示 */}
            <View style={styles.overlayBottom}>
              <Text style={styles.hintText}>将二维码放入框内，即可自动扫描</Text>
              
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanButtonText}>重新扫描</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </>
  );
}

const SCAN_AREA_SIZE = 250;
const CORNER_SIZE = 20;
const CORNER_BORDER_WIDTH = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    minWidth: 150,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FF7214',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  rescanButton: {
    backgroundColor: '#FF7214',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
