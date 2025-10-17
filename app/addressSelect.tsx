import { STORAGE_KEYS, StorageUtils } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Dialog, Icon, Portal, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// 门店数据类型
interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  status: string;
  hours: string;
  phone: string;
}

// 模拟门店数据
const storeList: Store[] = [
  {
    id: '1',
    name: '黛西餐厅（中海大厦店）',
    address: '上海市静安区江场三路134号',
    distance: '0.4km',
    status: '营业中',
    hours: '10:00-22:00',
    phone: '18339658260',
  },
  {
    id: '2',
    name: '黛西餐厅（中海大厦店）',
    address: '上海市静安区江场三路134号',
    distance: '0.8km',
    status: '营业中',
    hours: '10:00-22:00',
    phone: '18878006788',
  },
  {
    id: '3',
    name: '黛西餐厅（中海大厦店）',
    address: '上海市静安区江场三路134号',
    distance: '1.0km',
    status: '营业中',
    hours: '10:00-22:00',
    phone: '18878006788',
  },
  {
    id: '4',
    name: '黛西餐厅（中海大厦店）',
    address: '上海市静安区江场三路134号',
    distance: '1.2km',
    status: '营业中',
    hours: '10:00-22:00',
    phone: '18878006788',
  },
];

export default function AddressSelectScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneDialogVisible, setPhoneDialogVisible] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [currentCity, setCurrentCity] = useState('上海市');

  // 根据 type 参数设置标题
  const title = type === 'dine-in' ? '选择堂食门店' : '选择外送门店';

  // 加载保存的城市
  useEffect(() => {
    loadCity();
  }, []);

  // 每次页面获得焦点时重新加载城市
  useFocusEffect(() => {
    loadCity();
  });

  // 加载城市函数
  const loadCity = async () => {
    try {
      const savedCity = await StorageUtils.getString(STORAGE_KEYS.SELECTED_CITY);
      if (savedCity) {
        setCurrentCity(savedCity);
      }
    } catch (error) {
      console.error('加载城市失败:', error);
    }
  };

  // 显示电话对话框
  const showPhoneDialog = (phone: string) => {
    setSelectedPhone(phone);
    setPhoneDialogVisible(true);
  };

  // 隐藏电话对话框
  const hidePhoneDialog = () => {
    setPhoneDialogVisible(false);
  };

  // 拨打电话
  const makePhoneCall = () => {
    Linking.openURL(`tel:${selectedPhone}`);
    hidePhoneDialog();
  };

  return (
    <>
      <Stack.Screen options={{ title }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* 地址标题及搜索框 */}
        <View style={styles.headerContainer}>
          {/* 城市选择按钮 */}
          <TouchableOpacity style={styles.citySelector} onPress={()=>router.push('/citySelect')}>
            <Icon source="map-marker-outline" size={20} color="#666" />
            <Text style={styles.cityText}>{currentCity}</Text>
            <Icon source="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          {/* 搜索框 */}
          <Searchbar
            placeholder="搜索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#999"
          />
        </View>

        {/* 地址卡片列表 */}
        <FlatList
          data={storeList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.storeCard} mode="elevated">
              <Card.Content style={styles.cardContent}>
                {/* 左侧信息 */}
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{item.name}</Text>
                  <View style={styles.storeDetails}>
                    <Text style={styles.distance}>{item.distance}</Text>
                    <Text style={styles.address}>{item.address}</Text>
                  </View>
                  <View style={styles.storeStatus}>
                    <Text style={styles.statusText}>{item.status}</Text>
                    <Text style={styles.hoursText}>{item.hours}</Text>
                  </View>
                </View>

                {/* 右侧操作区 */}
                <View style={styles.rightActions}>
                  <Text style={styles.orderButton}>去下单</Text>
                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => showPhoneDialog(item.phone)}
                    >
                      <Icon source="phone" size={20} color="#FF7214" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => console.log('查看地图')}
                    >
                      <Icon source="map-marker" size={20} color="#FF7214" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        />

        {/* 电话对话框 */}
        <Portal>
          <Dialog 
            visible={phoneDialogVisible} 
            onDismiss={hidePhoneDialog}
            style={styles.phoneDialog}
          >
            <Dialog.Content style={styles.dialogContent}>
              <Text style={styles.phoneNumber}>{selectedPhone}</Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button 
                onPress={hidePhoneDialog}
                textColor="#666"
                style={styles.dialogButton}
              >
                取消
              </Button>
              <Button 
                onPress={makePhoneCall}
                textColor="#FF7214"
                style={styles.dialogButton}
              >
                拨打
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 4,
    marginRight: 2,
    fontWeight: '500',
  },
  searchBar: {
    width: 90,
    marginLeft: 12,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
    minHeight: 0,
    paddingVertical: 0,
  },
  listContent: {
    padding: 16,
  },
  storeCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  storeInfo: {
    flex: 1,
    borderRightColor: '#f0f0f0',
    borderRightWidth: 1,
    paddingRight: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distance: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  address: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  storeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#FF7214',
    backgroundColor: 'rgba(254, 241, 232, 1)',
    marginRight: 8,
  },
  hoursText: {
    fontSize: 12,
    color: '#999',
  },
  rightActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
  },
  orderButton: {
    fontSize: 14,
    color: '#FF7214',
    fontWeight: '500',
    marginBottom: 8,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneDialog: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 40,
  },
  dialogContent: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
  dialogActions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    justifyContent: 'space-around',
  },
  dialogButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
