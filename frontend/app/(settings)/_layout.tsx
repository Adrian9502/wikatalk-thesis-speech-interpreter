import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountDetails" />
      <Stack.Screen name="HelpAndFAQ" />
    </Stack>
  );
}
