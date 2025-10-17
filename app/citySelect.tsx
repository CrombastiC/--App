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
  const sectionListRef = useRef<SectionList>(null);

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
        
        // 匹配拼音
        const cityPinyin = pinyin(city.name, { toneType: 'none' }).toLowerCase();
        if (cityPinyin.includes(query)) {
          return true;
        }
        
        // 匹配拼音首字母
        const firstLetters = pinyin(city.name, { pattern: 'first', toneType: 'none' }).toLowerCase();
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
    return cityData.map(section => section.title);
  }, [cityData, searchQuery]);

  // 获取当前位置
  useEffect(() => {
    console.log('Starting location request...');
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    
    (async () => {
      try {
        // 先尝试从存储中加载已保存的城市
        const savedCity = await StorageUtils.getString(STORAGE_KEYS.SELECTED_CITY);
        if (savedCity && !cancelled) {
          setCurrentCity(savedCity);
          return; // 如果有保存的城市，就不进行定位
        }

        // 设置 10 秒超时
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('定位超时'));
          }, 10000);
        });

        // 请求位置权限
        console.log('Requesting permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Permission status:', status);
        
        if (status !== 'granted') {
          if (!cancelled) {
            setCurrentCity('定位权限未授予');
            setLocationError(true);
          }
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }

        // 获取当前位置（使用 Promise.race 实现超时）
        console.log('Getting location...');
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          timeoutPromise
        ]);
        
        if (cancelled) return;
        console.log('Location:', location.coords);

        // 反向地理编码（将经纬度转换为地址）
        console.log('Reverse geocoding...');
        const [address] = await Promise.race([
          Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }),
          timeoutPromise
        ]);
        
        if (cancelled) return;
        console.log('Address:', address);

        // 清除超时
        if (timeoutId) clearTimeout(timeoutId);

        // 提取城市名称
        const cityName = address.city || address.region || address.subregion || '未知城市';
        console.log('City name:', cityName);
        setCurrentCity(cityName);
        
      } catch (error) {
        console.error('定位失败:', error);
        if (timeoutId) clearTimeout(timeoutId);
        if (!cancelled) {
          setCurrentCity('定位失败');
          setLocationError(true);
        }
      }
    })();

    // 清理函数
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 点击字母索引跳转到对应区域
  const scrollToSection = (sectionIndex: number) => {
    sectionListRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      animated: true,
    });
  };

  // 选择城市
  const handleSelectCity = async (cityName: string) => {
    try {
      // 保存选中的城市到存储
      await StorageUtils.setString(STORAGE_KEYS.SELECTED_CITY, cityName);
      // 返回上一页
      router.back();
    } catch (error) {
      console.error('保存城市失败:', error);
      // 即使保存失败，也返回上一页
      router.back();
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
      <TouchableOpacity 
        style={styles.currentCity}
        onPress={() => handleSelectCity(currentCity)}
        disabled={locationError}
      >
        <Icon source="map-marker-outline" size={20} color="#FF7214" />
        <Text style={styles.currentCityText}>当前定位城市: </Text>
        <Text style={[
          styles.currentCityName,
          locationError && styles.currentCityError
        ]}>
          {currentCity}
        </Text>
        {!locationError && (
          <View style={styles.checkIconContainer}>
            <Icon source="check-circle" size={16} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>
      <Divider />

      {/* 城市列表 */}
      <SectionList
        ref={sectionListRef}
        sections={filteredCityData}
        keyExtractor={(item, index) => item.name + index}
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
  checkIconContainer: {
    marginLeft: 8,
  },
  cityItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingVertical: 6,
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
