/**
 * 支付确认页面
 * 用户下单后跳转到此页面确认支付
 */

import { payService, PayPageResult } from '@/services/pay.service';
import ToastManager from '@/utils/toast';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Appbar, Button, Card, Text, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

export default function PayScreen() {
  const params = useLocalSearchParams<{
    orderId: string;
    totalAmount: string;
    subject: string;
    body?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [payResult, setPayResult] = useState<PayPageResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const orderId = params.orderId || '';
  const totalAmount = parseFloat(params.totalAmount || '0');
  const subject = params.subject || '点餐订单';
  const body = params.body || '';

  // 倒计时
  useEffect(() => {
    if (!payResult?.timeExpire) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, payResult.timeExpire - now);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        ToastManager.show('支付已超时，请重新下单');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [payResult?.timeExpire]);

  /** 发起支付 */
  const handlePay = useCallback(async () => {
    if (!orderId) {
      ToastManager.show('订单信息缺失');
      return;
    }

    setLoading(true);
    const [error, data] = await payService.createPay({
      orderId,
      subject,
      body,
      totalAmount,
      payType: 'page',
    });

    setLoading(false);

    if (error) {
      ToastManager.show('创建支付失败，请重试');
      return;
    }

    const result = data as PayPageResult;
    setPayResult(result);

    // 打开支付宝支付页面
    try {
      const browserResult = await WebBrowser.openBrowserAsync(result.payUrl, {
        toolbarColor: '#1677FF',
        enableBarCollapsing: true,
        showInRecents: true,
      });

      if (browserResult.type === 'cancel') {
        ToastManager.show('支付已取消');
      }
    } catch (e) {
      ToastManager.show('打开支付页面失败');
    }
  }, [orderId, subject, body, totalAmount]);

  /** 格式化剩余时间 */
  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '已超时';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header mode="small">
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="确认支付" />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 订单信息卡片 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              订单信息
            </Text>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>
                订单编号
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {orderId}
              </Text>
            </View>
            {payResult && (
              <View style={styles.row}>
                <Text variant="bodyMedium" style={styles.label}>
                  交易单号
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {payResult.outTradeNo}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 金额卡片 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              支付金额
            </Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currency}>¥</Text>
              <Text style={styles.amount}>{totalAmount.toFixed(2)}</Text>
            </View>

            {timeLeft > 0 && (
              <View style={styles.timerRow}>
                <Chip icon="clock-outline" mode="outlined" style={styles.timerChip}>
                  剩余 {formatTimeLeft(timeLeft)}
                </Chip>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* 支付方式 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              支付方式
            </Text>
            <View style={styles.paymentMethod}>
              <View style={styles.alipayRow}>
                <Text style={styles.alipayIcon}>支付宝</Text>
                <Text variant="bodyMedium">支付宝支付</Text>
              </View>
              <Divider style={styles.divider} />
            </View>
          </Card.Content>
        </Card>

        {/* 操作按钮 */}
        <View style={styles.buttonContainer}>
          {!payResult ? (
            <Button
              mode="contained"
              onPress={handlePay}
              loading={loading}
              disabled={loading}
              style={styles.payButton}
              contentStyle={styles.payButtonContent}
              labelStyle={styles.payButtonLabel}
            >
              {loading ? '正在创建支付...' : '立即支付'}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handlePay}
              disabled={timeLeft <= 0}
              style={styles.payButton}
              contentStyle={styles.payButtonContent}
              labelStyle={styles.payButtonLabel}
            >
              {timeLeft <= 0 ? '已超时' : '重新支付'}
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            返回
          </Button>
        </View>

        {/* 提示 */}
        <View style={styles.tips}>
          <Text variant="bodySmall" style={styles.tipsText}>
            支付完成后请耐心等待，系统会自动更新订单状态
          </Text>
          <Text variant="bodySmall" style={styles.tipsText}>
            如有疑问请联系客服
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    color: '#666',
  },
  value: {
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    paddingVertical: 16,
  },
  currency: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
    marginRight: 4,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FF6B35',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  timerChip: {
    backgroundColor: '#FFF3E0',
  },
  paymentMethod: {
    marginTop: 4,
  },
  alipayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  alipayIcon: {
    backgroundColor: '#1677FF',
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  divider: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  payButton: {
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  payButtonContent: {
    height: 50,
  },
  payButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
  },
  tips: {
    marginTop: 24,
    alignItems: 'center',
  },
  tipsText: {
    color: '#999',
    lineHeight: 20,
  },
});
