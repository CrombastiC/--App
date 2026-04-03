import { Stack } from 'expo-router';

export default function LocationLayout() {
  return (
    <Stack
      screenOptions={{
        // 所有位置相关页面的通用配置
        headerShown: true,
        presentation: 'card',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="addressSelect"
        options={{
          title: '选择门店',
        }}
      />
      <Stack.Screen
        name="citySelect"
        options={{
          title: '选择城市',
        }}
      />
    </Stack>
  );
}
