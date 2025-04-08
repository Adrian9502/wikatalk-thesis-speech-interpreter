import React, { useEffect, useState, useCallback } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
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

  // Stable callback for theme ready
  const handleThemeReady = useCallback(() => {
    console.log("Theme is ready");
    setThemeReady(true);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState().initializeAuth();
      console.log("Auth is ready");
      setAuthReady(true);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) {
      console.log("Fonts are loaded");
    }
  }, [fontsLoaded, error]);

  // Add force timeout to prevent infinite loading
  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      if (showSplashAnimation) {
        console.log("Force ending splash animation after timeout");
        setShowSplashAnimation(false);
      }
    }, 8000); // 8 seconds max loading time

    return () => clearTimeout(forceTimeout);
  }, [showSplashAnimation]);

  // Check if everything is ready whenever any of the dependencies change
  useEffect(() => {
    console.log(
      `Checking app ready - Fonts: ${fontsLoaded}, Theme: ${themeReady}, Auth: ${authReady}`
    );

    if (fontsLoaded && themeReady && authReady) {
      console.log("All resources loaded, hiding splash screen");
      setShowSplashAnimation(false);
    }
  }, [fontsLoaded, themeReady, authReady]);

  if (showSplashAnimation) {
    return <SplashAnimation />;
  }

  return (
    <AuthProvider>
      <ThemeProvider onThemeReady={handleThemeReady}>
        <PaperProvider>
          <ValidationProvider>
            <SafeAreaProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <Toast />
            </SafeAreaProvider>
          </ValidationProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default function App() {
  return <RootLayout />;
}
