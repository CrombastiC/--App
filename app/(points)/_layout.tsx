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
    </Stack>
  );
}
