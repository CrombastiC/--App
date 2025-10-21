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
    </Stack>
  );
}
