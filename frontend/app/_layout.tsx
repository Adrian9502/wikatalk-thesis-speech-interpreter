import React, { useEffect, ReactNode } from "react";
import { useFonts } from "expo-font";
import { useRouter, useSegments } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen, Stack } from "expo-router";
import "../global.css";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator, SafeAreaView, Text } from "react-native";
import Logo from "@/components/Logo";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

interface AuthGuardProps {
  children: ReactNode;
}

const LoadingScreen = ({ message }: { message: string }) => (
  <SafeAreaView className="bg-emerald-500 h-screen relative flex items-center justify-around flex-1">
    <StatusBar style="dark" />
    <View className="absolute -top-[50vh] w-[140vw] rounded-full h-[100vh] bg-white" />
    <Logo title="" />
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#fff" />
      <Text className="font-pregular text-white mt-4 text-lg">{message}</Text>
    </View>
  </SafeAreaView>
);

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

  const AuthGuard = ({ children }: AuthGuardProps) => {
    const { isLoggedIn, isLoading, isAppReady } = useAuth();
    const segments = useSegments() as string[];
    const router = useRouter();

    useEffect(() => {
      if (!isAppReady || isLoading) return; // Wait for app to be ready

      const inAuthGroup = segments[0] === "(auth)";
      const isIndexPage = segments[0] === "index" || segments.length === 0;

      if (!isLoggedIn && !inAuthGroup && !isIndexPage) {
        router.replace("/(auth)/SignIn");
      } else if (isLoggedIn && inAuthGroup) {
        router.replace("/(tabs)/Home");
      }
    }, [isLoggedIn, segments, isLoading, isAppReady]); // Add isAppReady to dependencies

    return <>{children}</>;
  };

  return (
    <AuthProvider>
      <AuthGuard>
        <PaperProvider>
          <ValidationProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="(auth)/SignIn"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="(auth)/SignUp"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ValidationProvider>
        </PaperProvider>
      </AuthGuard>
    </AuthProvider>
  );
};

export default RootLayout;
