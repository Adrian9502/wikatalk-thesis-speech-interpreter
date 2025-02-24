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
  const [lastLocation, setLastLocation] = useState<string | null>(null); // Add this

  useEffect(() => {
    if (!isAppReady) return;

    const checkAuth = async () => {
      console.log("🔒 AuthGuard Check:", {
        segments,
        isLoggedIn,
        isNavigating,
        userData,
        lastLocation,
      });

      const inAuthGroup = segments[0] === "(auth)";
      const isIndexPage = segments.length === 0 || segments[0] === "index";
      const isVerifyPage = segments[1] === "VerifyEmail";
      const isAuthPage = segments[1] === "SignIn" || segments[1] === "SignUp";
      const hasPartialRegistration = userData && !userData.isVerified;

      // Store current location if it's a valid path
      if (segments.length > 0 && !isNavigating) {
        setLastLocation(segments.join("/"));
      }

      // Don't redirect if already navigating
      if (isNavigating) {
        console.log("⏳ Navigation already in progress, skipping check");
        return;
      }

      try {
        setIsNavigating(true);

        // If we're on index page but came from SignIn, go back to SignIn
        if (isIndexPage && lastLocation?.includes("SignIn")) {
          console.log("↩️ Returning to SignIn from index");
          await router.replace("/(auth)/SignIn");
          return;
        }

        // Allow access to auth pages without redirection
        if (isAuthPage) {
          console.log("🔑 On auth page, allowing access");
          setIsNavigating(false);
          return;
        }

        // Handle verified users
        if (isLoggedIn && userData?.isVerified) {
          console.log("✅ Logged in and verified user");
          if (inAuthGroup || isIndexPage) {
            console.log("🔄 Redirecting to home");
            await router.replace("/(tabs)/Home");
          }
          return;
        }

        // Handle unverified users
        if (hasPartialRegistration && !isVerifyPage) {
          console.log("📧 Unverified user, redirecting to verification");
          await router.replace("/(auth)/VerifyEmail");
          return;
        }

        // Protect private routes, but don't redirect if we're already on SignIn
        if (!isLoggedIn && !inAuthGroup && !isIndexPage && !isAuthPage) {
          console.log("🚫 Unauthorized access attempt, redirecting to login");
          await router.replace("/(auth)/SignIn");
          return;
        }
      } catch (error) {
        console.error("❌ Navigation error:", error);
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
