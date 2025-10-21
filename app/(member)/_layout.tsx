import { Stack } from 'expo-router';

export default function MemberLayout() {
  return (
    <Stack
      screenOptions={{
        // 所有会员相关页面的通用配置
        headerShown: true,
        presentation: 'card',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="memberCode"
        options={{
          title: '会员码',
        }}
      />
      <Stack.Screen
        name="top-up"
        options={{
          title: '余额',
        }}
      />
      <Stack.Screen
        name="topUpSuccess"
        options={{
          title: '充值成功',
        }}
      />
    </Stack>
  );
}
