import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen } from "expo-router";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppLoading from "@/components/AppLoading";
import ThemeProvider from "@/components/ThemeProvider";
import SplashAnimation from "@/components/SplashAnimation";

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

  useEffect(() => {
    if (error) throw error;
  }, [fontsLoaded, error]);

  // Handler for when Lottie animation finishes
  const handleAnimationFinish = () => {
    // Only hide the splash animation when fonts are loaded
    if (fontsLoaded) {
      setShowSplashAnimation(false);
    }
  };

  if (showSplashAnimation) {
    return <SplashAnimation onAnimationFinish={handleAnimationFinish} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
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
