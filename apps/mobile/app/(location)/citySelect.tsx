import PCAA from '@province-city-china/data';
import { router } from 'expo-router';
import { pinyin } from 'pinyin-pro';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Icon, Searchbar, Text } from 'react-native-paper';

import { useLocationStore } from '@/stores/location-store';

// 城市数据类型
interface City {
  name: string;
  code: string;
}

interface CitySection {
  title: string;
  data: City[];
}

// 获取拼音首字母
const getFirstLetter = (str: string): string => {
  try {
    const firstChar = pinyin(str.charAt(0), {
      pattern: 'first',
      toneType: 'none',
    }).toUpperCase();
    return /^[A-Z]$/.test(firstChar) ? firstChar : '#';
  } catch {
    return '#';
  }
};

// 转换数据格式
const convertCityData = (): CitySection[] => {
  const cityMap: { [key: string]: City[] } = {};

  const cities = PCAA.filter((item: any) => {
    if (item.city !== 0 && item.area === 0 && item.town === 0) return true;
    if (
      item.code.endsWith('0000') &&
      item.code.length === 6 &&
      ['110000', '120000', '310000', '500000'].includes(item.code)
    )
      return true;
    return false;
  });

  cities.forEach((city: any) => {
    const firstLetter = getFirstLetter(city.name);
    if (!cityMap[firstLetter]) cityMap[firstLetter] = [];
    cityMap[firstLetter].push({ name: city.name, code: city.code });
  });

  return Object.keys(cityMap)
    .sort()
    .map((letter) => ({
      title: letter,
      data: cityMap[letter].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
    }));
};

export default function CitySelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const sectionListRef = useRef<SectionList>(null);

  const city = useLocationStore((s) => s.city);
  const isLocating = useLocationStore((s) => s.isLocating);
  const error = useLocationStore((s) => s.error);
  const initialized = useLocationStore((s) => s.initialized);
  const loadFromCache = useLocationStore((s) => s.loadFromCache);
  const locate = useLocationStore((s) => s.locate);
  const setCity = useLocationStore((s) => s.setCity);
  const refresh = useLocationStore((s) => s.refresh);

  const SECTION_HEADER_HEIGHT = 32;
  const CITY_ITEM_HEIGHT = 48;

  // 初始化：先读缓存，缓存无效则定位
  useEffect(() => {
    (async () => {
      const cached = await loadFromCache();
      if (!cached) {
        await locate();
      }
    })();
  }, [loadFromCache, locate]);

  // 城市数据（缓存）
  const cityData = useMemo(() => convertCityData(), []);

  // 搜索过滤
  const filteredCityData = useMemo(() => {
    if (!searchQuery.trim()) return cityData;

    const query = searchQuery.toLowerCase().trim();
    const filtered: CitySection[] = [];

    cityData.forEach((section) => {
      const matchedCities = section.data.filter((city) => {
        if (city.name.toLowerCase().includes(query)) return true;
        const cityPinyin = pinyin(city.name, { toneType: 'none' })
          .toLowerCase()
          .replace(/\s+/g, '');
        if (cityPinyin.includes(query)) return true;
        const firstLetters = pinyin(city.name, { pattern: 'first', toneType: 'none' })
          .toLowerCase()
          .replace(/\s+/g, '');
        if (firstLetters.includes(query)) return true;
        return false;
      });

      if (matchedCities.length > 0) {
        filtered.push({ title: section.title, data: matchedCities });
      }
    });

    return filtered;
  }, [cityData, searchQuery]);

  // 字母索引
  const letterIndex = useMemo(() => {
    if (searchQuery.trim()) return [];
    return filteredCityData.map((section) => section.title);
  }, [filteredCityData, searchQuery]);

  // 分组偏移量
  const sectionOffsets = useMemo(() => {
    let offset = 0;
    return filteredCityData.map((section) => {
      const currentOffset = offset;
      offset += SECTION_HEADER_HEIGHT + section.data.length * CITY_ITEM_HEIGHT;
      return currentOffset;
    });
  }, [filteredCityData]);

  // 跳转分组
  const scrollToSection = (sectionIndex: number) => {
    const offset = sectionOffsets[sectionIndex];
    const responder = (
      sectionListRef.current as unknown as {
        getScrollResponder?: () => { scrollTo: (params: { y: number; animated: boolean }) => void };
      }
    )?.getScrollResponder?.();
    if (responder && offset !== undefined) {
      responder.scrollTo({ y: offset, animated: true });
    }
  };

  // 选择城市
  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    router.back();
  };

  // 当前城市是否可用
  const isCityUsable = !error && !isLocating && initialized;

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
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
      </View>

      {/* 当前定位城市 */}
      <View>
        <TouchableOpacity
          style={styles.currentCity}
          onPress={() => isCityUsable && handleSelectCity(city)}
          disabled={!isCityUsable}
        >
          <Icon source="map-marker-outline" size={20} color="#FF7214" />
          <View style={styles.cityInfoContainer}>
            <Text style={styles.currentCityText}>当前定位城市: </Text>
            <Text style={[styles.currentCityName, error && styles.currentCityError]}>{city}</Text>
          </View>
          {isCityUsable && (
            <View style={styles.checkIconContainer}>
              <Icon source="check-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </TouchableOpacity>

        {/* 重新定位按钮 */}
        {error && (
          <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
            <Icon source="refresh" size={16} color="#FF7214" />
            <Text style={styles.refreshButtonText}>重新定位</Text>
          </TouchableOpacity>
        )}
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
          <TouchableOpacity style={styles.cityItem} onPress={() => handleSelectCity(item.name)}>
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
  checkIconContainer: {
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#FFF3E0',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  refreshButtonText: {
    fontSize: 13,
    color: '#FF7214',
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
