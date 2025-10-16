import iconsData from '@/json/MaterialCommunityIcons.json'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Icon, Searchbar, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function IconScreen() {
  // 获取所有图标名称
  const allIcons = Object.keys(iconsData)
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤图标
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIcons
    }
    return allIcons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, allIcons])

  return (
    <SafeAreaView style={styles.container}>
      {/* 搜索框 */}
      <Searchbar
        placeholder="搜索图标..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* 图标总数 */}
      <Text style={styles.countText}>
        共 {filteredIcons.length} 个图标
      </Text>

      {/* 图标列表 */}
      <FlatList
        data={filteredIcons}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.iconRow}>
            {/* 左边：图标名称 */}
            <Text style={styles.iconName} numberOfLines={1}>
              {item}
            </Text>
            
            {/* 右边：图标渲染效果 */}
            <Icon source={item} size={24} color="#666" />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        // 启用性能优化
        removeClippedSubviews={true}//移除屏幕外的子视图以提升性能
        maxToRenderPerBatch={20}//每批渲染的最大项目数
        updateCellsBatchingPeriod={50}//更新单元格批处理周期
        initialNumToRender={20}//初始渲染的项目数
        windowSize={10}//窗口大小
        getItemLayout={(data, index) => ({
          length: 56,
          offset: 56 * index,
          index,
        })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 16,
    elevation: 2,// 阴影
  },
  countText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: '#666',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 56,
  },
  iconName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 16,
  },
})
