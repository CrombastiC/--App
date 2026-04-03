import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PeopleSelect() {
  const router = useRouter();
  const [selectedPeople, setSelectedPeople] = useState<number>(1);

  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleStartOrder = () => {
    // 开始点餐，跳转到点餐页面
    router.push('/(tabs)/order');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>请选择就餐人数</Text>
      
      <View style={styles.gridContainer}>
        {peopleOptions.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.optionButton,
              selectedPeople === num && styles.selectedButton
            ]}
            onPress={() => setSelectedPeople(num)}
          >
            <Text style={[
              styles.optionText,
              selectedPeople === num && styles.selectedText
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStartOrder}
      >
        <Text style={styles.startButtonText}>开始点餐</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '22.5%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedButton: {
    backgroundColor: '#FF6B35',
  },
  optionText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  startButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
