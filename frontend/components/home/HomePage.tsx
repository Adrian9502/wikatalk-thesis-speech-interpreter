import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Globe,
  Camera,
  Mic,
  Volume2,
  CheckSquare,
  Square,
  ArrowRight,
  Settings,
  ArrowLeft,
  Target,
} from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";
import {
  BASE_COLORS,
  HOMEPAGE_COLORS,
  WORD_OF_DAY_GRADIENT,
} from "@/constant/colors";
import { useAuth } from "@/context/AuthContext";
import Logo from "../Logo";

interface HomePageProps {
  onNavigateToTab: (tabName: string) => void;
  context?: "startup" | "settings";
  onBack?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onNavigateToTab,
  context = "startup",
  onBack,
}) => {
  const { activeTheme } = useThemeStore();
  const { userData } = useAuth();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Animation values
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const slideAnim = useState(() => new Animated.Value(50))[0];

  React.useEffect(() => {
    // Entrance animation
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
    ]).start();
  }, []);

  const features = [
    {
      icon: <Mic width={20} height={20} color={BASE_COLORS.white} />,
      title: "Speech Translation",
      description: "Translate your voice instantly across 10 Filipino dialects",
      gradient: HOMEPAGE_COLORS.speech,
      tabName: "Speech",
    },
    {
      icon: <Globe width={20} height={20} color={BASE_COLORS.white} />,
      title: "Text Translation",
      description: "Type and translate text between different dialects",
      gradient: HOMEPAGE_COLORS.translate,
      tabName: "Translate",
    },
    {
      icon: <Camera width={20} height={20} color={BASE_COLORS.white} />,
      title: "Image Scanner",
      description: "Scan text from images and get instant translations",
      gradient: HOMEPAGE_COLORS.scan,
      tabName: "Scan",
    },
    {
      icon: <Target width={20} height={20} color={BASE_COLORS.white} />,
      title: "Interactive Games",
      description: "Learn dialects through fun quizzes and challenges",
      gradient: HOMEPAGE_COLORS.games,
      tabName: "Games",
    },
    {
      icon: <Volume2 width={20} height={20} color={BASE_COLORS.white} />,
      title: "Pronunciation Guide",
      description: "Perfect your pronunciation with audio examples",
      gradient: HOMEPAGE_COLORS.pronounce,
      tabName: "Pronounce",
    },
  ];

  // ! MAKE THIS DYNAMIC
  const dialectStats = [
    { count: "10", label: "Filipino Dialects" },
    { count: "34K+", label: "Pronunciations" },
    { count: "150+", label: "Game Levels" },
  ];

  const handleFeaturePress = (tabName: string) => {
    if (dontShowAgain) {
      // Save the preference
      const useHomePageStore = require("@/store/useHomePageStore").default;
      useHomePageStore.getState().setShowHomePage(false);
    }
    onNavigateToTab(tabName);
  };

  const handleSettingsPress = () => {
    if (dontShowAgain) {
      const useHomePageStore = require("@/store/useHomePageStore").default;
      useHomePageStore.getState().setShowHomePage(false);
    }
    onNavigateToTab("Settings");
  };

  const handleBackPress = () => {
    if (onBack) {
      // Use custom back handler if provided
      onBack();
      return;
    }

    // Default behavior based on context
    if (context === "settings") {
      // Coming from settings - navigate back to settings
      onNavigateToTab("Settings");
    } else {
      // Coming from startup - hide homepage and show Speech tab
      if (dontShowAgain) {
        const useHomePageStore = require("@/store/useHomePageStore").default;
        useHomePageStore.getState().setShowHomePage(false);
      }
      onNavigateToTab("Speech");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar style="light" />

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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
              hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
            >
              <ArrowLeft
                width={18}
                height={18}
                color={activeTheme.tabActiveColor}
              />
            </TouchableOpacity>

            {/* Settings Button  */}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettingsPress}
              activeOpacity={0.7}
            >
              <Settings
                width={16}
                height={16}
                color={activeTheme.tabActiveColor}
              />
            </TouchableOpacity>

            {/* wikatalk logo */}
            <Logo
              logoSize={80}
              wikaTextSize={25}
              talkTextSize={25}
              taglineTextSize={12}
            />
            {/* welcome message */}
            {userData && (
              <View style={styles.welcomeContainer}>
                <Text
                  style={[
                    styles.welcomeText,
                    { color: activeTheme.tabActiveColor },
                  ]}
                >
                  Welcome back, {userData.fullName || userData.username}!
                </Text>
              </View>
            )}
          </View>
          {/* 

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              {dialectStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: activeTheme.tabActiveColor },
                    ]}
                  >
                    {stat.count}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features Section with Navigation */}
          <Text
            style={[styles.sectionTitle, { color: activeTheme.tabActiveColor }]}
          >
            Explore Features
          </Text>

          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature.tabName)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureIconContainer}>{feature.icon}</View>

                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>

                <View style={styles.featureArrow}>
                  <ArrowRight
                    width={16}
                    height={16}
                    color={BASE_COLORS.white}
                  />
                </View>

                {/* Decorative elements */}
                <View style={styles.featureDecor1} />
                <View style={styles.featureDecor2} />
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {/* Don't Show Again Option - only show for startup context */}
          {context === "startup" && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setDontShowAgain(!dontShowAgain)}
              activeOpacity={0.7}
            >
              {dontShowAgain ? (
                <CheckSquare
                  width={16}
                  height={16}
                  color={activeTheme.secondaryColor}
                />
              ) : (
                <Square
                  width={16}
                  height={16}
                  color={activeTheme.tabActiveColor}
                />
              )}
              <Text
                style={[
                  styles.checkboxText,
                  { color: activeTheme.tabActiveColor },
                ]}
              >
                Skip this screen next time
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 0,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 0,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  statsSection: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    marginBottom: 16,
    textAlign: "center",
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureGradient: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  featureIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 18,
  },
  featureArrow: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  featureDecor1: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  featureDecor2: {
    position: "absolute",
    bottom: -15,
    right: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  checkboxText: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
});

export default HomePage;
