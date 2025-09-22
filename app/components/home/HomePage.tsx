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
import { usePronunciationStore } from "@/store/usePronunciationStore";
import { useTutorial } from "@/context/TutorialContext";
import { TutorialTarget } from "@/components/tutorial/TutorialTarget";
import { HOME_TUTORIAL } from "@/constants/tutorials";
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
  const { startTutorial, shouldShowTutorial } = useTutorial(); // CHANGED: Use shouldShowTutorial instead of isTutorialCompleted
  const insets = useSafeAreaInsets();

  // Add state to track data readiness and tutorial status
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tutorialStatusChecked, setTutorialStatusChecked] = useState(false);
  const [shouldStartTutorial, setShouldStartTutorial] = useState(false);
  const [, setAnimationComplete] = useState(false);

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

  // NEW: Check tutorial status when user data is available
  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (!userData || tutorialStatusChecked) return;

      try {
        console.log(
          "[HomePage] Checking tutorial status for user:",
          userData.id || userData._id
        );
        const shouldShow = await shouldShowTutorial(
          HOME_TUTORIAL.id,
          HOME_TUTORIAL.version
        );
        console.log("[HomePage] Should show home tutorial:", shouldShow);

        setShouldStartTutorial(shouldShow);
        setTutorialStatusChecked(true);
      } catch (error) {
        console.error("[HomePage] Error checking tutorial status:", error);
        // Default to not showing tutorial on error
        setShouldStartTutorial(false);
        setTutorialStatusChecked(true);
      }
    };

    checkTutorialStatus();
  }, [userData, tutorialStatusChecked, shouldShowTutorial]);

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

  // ENHANCED: Handle animations and tutorial start with proper checks
  useEffect(() => {
    if (dataLoaded && tutorialStatusChecked && componentMountedRef.current) {
      console.log(
        "[HomePage] Starting animations, shouldStartTutorial:",
        shouldStartTutorial
      );

      // Start animations once data is loaded and tutorial status is checked
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

          // Start tutorial after animation completes if needed
          if (
            !tutorialStartedRef.current &&
            shouldStartTutorial // CHANGED: Use shouldStartTutorial state
          ) {
            setTimeout(() => {
              if (componentMountedRef.current) {
                console.log(
                  "[HomePage] Starting home tutorial for new/incomplete user"
                );
                tutorialStartedRef.current = true;
                startTutorial(HOME_TUTORIAL);
              }
            }, 500); // Small delay for better UX
          }
        }
      });
    }
  }, [
    dataLoaded,
    tutorialStatusChecked,
    shouldStartTutorial,
    fadeAnim,
    slideAnim,
    startTutorial,
  ]);

  // Don't render content until data is loaded and tutorial status is checked
  if (!dataLoaded || !tutorialStatusChecked) {
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

            <TutorialTarget id="explore-section">
              <Explore onNavigateToTab={onNavigateToTab} />
            </TutorialTarget>

            <TutorialTarget id="word-of-day">
              <WordOfTheDay />
            </TutorialTarget>

            <TutorialTarget id="translation-history">
              <TranslationHistory
                onNavigateToHistory={handleNavigateToHistory}
                onNavigateToTab={onNavigateToTab}
              />
            </TutorialTarget>
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
