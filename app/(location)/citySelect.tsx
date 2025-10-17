import { STORAGE_KEYS, StorageUtils } from '@/utils/storage';
import PCAA from '@province-city-china/data';
import * as Location from 'expo-location';
import { router } from "expo-router";
import { pinyin } from 'pinyin-pro';
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Divider, Icon, Searchbar, Text } from "react-native-paper";

// 城市数据类型
interface City {
  name: string;
  code: string;
}

interface CitySection {
  title: string;
  data: City[];
}

// 获取拼音首字母（使用 pinyin-pro）
const getFirstLetter = (str: string): string => {
  try {
    const firstChar = pinyin(str.charAt(0), { 
      pattern: 'first',
      toneType: 'none' 
    }).toUpperCase();
    
    // 如果是字母，返回；否则返回 #
    return /^[A-Z]$/.test(firstChar) ? firstChar : '#';
  } catch {
    return '#';
  }
};

// 转换数据格式
const convertCityData = (): CitySection[] => {
  const cityMap: { [key: string]: City[] } = {};
  
  console.log('PCAA is array:', Array.isArray(PCAA));
  console.log('PCAA length:', PCAA.length);
  console.log('First items:', PCAA.slice(0, 3));
  
  // 过滤出所有市级数据（city !== 0 且 area === 0 且 town === 0）
  // 或者直辖市（city === 0 且 area === 0 但以00结尾的省级）
  const cities = PCAA.filter((item: any) => {
    // 市级城市: city !== 0 且 area === 0
    if (item.city !== 0 && item.area === 0 && item.town === 0) {
      return true;
    }
    // 直辖市: code 以 0000 结尾且长度为 6
    if (item.code.endsWith('0000') && item.code.length === 6 && 
        ['110000', '120000', '310000', '500000'].includes(item.code)) {
      return true;
    }
    return false;
  });
  
  console.log('Filtered cities count:', cities.length);
  console.log('Sample cities:', cities.slice(0, 5));
  
  // 将城市按首字母分组
  cities.forEach((city: any) => {
    const firstLetter = getFirstLetter(city.name);
    
    if (!cityMap[firstLetter]) {
      cityMap[firstLetter] = [];
    }
    
    cityMap[firstLetter].push({
      name: city.name,
      code: city.code,
    });
  });
  
  // 转换为 Section 格式并排序
  const sections: CitySection[] = Object.keys(cityMap)
    .sort()
    .map(letter => ({
      title: letter,
      data: cityMap[letter].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
    }));
  
  console.log('Converted sections:', sections.length);
  console.log('First 2 sections:', sections.slice(0, 2));
  
  return sections;
};


export default function CitySelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCity, setCurrentCity] = useState('定位中...');
  const [locationError, setLocationError] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false); // 标记是否来自缓存
  const [isLocating, setIsLocating] = useState(false); // 标记是否正在定位
  const sectionListRef = useRef<SectionList>(null);

  const SECTION_HEADER_HEIGHT = 32;
  const CITY_ITEM_HEIGHT = 48;

  // 使用 useMemo 缓存转换后的城市数据
  const cityData = useMemo(() => {
    const data = convertCityData();
    console.log('City data length:', data.length);
    return data;
  }, []);
  
  // 根据搜索关键字过滤城市数据
  const filteredCityData = useMemo(() => {
    if (!searchQuery.trim()) {
      return cityData;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered: CitySection[] = [];
    
    cityData.forEach(section => {
      const matchedCities = section.data.filter(city => {
        // 匹配城市名称
        if (city.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // 匹配拼音（去除空格）
        const cityPinyin = pinyin(city.name, { toneType: 'none' }).toLowerCase().replace(/\s+/g, '');
        if (cityPinyin.includes(query)) {
          return true;
        }
        
        // 匹配拼音首字母
        const firstLetters = pinyin(city.name, { pattern: 'first', toneType: 'none' }).toLowerCase().replace(/\s+/g, '');
        if (firstLetters.includes(query)) {
          return true;
        }
        
        return false;
      });
      
      if (matchedCities.length > 0) {
        filtered.push({
          title: section.title,
          data: matchedCities,
        });
      }
    });
    
    return filtered;
  }, [cityData, searchQuery]);
  
  // 生成字母索引（只在没有搜索时显示）
  const letterIndex = useMemo(() => {
    if (searchQuery.trim()) {
      return [];
    }
    // 使用 filteredCityData 而不是 cityData，确保索引与实际渲染的数据一致
    return filteredCityData.map(section => section.title);
  }, [filteredCityData, searchQuery]);

  // 计算每个分组头部在列表中的偏移量
  const sectionOffsets = useMemo(() => {
    let offset = 0;
    return filteredCityData.map(section => {
      const currentOffset = offset;
      offset += SECTION_HEADER_HEIGHT + section.data.length * CITY_ITEM_HEIGHT;
      return currentOffset;
    });
  }, [filteredCityData, SECTION_HEADER_HEIGHT, CITY_ITEM_HEIGHT]);

  // 获取当前位置
  useEffect(() => {
    console.log('🚀 [定位] 开始定位流程...');
    let cancelled = false;
    
    (async () => {
      try {
        // 先尝试从存储中加载已保存的城市
        const savedCity = await StorageUtils.getString(STORAGE_KEYS.SELECTED_CITY);
        if (savedCity && !cancelled) {
          console.log('💾 [缓存] 从本地存储加载城市:', savedCity);
          setCurrentCity(savedCity);
          setIsFromCache(true);
          setIsLocating(false);
          return; // 如果有保存的城市，就不进行定位
        }

        console.log('📍 [定位] 无缓存，开始真实定位...');
        setIsLocating(true);
        setIsFromCache(false);

        // 请求位置权限
        console.log('🔐 [权限] 请求定位权限...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('🔐 [权限] 权限状态:', status);
        
        if (status !== 'granted') {
          if (!cancelled) {
            console.log('❌ [权限] 定位权限被拒绝');
            setCurrentCity('定位权限未授予');
            setLocationError(true);
            setIsLocating(false);
          }
          return;
        }

        // 获取当前位置（设置 30 秒超时）
        console.log('📡 [GPS] 正在获取位置坐标...');
        const locationTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('获取位置超时')), 30000);
        });
        
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          locationTimeout
        ]);
        
        if (cancelled) return;
        console.log('📍 [GPS] 获取到坐标:', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        });

        // 反向地理编码（设置 15 秒超时）
        console.log('🗺️ [地理编码] 正在转换坐标为地址...');
        const geocodeTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('地理编码超时')), 15000);
        });
        
        const [address] = await Promise.race([
          Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }),
          geocodeTimeout
        ]);
        
        if (cancelled) return;
        console.log('🏙️ [地理编码] 获取到地址信息:', address);

        // 提取城市名称
        const cityName = address.city || address.region || address.subregion || '未知城市';
        console.log('✅ [成功] 真实定位获取到城市:', cityName);
        setCurrentCity(cityName);
        setIsFromCache(false);
        setIsLocating(false);
        
      } catch (error) {
        console.error('❌ [失败] 定位失败:', error);
        if (!cancelled) {
          setCurrentCity('定位失败');
          setLocationError(true);
          setIsLocating(false);
        }
      }
    })();

    // 清理函数
    return () => {
      cancelled = true;
    };
  }, []);

  // 点击字母索引跳转到对应区域
  const scrollToSection = (sectionIndex: number) => {
    const offset = sectionOffsets[sectionIndex];
    const responder = (sectionListRef.current as unknown as { getScrollResponder?: () => { scrollTo: (params: { y: number; animated: boolean }) => void } })
      ?.getScrollResponder?.();

    if (responder && offset !== undefined) {
      responder.scrollTo({ y: offset, animated: true });
    }
  };

  // 选择城市
  const handleSelectCity = async (cityName: string) => {
    try {
      // 保存选中的城市到存储
      await StorageUtils.setString(STORAGE_KEYS.SELECTED_CITY, cityName);
      console.log('💾 [保存] 城市已保存到本地:', cityName);
      // 返回上一页
      router.back();
    } catch (error) {
      console.error('❌ [保存] 保存城市失败:', error);
      // 即使保存失败，也返回上一页
      router.back();
    }
  };

  // 清除缓存（用于测试）
  const handleClearCache = async () => {
    try {
      await StorageUtils.delete(STORAGE_KEYS.SELECTED_CITY);
      console.log('🗑️ [清除] 缓存已清除，将重新定位...');
      setCurrentCity('定位中...');
      setIsFromCache(false);
      setLocationError(false);
      setIsLocating(true);
      
      // 重新触发定位逻辑
      (async () => {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('定位超时')), 10000);
          });

          console.log('🔐 [权限] 请求定位权限...');
          const { status } = await Location.requestForegroundPermissionsAsync();
          console.log('🔐 [权限] 权限状态:', status);
          
          if (status !== 'granted') {
            console.log('❌ [权限] 定位权限被拒绝');
            setCurrentCity('定位权限未授予');
            setLocationError(true);
            setIsLocating(false);
            return;
          }

          console.log('📡 [GPS] 正在获取位置坐标...');
          const location = await Promise.race([
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            timeoutPromise
          ]);
          
          console.log('📍 [GPS] 获取到坐标:', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          console.log('🗺️ [地理编码] 正在转换坐标为地址...');
          const [address] = await Promise.race([
            Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }),
            timeoutPromise
          ]);
          
          console.log('🏙️ [地理编码] 获取到地址信息:', address);
          const cityName = address.city || address.region || address.subregion || '未知城市';
          console.log('✅ [成功] 真实定位获取到城市:', cityName);
          setCurrentCity(cityName);
          setIsFromCache(false);
          setIsLocating(false);
        } catch (error) {
          console.error('❌ [失败] 定位失败:', error);
          setCurrentCity('定位失败');
          setLocationError(true);
          setIsLocating(false);
        }
      })();
    } catch (error) {
      console.error('❌ [清除] 清除缓存失败:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="请输入城市名称"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#999"
        />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
      </View>

      {/* 当前城市 */}
      <View>
        <TouchableOpacity 
          style={styles.currentCity}
          onPress={() => handleSelectCity(currentCity)}
          disabled={locationError}
        >
          <Icon source="map-marker-outline" size={20} color="#FF7214" />
          <View style={styles.cityInfoContainer}>
            <Text style={styles.currentCityText}>当前定位城市: </Text>
            <Text style={[
              styles.currentCityName,
              locationError && styles.currentCityError
            ]}>
              {currentCity}
            </Text>
            {/* {isFromCache && !locationError && (
              <Text style={styles.cacheTag}>[已保存]</Text>
            )}
            {isLocating && (
              <Text style={styles.locatingTag}>[定位中...]</Text>
            )} */}
          </View>
          {!locationError && !isFromCache && !isLocating && (
            <View style={styles.checkIconContainer}>
              <Icon source="check-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </TouchableOpacity>
        
        {/* 调试按钮：清除缓存 */}
        {/* {isFromCache && (
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={handleClearCache}
          >
            <Icon source="delete-outline" size={16} color="#FF5722" />
            <Text style={styles.debugButtonText}>清除缓存并重新定位</Text>
          </TouchableOpacity>
        )} */}
      </View>
      <Divider />

      {/* 城市列表 */}
      <SectionList
        ref={sectionListRef}
        sections={filteredCityData}
        keyExtractor={(item, index) => item.code + item.name + index}
        initialNumToRender={30}
        maxToRenderPerBatch={30}
        windowSize={15}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cityItem}
            onPress={() => handleSelectCity(item.name)}
          >
            <Text style={styles.cityName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="magnify" size={48} color="#ccc" />
            <Text style={styles.emptyText}>未找到匹配的城市</Text>
          </View>
        }
      />

      {/* 右侧字母索引 */}
      <View style={styles.letterIndexContainer}>
        {letterIndex.map((letter, index) => (
          <TouchableOpacity
            key={letter}
            style={styles.letterIndexItem}
            onPress={() => scrollToSection(index)}
          >
            <Text style={styles.letterIndexText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
    minHeight: 0,
    paddingVertical: 0,
  },
  cancelButton: {
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#333',
  },
  currentCity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  cityInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  currentCityText: {
    fontSize: 14,
    color: '#666',
  },
  currentCityName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  currentCityError: {
    color: '#999',
    fontWeight: 'normal',
  },
  cacheTag: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  locatingTag: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  checkIconContainer: {
    marginLeft: 8,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#FFF3E0',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  debugButtonText: {
    fontSize: 13,
    color: '#FF5722',
    fontWeight: '500',
  },
  cityItem: {
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityName: {
    fontSize: 15,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    height: 32,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  letterIndexContainer: {
    position: 'absolute',
    right: 8,
    top: 100,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterIndexItem: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  letterIndexText: {
    fontSize: 12,
    color: '#FF7214',
    fontWeight: '500',
  },
});
