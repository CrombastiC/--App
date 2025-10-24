import { createDish, getProductInfo } from '@/services/order.service';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Divider, Icon, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// 分类数据类型
interface Category {
  classifyId: string;
  classifyName: string;
}

export default function CreateOrderScreen() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryDrawerVisible, setCategoryDrawerVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishName, setDishName] = useState('');
 const [dishPrice, setDishPrice] = useState('');
  const [visible, setVisible] = useState(false);
  // 加载商品数据
  useEffect(() => {
    loadProducts();
  }, []);
  // 隐藏对话框
  const hideDialog = () => setVisible(false);
  const loadProducts = async () => {
    try {
      const [isError, data] = await getProductInfo();

      if (!isError && data) {
        const responseData = data as any;

        if (responseData.code === 0 && responseData.data) {
          const categoryData = responseData.data;
          console.log('商品数据加载成功:', categoryData);
          
          // 提取分类列表
          if (Array.isArray(categoryData)) {
            setCategories(categoryData);
          }
        }
      }
    } catch (error) {
      console.error('加载商品数据失败:', error);
    }
  };

  // 打开分类选择器
  const openCategoryDrawer = () => {
    setCategoryDrawerVisible(true);
  };

  // 关闭分类选择器
  const closeCategoryDrawer = () => {
    setCategoryDrawerVisible(false);
  };

  // 选择分类
  const selectCategory = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryName);
    closeCategoryDrawer();
  };

  // 提交订单
  const handleSubmit = async () => {
    if (!selectedCategory) {
      console.log('请选择分类');
      return;
    }
    if (!dishName.trim()) {
      console.log('请输入菜品名称');
      return;
    }
    
    //传参为分类id，菜品名称，菜品价格
    console.log('提交订单:', {
      classifyId: selectedCategoryId,
      foodName: dishName.trim(),
      foodPrice: dishPrice,
    });
    // TODO: 调用提交订单的 API
    const [isError, data] =await createDish({
      classifyId: selectedCategoryId,
      foodName: dishName.trim(),
      foodPrice: dishPrice,
    });
    if (!isError && data) {
      const responseData = data as any;
      if (responseData.code === 0) {
        setVisible(true);
        console.log('订单创建成功');
        //
        // 重置表单
        setSelectedCategory('');
        setSelectedCategoryId('');
        setDishName('');
        setDishPrice('');
      } else {
        console.log('订单创建失败:', responseData.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: '创建订单' }} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* 分类选择器 */}
          <Text style={styles.fieldLabel}>分类</Text>
          <TouchableOpacity style={styles.categorySelector} onPress={openCategoryDrawer}>
            <View style={styles.categorySelectorLeft}>
              <Text style={[styles.categoryValue, !selectedCategory && styles.placeholder]}>
                {selectedCategory || '请选择分类'}
              </Text>
            </View>
            <Icon source="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          {/* 菜品名称输入框 */}
          <Text style={styles.fieldLabel}>菜品名称</Text>
          <TextInput
            mode="outlined"
            value={dishName}
            onChangeText={setDishName}
            placeholder="请输入菜品名称"
            style={styles.input}
            outlineColor="#e0e0e0"
            activeOutlineColor="#FF7214"
          />
          {/* 菜品价格 */}
          <Text style={styles.fieldLabel}>菜品价格</Text>
          <TextInput
            mode="outlined"
            value={dishPrice}
            onChangeText={setDishPrice}
            keyboardType="numeric"
            placeholder="请输入菜品价格"
            style={styles.input}
            outlineColor="#e0e0e0"
            activeOutlineColor="#FF7214"
          />


          {/* 提交按钮 */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            buttonColor="#FF7214"
            contentStyle={styles.submitButtonContent}
          >
            提交订单
          </Button>
        </View>
      </ScrollView>

      {/* 底部抽屉 */}
      <Portal>
        <Modal
          visible={categoryDrawerVisible}
          onDismiss={closeCategoryDrawer}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.drawerContainer}>
            {/* 抽屉标题 */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>选择分类</Text>
              <TouchableOpacity onPress={closeCategoryDrawer}>
                <Icon source="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Divider />

            {/* 分类列表 */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.classifyId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => selectCategory(item.classifyId, item.classifyName)}
                >
                  <Text style={styles.categoryItemText}>{item.classifyName}</Text>
                  {selectedCategory === item.classifyName && (
                    <Icon source="check" size={24} color="#FF7214" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <Divider />}
            />
          </View>
        </Modal>
      </Portal>
      {/* 成功提示 */}
      <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>订单创建成功</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">订单创建成功</Text>
        </Dialog.Content>
      </Dialog>
    </Portal>
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
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 48,
  },
  categorySelectorLeft: {
    flex: 1,
  },
  categoryValue: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  submitButtonContent: {
    height: 48,
  },
  modalContent: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    margin: 0,
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
});
