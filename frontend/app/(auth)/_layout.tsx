import { ValidationProvider } from "@/context/ValidationContext";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <ValidationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="VerifyEmail" />
        <Stack.Screen name="ForgotPassword" />
        <Stack.Screen name="SetNewPassword" />
      </Stack>
    </ValidationProvider>
  );
}
