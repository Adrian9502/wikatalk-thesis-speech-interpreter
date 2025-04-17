import React, { useEffect, useState, useCallback, useRef } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen } from "expo-router";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider from "@/components/ThemeProvider";
import SplashAnimation from "@/components/SplashAnimation";
import useThemeStore from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProtectedRoute from "@/components/ProtectedRoute";
// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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

  const [showSplashAnimation, setShowSplashAnimation] = useState<boolean>(true);
  const [themeReady, setThemeReady] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [initialURL, setInitialURL] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigated = useRef<boolean>(false);

  // Stable callback for theme ready
  const handleThemeReady = useCallback(() => {
    console.log("Theme is ready");
    setThemeReady(true);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState().initializeAuth();
      setAuthReady(true);

      // Just sync theme if needed, but don't set initialURL here
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          await useThemeStore.getState().syncThemeWithServer();
        }
      } catch (e) {
        console.log("Theme sync error:", e);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Add force timeout to prevent infinite loading
  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      console.log("Force ending splash animation after timeout");

      // Even on timeout, make sure we've set the initial URL
      if (!initialURL) {
        setInitialURL("/");
      }

      setShowSplashAnimation(false);
    }, 8000); // 8 seconds max loading time

    return () => clearTimeout(forceTimeout);
  }, []);

  // When all resources are loaded, navigate conditionally
  useEffect(() => {
    if (fontsLoaded && themeReady && authReady && !hasNavigated.current) {
      hasNavigated.current = true;

      // AuthProvider will handle navigation
      const hideTimeout = setTimeout(() => {
        setShowSplashAnimation(false);
      }, 800);

      return () => clearTimeout(hideTimeout);
    }
  }, [fontsLoaded, themeReady, authReady]);

  if (showSplashAnimation) {
    // Show loading screen until everything is ready
    return <SplashAnimation />;
  }

  if (!initialURL) {
    // This is a safeguard - if somehow we got here without an initialURL
    return <SplashAnimation />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider onThemeReady={handleThemeReady}>
          <PaperProvider>
            <ValidationProvider>
              <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
                <Toast />
              </SafeAreaProvider>
            </ValidationProvider>
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </View>
  );
};

export default function RootLayoutWrapper() {
  return (
    <ProtectedRoute authRequired={true}>
      <RootLayout />
    </ProtectedRoute>
  );
}
