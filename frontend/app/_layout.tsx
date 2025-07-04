import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen } from "expo-router";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider from "@/components/ThemeProvider";
import SplashAnimation from "@/components/SplashAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InteractionManager } from "react-native";
import { useSplashStore } from "@/store/useSplashStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { initializeToken } from "@/lib/authTokenManager";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const router = useRouter();
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

  const { splashShown, markSplashShown, markLoadingComplete } =
    useSplashStore();
  const [themeReady, setThemeReady] = useState<boolean>(false);
  const [manuallyCheckedToken, setManuallyCheckedToken] =
    useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [initialRouteReady, setInitialRouteReady] = useState<boolean>(false);
  const [showSplashAnimation, setShowSplashAnimation] = useState<boolean>(true);

  // Stable callback for theme ready
  const handleThemeReady = useCallback(() => {
    console.log("Theme is ready");
    setThemeReady(true);
  }, []);

  // Google Sign in
  useEffect(() => {
    const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
    const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
    GoogleSignin.configure({
      webClientId: googleWebClientId,
      offlineAccess: true,
      iosClientId: googleIosClientId,
      profileImageSize: 120,
      scopes: ["profile", "email"],
    });
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Manually check for token as early as possible
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize token first
        await initializeToken();

        // Then check token
        const token = await AsyncStorage.getItem("userToken");
        setHasToken(!!token);
        setManuallyCheckedToken(true);
        console.log("Manual token check complete, token exists:", !!token);

        // If we have a token, start preloading game data in parallel
        if (token) {
          useSplashStore
            .getState()
            .preloadGameData()
            .then((success) => {
              console.log(
                `[Layout] Game data preloading ${
                  success ? "successful" : "failed"
                }`
              );
            });
        }
      } catch (e) {
        console.error("Error checking token:", e);
        setManuallyCheckedToken(true);
      }
    };

    initializeApp();
  }, []);

  // Add force timeout to prevent infinite loading
  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      console.log("Force ending splash animation after timeout");
      setShowSplashAnimation(false);
      markSplashShown();
      markLoadingComplete();
    }, 5000);

    return () => clearTimeout(forceTimeout);
  }, [markLoadingComplete, markSplashShown]);

  // When all resources are loaded, decide what to do
  useEffect(() => {
    if (
      fontsLoaded &&
      themeReady &&
      manuallyCheckedToken &&
      !initialRouteReady
    ) {
      console.log("All resources loaded, manually checked token:", hasToken);

      // Mark check as complete to avoid multiple runs
      setInitialRouteReady(true);

      const initialNavigate = async () => {
        try {
          if (hasToken) {
            console.log("Token exists, navigating to Speech");
            await router.replace("/(tabs)/Speech");
          } else {
            console.log("No token, showing login screen");
            await router.replace("/");
          }

          // Add delay AFTER navigation completes to ensure screen is fully ready
          // Keep splash animation visible longer
          setTimeout(() => {
            console.log("Navigation complete, now hiding splash screen");
            setShowSplashAnimation(false);
            markSplashShown();
            markLoadingComplete();
          }, 100);
        } catch (error) {
          console.error("Navigation error:", error);
          // If navigation fails, still hide the splash after a delay
          setTimeout(() => {
            setShowSplashAnimation(false);
            markSplashShown();
            markLoadingComplete();
          }, 1000);
        }
      };

      // Use InteractionManager to ensure UI is ready
      InteractionManager.runAfterInteractions(() => {
        initialNavigate();
      });
    }
  }, [
    fontsLoaded,
    themeReady,
    manuallyCheckedToken,
    hasToken,
    initialRouteReady,
    router,
    markLoadingComplete,
    markSplashShown,
  ]);

  // Only show splash animation in RootLayout, not in child components
  if (showSplashAnimation && !splashShown) {
    return <SplashAnimation />;
  }

  return (
    <AuthProvider>
      <ThemeProvider onThemeReady={handleThemeReady}>
        <PaperProvider>
          <ValidationProvider>
            <SafeAreaProvider>
              <View style={{ flex: 1 }}>
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
              </View>
            </SafeAreaProvider>
          </ValidationProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default RootLayout;
