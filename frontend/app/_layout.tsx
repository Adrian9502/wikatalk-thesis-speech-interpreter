import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import "react-native-url-polyfill/auto";
import { SplashScreen } from "expo-router";
import { ValidationProvider } from "@/context/ValidationContext";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthContext";
import { NotifierWrapper } from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider from "@/components/ThemeProvider";
import SplashAnimation from "@/components/SplashAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InteractionManager } from "react-native";
import { useSplashStore } from "@/store/useSplashStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { initializeToken } from "@/lib/authTokenManager";
import { ProgressModalProvider } from "@/components/games/ProgressModalProvider";
import { RankingsModalProvider } from "@/components/games/RankingsModalProvider";
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

import useHomePageStore from "@/store/useHomePageStore";
import HomePage from "@/components/home/HomePage";
import AppLoading from "@/components/AppLoading"; // NEW: Import AppLoading
import GameNavigation from "@/components/games/GameNavigation";

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

  const { shouldShowHomePage, setShowHomePage } = useHomePageStore();

  const [themeReady, setThemeReady] = useState<boolean>(false);
  const [manuallyCheckedToken, setManuallyCheckedToken] =
    useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [initialRouteReady, setInitialRouteReady] = useState<boolean>(false);
  const [showSplashAnimation, setShowSplashAnimation] = useState<boolean>(true);

  const [showHomePage, setShowHomePageState] = useState<boolean>(false);
  const [shouldRenderTabs, setShouldRenderTabs] = useState<boolean>(false);

  // NEW: Add state to track HomePage readiness
  const [homePageReady, setHomePageReady] = useState<boolean>(false);
  const [showAppLoading, setShowAppLoading] = useState<boolean>(false);

  // Stable callback for theme ready
  const handleThemeReady = useCallback(() => {
    console.log("Theme is ready");
    setThemeReady(true);
  }, []);

  // Google Sign in
  useEffect(() => {
    const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
    const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;

    console.log("=== GOOGLE SIGNIN CONFIGURATION ===");
    console.log("Web Client ID:", googleWebClientId);
    console.log("iOS Client ID:", googleIosClientId);
    console.log("=== END CONFIGURATION ===");

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

  // NEW: HomePage readiness callback
  const handleHomePageReady = useCallback(() => {
    console.log("[Layout] HomePage reports it's ready");
    setHomePageReady(true);
  }, []);

  // UPDATED: Enhanced navigation logic with HomePage support - prevent tab flash
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

      // FIXED: Check HomePage first and prevent tab rendering if HomePage should show
      if (hasToken && shouldShowHomePage()) {
        console.log(
          "HomePage should show - setting state immediately, preventing tab flash"
        );
        setShowHomePageState(true);
        setShouldRenderTabs(false); // CRITICAL: Don't render tabs

        // NEW: Show AppLoading while HomePage prepares
        setShowAppLoading(true);
        setShowSplashAnimation(false);
        markSplashShown();

        // UPDATED: Wait a bit longer for HomePage data to be ready
        setTimeout(() => {
          console.log("HomePage data should be ready, checking readiness...");

          // Give HomePage some time to initialize its data
          const checkHomePageReadiness = () => {
            // You can add more sophisticated checks here
            // For now, we'll just wait a bit more to ensure data is loaded
            console.log("HomePage ready, hiding app loading");
            setShowAppLoading(false);
            markLoadingComplete();
          };

          // Small additional delay to ensure HomePage data is fully loaded
          setTimeout(checkHomePageReadiness, 500);
        }, 200);

        return; // Exit early, don't setup tab navigation
      }

      // Only render tabs if HomePage is not showing
      setShouldRenderTabs(true);

      const initialNavigate = async () => {
        try {
          if (hasToken) {
            console.log("Skipping HomePage, navigating to Speech");
            await router.replace("/(tabs)/Speech");
          } else {
            console.log("No token, showing login screen");
            await router.replace("/");
          }

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
    shouldShowHomePage,
    markLoadingComplete,
    markSplashShown,
  ]);

  // Register stores with dataManager to break circular dependencies
  useEffect(() => {
    registerSplashStore(useSplashStore.getState());
    registerProgressStore(useProgressStore.getState());
    registerGameStore(useGameStore.getState());
    registerCoinsStore(useCoinsStore.getState());

    // Set initial user ID
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

  const handleNavigateToTab = useCallback(
    (tabName: string) => {
      console.log("HomePage: Navigating to tab:", tabName);
      setShowHomePageState(false);
      setHomePageReady(false); // NEW: Reset HomePage ready state
      setShouldRenderTabs(true); // NEW: Enable tab rendering when navigating from HomePage

      // Add a small delay to ensure navigation is ready
      setTimeout(() => {
        // Navigate to the appropriate tab
        switch (tabName) {
          case "Speech":
            router.replace("/(tabs)/Speech");
            break;
          case "Translate":
            router.replace("/(tabs)/Translate");
            break;
          case "Scan":
            router.replace("/(tabs)/Scan");
            break;
          case "Games":
            router.replace("/(tabs)/Games");
            break;
          case "Pronounce":
            router.replace("/(tabs)/Pronounce");
            break;
          case "Settings":
            router.replace("/(tabs)/Settings");
            break;
          default:
            router.replace("/(tabs)/Speech");
        }
      }, 100); // Small delay to ensure router is ready
    },
    [router]
  );

  // Only show splash animation in RootLayout, not in child components
  if (showSplashAnimation && !splashShown) {
    return <SplashAnimation />;
  }

  // NEW: Show AppLoading while HomePage is preparing
  if (showAppLoading && showHomePage && hasToken) {
    return <AppLoading />;
  }

  // FIXED: Show HomePage without any tab background
  if (showHomePage && hasToken && !showAppLoading) {
    return (
      <HomePage
        onNavigateToTab={handleNavigateToTab}
        context="startup"
        onReady={handleHomePageReady}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider onThemeReady={handleThemeReady}>
            <ProgressModalProvider>
              <RankingsModalProvider>
                <PaperProvider>
                  <ValidationProvider>
                    <NotifierWrapper>
                      <View style={{ flex: 1 }}>
                        {shouldRenderTabs && (
                          <Stack screenOptions={{ headerShown: false }}>
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
                          </Stack>
                        )}
                      </View>
                    </NotifierWrapper>
                  </ValidationProvider>
                </PaperProvider>
              </RankingsModalProvider>
            </ProgressModalProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
