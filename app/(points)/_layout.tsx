import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="pointsMall"
        options={{
          title: '积分商城',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="pointPage"
        options={{
          title: '积分页面',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="luckyRoll"
        options={{
          title: '幸运抽奖',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
