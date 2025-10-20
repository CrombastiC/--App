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
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      {/* <Stack.Screen name="reset-password" /> */}
    </Stack>
  );
}
