import { Stack } from "expo-router";

export default function QueueLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="index" options={{ title: "排队取号" }} />
      <Stack.Screen name="ticket" options={{ title: "我的排队" }} />
    </Stack>
  );
}
