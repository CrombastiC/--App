import { tokenManager } from "@/services";
import Barcode from "@kichiyaki/react-native-barcode-generator";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Card, Icon } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

export default function MemberCodeScreen() {
  const [accountBalance, setAccountBalance] = useState<number>(0);
  // 生成随机会员码
  const [memberCode, setMemberCode] = useState("");

  useEffect(() => {
    // 生成20位随机数字会员码（分段生成避免数字溢出）
    const part1 = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const part2 = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const part3 = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const part4 = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const randomCode = part1 + part2 + part3 + part4;
    setMemberCode(randomCode);
  }, []);

  const loadBalance = async () => {
    // 从 userInfo 中解构取值（来自登录接口的 data.user）
    const userInfo = await tokenManager.getUserInfo();
    if (userInfo) {
      setAccountBalance(userInfo.balance || 0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBalance();
    }, [])
  );


  return <View style={styles.container} >
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        {/* 头部标题 */}
        <View style={styles.cardheader}>
          <Icon source="line-scan" size={24} color="#666" />
          <Text style={styles.headerText}>向商家展示支付会员码</Text>
        </View>

        {/* 条码区域 */}
        <View style={styles.cardContent}>
          {memberCode && (
            <>
              <View style={styles.barcodeContainer}>
                <Barcode 
                  value={memberCode} 
                  format="CODE128"
                  width={2}
                  height={60}
                  text={memberCode}
                  textStyle={styles.barcodeText}
                  lineColor="#000"
                />
              </View>

              {/* 二维码区域 */}
              <View style={styles.qrcodeContainer}>
                <QRCode 
                  value={memberCode}
                  size={150}
                  backgroundColor="white"
                />
              </View>
            </>
          )}
        </View>

        {/* 底部余额显示 */}
        <View style={styles.cardFooter}>
          <Text style={styles.balanceLabel}>账户余额</Text>
          <Text style={styles.balanceAmount}>¥{accountBalance.toFixed(2)}</Text>
        </View>
      </Card.Content>
    </Card>
  </View>;
}

const styles =StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: 340,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "white",
  },
  cardheader:{
    flexDirection:"row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingVertical: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    gap: 8,
  },
  headerText: {
    fontSize: 14,
    color: "#666",
  },
  cardContent:{
    alignItems: "center",
    paddingVertical: 20,
  },
  barcodeContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  barcodeText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  qrcodeContainer: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  cardFooter:{
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    borderTopColor: "#eee",
    borderTopWidth: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
});
