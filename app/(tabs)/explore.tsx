import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Badge,
  Card,
  Chip,
  Divider,
  IconButton,
  Searchbar,
  Surface,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '@/stores/profile-store';

export default function ExploreScreen() {
  const profiles = useProfileStore((state) => state.profiles);
  const [query, setQuery] = useState('');

  const filteredProfiles = useMemo(() => {
    if (!query.trim()) {
      return profiles;
    }
    const lower = query.toLowerCase();
    return profiles.filter((item) =>
      item.name.toLowerCase().includes(lower) ||
      item.role.toLowerCase().includes(lower) ||
      (item.notes ?? '').toLowerCase().includes(lower)
    );
  }, [profiles, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header mode="small">
        <Appbar.Content title="人员列表" subtitle="来源于个人信息表单" />
      </Appbar.Header>
      <Searchbar
        placeholder="搜索姓名或职位"
        value={query}
        onChangeText={setQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />

      {profiles.length === 0 ? (
        <Card style={styles.emptyCard} mode="outlined">
          <Card.Title title="暂无数据" subtitle="请在前一个标签页提交表单" />
        </Card>
      ) : (
        <FlatList
          data={filteredProfiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Surface style={styles.card} elevation={1}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Avatar.Text
                    size={40}
                    label={item.name.slice(0, 1).toUpperCase()}
                    style={styles.avatar}
                  />
                  <View style={styles.titleContent}>
                    <Text variant="titleMedium">{item.name}</Text>
                    <Text variant="bodySmall" style={styles.subtitle}>
                      {item.role}
                      {item.age ? ` · ${item.age} 岁` : ''}
                    </Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" disabled />
              </View>

              <View style={styles.badgeRow}>
                <Chip compact icon="account">
                  {item.gender === 'male' ? '男' : item.gender === 'female' ? '女' : '其他'}
                </Chip>
                {item.notes ? (
                  <Chip compact icon="note-text-outline" style={styles.noteChip}>
                    备注
                  </Chip>
                ) : null}
                <Badge size={24} style={styles.indexBadge}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Badge>
              </View>

              <Divider style={styles.divider} />

              <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
                {item.notes || '暂无备注信息'}
              </Text>
            </Surface>
          )}
          ListEmptyComponent={() => (
            <Card style={styles.emptyCard} mode="outlined">
              <Card.Title title="无匹配结果" subtitle="尝试调整搜索关键字" />
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'white',
  },
  separator: {
    height: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    backgroundColor: '#4f5b62',
  },
  titleContent: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
    color: '#607d8b',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  noteChip: {
    backgroundColor: '#e8f5e9',
  },
  indexBadge: {
    marginLeft: 'auto',
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
  },
  divider: {
    marginVertical: 12,
  },
  description: {
    color: '#455a64',
  },
});
