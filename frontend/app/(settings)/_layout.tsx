import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountDetails" />
      <Stack.Screen name="ChangePassword" />
      <Stack.Screen name="ContactSupport" />
      <Stack.Screen name="HelpAndFAQ" />
    </Stack>
  );
}
