import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { useRouter, useSegments, Stack } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen } from "expo-router";
import "../global.css";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator, SafeAreaView, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import AuthLogo from "@/components/AuthLogo";

SplashScreen.preventAutoHideAsync();

const LoadingScreen = ({ message }: { message: string }) => (
  <SafeAreaView className="bg-emerald-500 h-screen relative flex items-center justify-around flex-1">
    <StatusBar style="dark" />
    <View className="absolute -top-[50vh] w-[140vw] rounded-full h-[100vh] bg-white" />
    <AuthLogo />
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#fff" />
      <Text className="font-pregular text-white mt-4 text-lg">{message}</Text>
    </View>
  </SafeAreaView>
);

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, isAppReady, userData } = useAuth();
  const segments = useSegments() as String[];
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isAppReady) return;

    const checkAuth = async () => {
      const inAuthGroup = segments[0] === "(auth)";
      const isIndexPage = segments.length === 0 || segments[0] === "index";
      const isVerifyPage = segments[1] === "VerifyEmail";
      const isSignUpPage = segments[1] === "SignUp";
      const hasPartialRegistration = userData && !userData.isVerified;

      // Don't redirect if already navigating
      if (isNavigating) return;

      try {
        setIsNavigating(true);

        // Allow access to signup and signin pages without redirection
        if (isSignUpPage || segments[1] === "SignIn") {
          setIsNavigating(false);
          return;
        }

        // Handle verified users
        if (isLoggedIn && userData?.isVerified) {
          if (inAuthGroup || isIndexPage) {
            await router.replace("/(tabs)/Home");
          }
          return;
        }

        // Handle unverified users
        if (hasPartialRegistration && !isVerifyPage) {
          await router.replace("/(auth)/VerifyEmail");
          return;
        }

        // Protect private routes
        if (!isLoggedIn && !inAuthGroup && !isIndexPage) {
          await router.replace("/(auth)/SignIn");
          return;
        }
      } catch (error) {
        console.error("Navigation error:", error);
      } finally {
        setIsNavigating(false);
      }
    };

    checkAuth();
  }, [isLoggedIn, segments, isAppReady, userData]);

  if (!isAppReady || isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return <>{children}</>;
};

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return <LoadingScreen message="Loading fonts..." />;
  }

  return (
    <AuthProvider>
      <PaperProvider>
        <ValidationProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
        </ValidationProvider>
      </PaperProvider>
    </AuthProvider>
  );
};

export default function App() {
  return <RootLayout />;
}
