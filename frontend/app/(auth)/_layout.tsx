import { ValidationProvider } from "@/context/ValidationContext";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <ValidationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" />
        <Stack.Screen name="SignUp" />
        <Stack.Screen name="VerifyEmail" />
        <Stack.Screen name="ResetPassword" />
        <Stack.Screen name="VerifyResetPassword" />
        <Stack.Screen name="SetNewPassword" />
      </Stack>
    </ValidationProvider>
  );
}
