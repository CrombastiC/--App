import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>账户详情</Text>
        
        {/* 日期选择按钮 */}
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShow(true)}
        >
          <Text style={styles.dateLabel}>选择日期</Text>
          <Text style={styles.dateValue}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {/* 日期选择器 */}
        <DateTimePickerModal
          isVisible={show}
          mode="date"
          date={date}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          locale="zh_CN"
          confirmTextIOS="确定"
          cancelTextIOS="取消"
          minimumDate={new Date(1950, 0, 1)}
          maximumDate={new Date(2050, 11, 31)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 16,
    color: '#FF7214',
    fontWeight: '600',
  },
});
