import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { View, StyleSheet, ScrollView, Animated, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import useThemeStore from "@/store/useThemeStore";
import { useAuth } from "@/context/AuthContext";
// import { useTotalPronunciationsCount } from "@/hooks/useTotalPronunciationsCount";
// import useCoinsStore from "@/store/games/useCoinsStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
// import { useFormattedStats } from "@/utils/gameStatsUtils";
import AppLoading from "../AppLoading";
// Import components
import HomeHeader from "./HomeHeader";
import Explore from "./Explore";
import TranslationHistory from "./TranslationHistory";
import { router } from "expo-router";
import WordOfTheDay from "./WordOfTheDay";

interface HomePageProps {
  onNavigateToTab: (tabName: string) => void;
  onReady?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToTab, onReady }) => {
  const { activeTheme } = useThemeStore();
  const { userData } = useAuth();
  const { wordOfTheDay, getWordOfTheDay } = usePronunciationStore();
  const insets = useSafeAreaInsets();

  // Add state to track data readiness
  const [dataLoaded, setDataLoaded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Use refs to prevent tutorial restarts
  const tutorialStartedRef = useRef<boolean>(false);
  const componentMountedRef = useRef<boolean>(false);

  // Get user first name
  const firstName = useMemo(
    () => (userData?.fullName || userData?.username || "").split(" ")[0],
    [userData?.fullName, userData?.username]
  );

  // Animation values
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const slideAnim = useState(() => new Animated.Value(50))[0];

  const handleSettingsPress = useCallback(() => {
    onNavigateToTab("Settings");
  }, [onNavigateToTab]);

  const handleNavigateToHistory = useCallback(() => {
    router.push("/(settings)/TranslationHistory");
  }, []);

  // Initialize data and track readiness
  useEffect(() => {
    console.log("[HomePage] Starting data initialization");
    componentMountedRef.current = true;

    const initializeData = async () => {
      try {
        // Check if Word of the Day exists, if not load it
        if (!wordOfTheDay) {
          await getWordOfTheDay();
        }

        // Only set data loaded if component is still mounted
        if (componentMountedRef.current) {
          setDataLoaded(true);
          console.log("[HomePage] Data initialization complete");

          // Call onReady callback if provided
          if (onReady) {
            onReady();
          }
        }
      } catch (error) {
        console.error("[HomePage] Data initialization error:", error);
        if (componentMountedRef.current) {
          setDataLoaded(true); // Still allow render even if some data fails
        }
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      componentMountedRef.current = false;
    };
  }, [wordOfTheDay, getWordOfTheDay, onReady]);

  // Handle animations and tutorial start
  useEffect(() => {
    if (dataLoaded && componentMountedRef.current) {
      console.log("[HomePage] Starting animations");

      // Start animations once data is loaded
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (componentMountedRef.current) {
          console.log("[HomePage] Animation completed");
          setAnimationComplete(true);
        }
      });
    }
  }, [dataLoaded, fadeAnim, slideAnim]);

  // Don't render content until data is loaded
  if (!dataLoaded) {
    return <AppLoading />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.backgroundColor }}>
      <StatusBar
        style="light"
        backgroundColor={activeTheme.backgroundColor}
        translucent={false}
      />
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={[
          styles.container,
          {
            backgroundColor: activeTheme.backgroundColor,
            paddingTop: insets.top,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Section */}
            <HomeHeader
              userData={userData}
              activeTheme={activeTheme}
              firstName={firstName}
              onSettingsPress={handleSettingsPress}
            />

            <Explore onNavigateToTab={onNavigateToTab} />

            <WordOfTheDay />
            <TranslationHistory
              onNavigateToHistory={handleNavigateToHistory}
              onNavigateToTab={onNavigateToTab}
            />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tutorialTrigger: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    zIndex: 1000,
  },
  stepWrapper: {
    marginVertical: 8,
  },
  hiddenTutorialText: {
    opacity: 0,
    fontSize: 1,
    height: 1,
    color: "transparent",
  },
});

export default HomePage;
