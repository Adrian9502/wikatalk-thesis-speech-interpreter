import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import useThemeStore from "@/store/useThemeStore";
import { useAuth } from "@/context/AuthContext";
import { useTotalPronunciationsCount } from "@/hooks/useTotalPronunciationsCount";
import useCoinsStore from "@/store/games/useCoinsStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import { useFormattedStats } from "@/utils/gameStatsUtils";
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
  const { coins } = useCoinsStore();
  const { wordOfTheDay, getWordOfTheDay } = usePronunciationStore();
  const insets = useSafeAreaInsets();

  const overallStats = useFormattedStats();
  const totalPronunciationsCount = useTotalPronunciationsCount();

  // Add state to track data readiness
  const [dataLoaded, setDataLoaded] = useState(false);

  // Get user first name
  const firstName = (userData?.fullName || userData?.username || "").split(
    " "
  )[0];

  // Animation values
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const slideAnim = useState(() => new Animated.Value(50))[0];

  // Initialize data and track readiness
  useEffect(() => {
    console.log("[HomePage] Starting data initialization");

    const initializeData = async () => {
      try {
        // Check if Word of the Day exists, if not load it
        if (!wordOfTheDay) {
          await getWordOfTheDay();
        }

        // Mark data as loaded
        setDataLoaded(true);
        console.log("[HomePage] Data initialization complete");

        // Call onReady callback if provided
        if (onReady) {
          onReady();
        }
      } catch (error) {
        console.error("[HomePage] Data initialization error:", error);
        setDataLoaded(true); // Still allow render even if some data fails
      }
    };

    initializeData();
  }, [wordOfTheDay, getWordOfTheDay, onReady]);

  useEffect(() => {
    if (dataLoaded) {
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
        console.log("[HomePage] Animation completed");
      });
    }
  }, [dataLoaded]);

  const handleSettingsPress = () => {
    onNavigateToTab("Settings");
  };

  const handleNavigateToHistory = () => {
    router.push("/(settings)/TranslationHistory");
  };

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

            {/* Core Translation Features */}
            <Explore onNavigateToTab={onNavigateToTab} />

            <WordOfTheDay />

            {/* Recent Translations */}
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
});

export default HomePage;
