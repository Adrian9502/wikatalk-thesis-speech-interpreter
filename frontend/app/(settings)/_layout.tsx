import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountDetails" />
      <Stack.Screen name="HelpAndFAQ" />
      <Stack.Screen name="About" />
      <Stack.Screen name="RecentActivity" />
    </Stack>
  );
}
