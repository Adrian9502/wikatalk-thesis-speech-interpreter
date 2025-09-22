import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Text, InteractionManager } from "react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen } from "expo-router";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthContext";
import { TutorialProvider } from "@/context/TutorialContext";
import { NotifierWrapper } from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider from "@/components/ThemeProvider";
import SplashAnimation from "@/components/SplashAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSplashStore } from "@/store/useSplashStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { initializeToken } from "@/lib/authTokenManager";
import { ProgressModalProvider } from "@/components/games/ProgressModalProvider";
import { RankingsModalProvider } from "@/components/games/RankingsModalProvider";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import {
  registerSplashStore,
  registerProgressStore,
  registerGameStore,
  registerCoinsStore,
  setCurrentUserId,
} from "@/utils/dataManager";
import useProgressStore from "@/store/games/useProgressStore";
import useGameStore from "@/store/games/useGameStore";
import useCoinsStore from "@/store/games/useCoinsStore";
import { useAuthStore } from "@/store/useAuthStore";
// import CustomTooltip from "@/components/CustomTooltip";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Make all Text ignore font scaling by default
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

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

  // Google Sign in setup
  useEffect(() => {
    const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
    const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;

    GoogleSignin.configure({
      webClientId: googleWebClientId,
      offlineAccess: true,
      iosClientId: googleIosClientId,
      profileImageSize: 140,
      scopes: ["profile", "email"],
    });
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize app with better performance
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeToken();
        const token = await AsyncStorage.getItem("userToken");
        setHasToken(!!token);
        setManuallyCheckedToken(true);
        console.log("Manual token check complete, token exists:", !!token);

        // Use InteractionManager for better performance
        if (token) {
          InteractionManager.runAfterInteractions(() => {
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
          });
        }
      } catch (e) {
        console.error("Error checking token:", e);
        setManuallyCheckedToken(true);
      }
    };

    initializeApp();
  }, []);

  // Force timeout with better cleanup
  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      console.log("Force ending splash animation after timeout");
      setShowSplashAnimation(false);
      markSplashShown();
      markLoadingComplete();
    }, 5000);

    return () => clearTimeout(forceTimeout);
  }, [markLoadingComplete, markSplashShown]);

  // Enhanced navigation with InteractionManager
  useEffect(() => {
    if (
      fontsLoaded &&
      themeReady &&
      manuallyCheckedToken &&
      !initialRouteReady
    ) {
      console.log("All resources loaded, manually checked token:", hasToken);
      setInitialRouteReady(true);

      const initialNavigate = () => {
        // Use InteractionManager for smoother navigation
        InteractionManager.runAfterInteractions(async () => {
          try {
            if (hasToken) {
              console.log("Token found, navigating directly to Home tab");
              await router.replace("/(tabs)/Home");
            } else {
              console.log("No token, showing login screen");
              await router.replace("/");
            }

            console.log("Navigation complete, hiding splash screen");

            // Use requestAnimationFrame for smoother transition
            requestAnimationFrame(() => {
              setShowSplashAnimation(false);
              markSplashShown();
              markLoadingComplete();
            });
          } catch (error) {
            console.error("Navigation error:", error);
            setTimeout(() => {
              setShowSplashAnimation(false);
              markSplashShown();
              markLoadingComplete();
            }, 1000);
          }
        });
      };

      // Execute immediately
      initialNavigate();
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

  // Register stores with dataManager
  useEffect(() => {
    registerSplashStore(useSplashStore.getState());
    registerProgressStore(useProgressStore.getState());
    registerGameStore(useGameStore.getState());
    registerCoinsStore(useCoinsStore.getState());

    const authState = useAuthStore.getState();
    const userId = authState.userData?.id || authState.userData?.email || null;
    setCurrentUserId(userId);

    console.log("[Layout] Data manager initialized with stores");
  }, []);

  // Track user changes
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      const userId = state.userData?.id || state.userData?.email || null;
      setCurrentUserId(userId);
    });

    return unsubscribe;
  }, []);

  // Show splash animation
  if (showSplashAnimation && !splashShown) {
    return <SplashAnimation />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider onThemeReady={handleThemeReady}>
            <TutorialProvider>
              <ProgressModalProvider>
                <RankingsModalProvider>
                  <PaperProvider>
                    <ValidationProvider>
                      <NotifierWrapper>
                        <Stack
                          screenOptions={{
                            headerShown: false,
                            animationTypeForReplace: "pop",
                            animation: "fade",
                          }}
                        >
                          <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(auth)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(settings)"
                            options={{ headerShown: false }}
                          />
                        </Stack>
                        {/* Tutorial Overlay - Render at root level */}
                        <TutorialOverlay />
                      </NotifierWrapper>
                    </ValidationProvider>
                  </PaperProvider>
                </RankingsModalProvider>
              </ProgressModalProvider>
            </TutorialProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
