import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="account"
        options={{
          title: '个人资料',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="createOrder"
        options={{
          title: '创建订单',
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
