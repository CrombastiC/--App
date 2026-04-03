/**
 * Auth 路由布局
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F6EAE3' },
        // 防止手势返回导致的意外导航
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      {/* <Stack.Screen name="reset-password" /> */}
    </Stack>
  );
}
