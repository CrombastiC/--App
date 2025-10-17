import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 充值选项数据
const topUpOptions = [
  { id: 1, amount: 500, bonus: 50 },
  { id: 2, amount: 1000, bonus: 100 },
  { id: 3, amount: 2000, bonus: 300 },
  { id: 4, amount: 3000, bonus: 400 },
];

export default function TopUpScreen() {
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1);
  const [hasAgreed, setHasAgreed] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 顶部切换组件 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'topup' && styles.tabItemActive]}
          onPress={() => setActiveTab('topup')}
        >
          <Text style={[styles.tabText, activeTab === 'topup' && styles.tabTextActive]}>
            充值
          </Text>
          {activeTab === 'topup' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            充值记录
          </Text>
          {activeTab === 'history' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
      
      <Divider />

      {/* 内容区域 */}
      <View style={styles.content}>
        {activeTab === 'topup' ? (
          <>
            <View style={styles.contentContainer}>
              {/* 账户余额卡片 */}
              <View style={styles.balanceCard}>
                <Text style={styles.balanceAmount}>¥1200.0</Text>
                <Text style={styles.balanceLabel}>账户余额</Text>
              </View>
              
              {/* 充值金额标题 */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>请选择充值金额</Text>
              </View>

              {/* 充值选项网格 */}
              <View style={styles.optionsGrid}>
                {topUpOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      selectedAmount === option.id && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedAmount(option.id)}
                  >
                    <View style={styles.optionContent}>
                      <View>
                        <Text style={[
                          styles.optionAmount,
                          selectedAmount === option.id && styles.optionAmountSelected,
                        ]}>
                          充值{option.amount}元
                        </Text>
                        <Text style={styles.optionBonus}>送{option.bonus}元</Text>
                      </View>
                      <View style={[
                        styles.radioCircle,
                        selectedAmount === option.id && styles.radioCircleSelected,
                      ]}>
                        {selectedAmount === option.id && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {/* 充值须知 */}
              <View style={styles.noticeCard}>
                <View style={styles.noticeHeader}>
                  <Icon source="alert-circle-outline" size={18} color="#FF7214" />
                  <Text style={styles.noticeTitle}>充值须知</Text>
                </View>
                <View style={styles.noticeContent}>
                  <Text style={styles.noticeItem}>1. 您本次充值的预付卡余额有效期为3年，请在有效期内消费。</Text>
                  <Text style={styles.noticeItem}>2. 本卡不记名、不挂失、不兑换，仅限本人使用。</Text>
                  <Text style={styles.noticeItem}>3. 充值后概不退款，如有疑问，可联系商家。</Text>
                </View>
              </View>
            </View>
            {/* 底部固定区域 */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.agreementRow}
                onPress={() => setHasAgreed((prev) => !prev)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.agreementIndicator,
                    hasAgreed && styles.agreementIndicatorActive,
                  ]}
                >
                  {hasAgreed && <View style={styles.agreementIndicatorDot} />}
                </View>
                <Text style={styles.agreementText}>
                  我已阅读并同意
                  <Text style={styles.agreementLink}>充值协议</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !hasAgreed && styles.confirmButtonDisabled,
                ]}
                activeOpacity={0.8}
                disabled={!hasAgreed}
              >
                <Text style={styles.confirmButtonText}>确认充值</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>充值记录</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  tabItemActive: {
    // 激活状态
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF7214',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 3,
    backgroundColor: '#FF7214',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7F7',
  },
  topContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
  },
  contentText: {
    fontSize: 16,
    color: '#999',
  },
  balanceCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '300',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 10,
  },
  sectionHeader: {
    width: '90%',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionsGrid: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 10,
    minHeight: 64,
  },
  optionCardSelected: {
    borderColor: '#FF7214',
    backgroundColor: '#FFF8F5',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7214',
    marginBottom: 4,
  },
  optionAmountSelected: {
    color: '#FF7214',
  },
  optionBonus: {
    fontSize: 13,
    color: '#999',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#FF7214',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7214',
  },
  noticeCard: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFF8F1',
    borderColor: '#FFD7BD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeTitle: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  noticeContent: {},
  noticeItem: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomSection: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agreementIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#FDBF94',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  agreementIndicatorActive: {
    borderColor: '#FF7214',
  },
  agreementIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7214',
  },
  agreementText: {
    fontSize: 13,
    color: '#666',
  },
  agreementLink: {
    color: '#FF7214',
  },
  confirmButton: {
    backgroundColor: '#FF7214',
    borderRadius: 22,
  paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonDisabled: {
    backgroundColor: '#FFCDA6',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
