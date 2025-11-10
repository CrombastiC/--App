import { userService } from "@/services";
import { pointsService } from "@/services/points.service";
import { formatDateTime } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  avatar?: string;
  balance?: number;
  integral?: number;
  couponCount?: number;
}
export default function PointPageScreen() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    // 页面加载时获取积分收支记录
    getPointRecords();
    loadUserInfo();
  }, []);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const loadUserInfo = async () => {
    try {
      // 从API获取用户信息
      const [error, result] = await userService.getProfile();
      if (error) {
        console.error('Failed to load user info:', error);
        return;
      }

      // result 是包含 code 和 data 的对象，真正的用户数据在 result.data 中
      const data = (result as any)?.data;
      if (data) {
        const user = data as UserInfo;
        setUserInfo(user);

        
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const getPointRecords = async () => {
    // 调用服务获取积分收支记录
    const [error, result] = await pointsService.getPointsList();
    if (error) {
      console.error('获取积分收支记录失败:', error);
      return;
    }
    const data = (result as any)?.data;
    setRecords(data);
  };
  const renderRecord = ({ item }: { item: any }) => {
    return (
      <View style={styles.recordItem}>
        <View>
          <Text style={styles.recordRemark}>{item.remark}</Text>
          <Text style={styles.recordDate}>{formatDateTime(item.createdAt)}</Text>
        </View>
        <View>
          <Text style={{ color: item.isGet ? 'green' : 'red', paddingHorizontal: 10 }}>{item.isGet ? `+${item.integral}` : `-${item.integral}`}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.pointContainer}>
        <Text style={styles.pointValue}>{userInfo?.integral || 0}</Text>
        <Text style={styles.pointLabel}>当前积分</Text>
      </View>
      <Text style={{ fontWeight: "bold", marginTop: 20, paddingHorizontal: 10, marginBottom: 10 }}>积分收支记录</Text>
      <FlatList
        style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' }}
        data={records}
        renderItem={renderRecord}
      >

      </FlatList>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(245, 247, 247)',
    padding: 16,

  },
  pointContainer: {
    marginTop: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 10,
  },
  pointValue: {
    fontSize: 48,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pointLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  recordItem: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgb(255, 255, 255)',

  },
  recordRemark: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 10,
  },
})
