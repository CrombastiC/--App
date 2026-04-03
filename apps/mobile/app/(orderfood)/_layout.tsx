import { Stack } from 'expo-router';

export default function OrderFoodLayout() {
  return (
    <Stack
      screenOptions={{
        // 所有点餐相关页面的通用配置
        headerShown: true,
        presentation: 'card',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="peopleSelect"
        options={{
          title: '选择就餐人数',
        }}
      />
      <Stack.Screen
        name="settlement"
        options={{
          title: '结算',
        }}
      />
    </Stack>
  );
}
