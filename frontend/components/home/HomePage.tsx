import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Globe,
  Camera,
  Mic,
  Volume2,
  Settings,
  Target,
  TrendingUp,
  BookOpen,
} from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS, HOMEPAGE_COLORS } from "@/constant/colors";
import { useAuth } from "@/context/AuthContext";
import { useTotalPronunciationsCount } from "@/hooks/useTotalPronunciationsCount";
import useCoinsStore from "@/store/games/useCoinsStore";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import AppName from "../AppName";
import RankingCategorySelector from "@/components/games/rankings/RankingCategorySelector";
import RankingContent from "@/components/games/rankings/RankingContent";
import { useFormattedStats } from "@/utils/gameStatsUtils";
import { DIALECTS } from "@/constant/languages";
import AppLoading from "../AppLoading";

const { width: screenWidth } = Dimensions.get("window");

interface HomePageProps {
  onNavigateToTab: (tabName: string) => void;
  context?: "startup" | "settings";
  onBack?: () => void;
  onReady?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onNavigateToTab,
  context = "startup",
  onBack,
  onReady,
}) => {
  const { activeTheme } = useThemeStore();
  const { userData } = useAuth();
  const { coins } = useCoinsStore();
  const { wordOfTheDay, getWordOfTheDay } = usePronunciationStore();
  const insets = useSafeAreaInsets();

  const overallStats = useFormattedStats();
  const totalPronunciationsCount = useTotalPronunciationsCount();

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [selectedRankingCategory, setSelectedRankingCategory] =
    useState("quizChampions");

  //Add state to track data readiness
  const [dataLoaded, setDataLoaded] = useState(false);

  // get user first name
  const firstName = (userData?.fullName || userData?.username || "").split(
    " "
  )[0];

  // Animation values
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const slideAnim = useState(() => new Animated.Value(50))[0];

  // Initialize data and track readiness
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("[HomePage] Starting data initialization");

        // Load Word of the Day if not already loaded
        if (!wordOfTheDay) {
          console.log("[HomePage] Loading Word of the Day");
          await getWordOfTheDay();
        }

        // Wait for essential stats to be ready
        // The hooks should provide the data, so we just need to wait a tick
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("[HomePage] Data initialization complete");
        setDataLoaded(true);

        // Notify parent that we're ready
        if (onReady) {
          console.log("[HomePage] Notifying parent that we're ready");
          onReady();
        }
      } catch (error) {
        console.error("[HomePage] Data initialization error:", error);
        // Still mark as ready to prevent infinite loading
        setDataLoaded(true);
        if (onReady) {
          onReady();
        }
      }
    };

    initializeData();
  }, [wordOfTheDay, getWordOfTheDay, onReady]);

  useEffect(() => {
    // Only start animation when data is loaded
    if (dataLoaded) {
      console.log("[HomePage] Starting entrance animation");

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
      ]).start(() => {
        console.log("[HomePage] Animation completed");
      });

      // Auto-rotate featured content
      const interval = setInterval(() => {
        setActiveFeatureIndex((prev) => (prev + 1) % features.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [dataLoaded]);

  const features = [
    {
      icon: <Mic width={18} height={18} color={BASE_COLORS.white} />,
      title: "Speech Translation",
      description: "Translate your voice instantly across 10 Filipino dialects",
      gradient: HOMEPAGE_COLORS.speech,
      tabName: "Speech",
    },
    {
      icon: <Globe width={18} height={18} color={BASE_COLORS.white} />,
      title: "Text Translation",
      description: "Type and translate text between different dialects",
      gradient: HOMEPAGE_COLORS.translate,
      tabName: "Translate",
    },
    {
      icon: <Camera width={18} height={18} color={BASE_COLORS.white} />,
      title: "Image Scanner",
      description: "Scan text from images and get instant translations",
      gradient: HOMEPAGE_COLORS.scan,
      tabName: "Scan",
    },
    {
      icon: <Target width={18} height={18} color={BASE_COLORS.white} />,
      title: "Interactive Games",
      description: "Learn dialects through fun quizzes and challenges",
      gradient: HOMEPAGE_COLORS.games,
      tabName: "Games",
    },
    {
      icon: <Volume2 width={18} height={18} color={BASE_COLORS.white} />,
      title: "Pronunciation Guide",
      description: "Perfect your pronunciation with audio examples",
      gradient: HOMEPAGE_COLORS.pronounce,
      tabName: "Pronounce",
    },
  ];

  const dialectStats = [
    { count: DIALECTS.length, label: "Filipino Dialects" },
    { count: totalPronunciationsCount, label: "Pronunciations" },
    { count: overallStats.total, label: "Game Levels" },
  ];

  const quickStats = [
    {
      icon: (
        <TrendingUp width={14} height={14} color={activeTheme.secondaryColor} />
      ),
      label: "Overall Progress",
      value: overallStats.percentage,
      subValue: overallStats.progressText,
    },
    {
      icon: (
        <Image
          source={require("@/assets/images/coin.png")}
          style={styles.rewardCoinImage}
        />
      ),
      label: "Coins Earned",
      value: coins.toString(),
      subValue: "Total balance",
    },
    {
      icon: (
        <BookOpen width={14} height={14} color={activeTheme.tabActiveColor} />
      ),
      label: "Word of Day",
      value: wordOfTheDay?.english || "Loading...",
      subValue: wordOfTheDay?.translation || "",
    },
  ];

  const handleFeaturePress = (tabName: string) => {
    onNavigateToTab(tabName);
  };

  const handleSettingsPress = () => {
    onNavigateToTab("Settings");
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (context === "settings") {
      onNavigateToTab("Settings");
    } else {
      // Default behavior for startup context
      onNavigateToTab("Speech");
    }
  };

  const handleRankingCategorySelect = (categoryId: string) => {
    setSelectedRankingCategory(categoryId);
  };

  //  Don't render content until data is loaded
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
            <View style={styles.header}>
              <AppName />

              {/* Welcome Message */}
              {userData && (
                <View style={styles.welcomeContainer}>
                  <Text
                    style={[
                      styles.welcomeText,
                      { color: activeTheme.tabActiveColor },
                    ]}
                  >
                    Welcome back, {firstName}! 👋
                  </Text>
                </View>
              )}

              {/* Settings Button */}
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
            </View>

            {/* Featured Content Carousel */}
            <View style={styles.featuredSection}>
              <View style={styles.featuredHeader}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <View style={styles.carouselDots}>
                  {features.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === activeFeatureIndex
                              ? BASE_COLORS.white
                              : "rgba(255, 255, 255, 0.3)",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.featuredCard}
                onPress={() =>
                  handleFeaturePress(features[activeFeatureIndex].tabName)
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={features[activeFeatureIndex].gradient}
                  style={styles.featuredGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredIconContainer}>
                      {features[activeFeatureIndex].icon}
                    </View>
                    <View style={styles.featuredText}>
                      <Text style={styles.featuredTitle}>
                        {features[activeFeatureIndex].title}
                      </Text>
                      <Text style={styles.featuredDescription}>
                        {features[activeFeatureIndex].description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.featuredDecor1} />
                  <View style={styles.featuredDecor2} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Dialect Stats Section */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>App Statistics</Text>
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

            {/* All Features Section */}
            <View style={styles.allFeaturesSection}>
              <Text style={styles.sectionTitle}>Explore All Features</Text>
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
                    <View style={styles.featureIconContainer}>
                      {feature.icon}
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>
                        {feature.description}
                      </Text>
                    </View>
                    <View style={styles.featureDecor1} />
                    <View style={styles.featureDecor2} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Stats Cards */}
            <View style={styles.quickStatsSection}>
              <Text style={[styles.sectionTitle]}>Your Game Progress</Text>
              <View style={styles.quickStatsGrid}>
                {quickStats.map((stat, index) => (
                  <View
                    key={index}
                    style={[
                      styles.quickStatCard,
                      { backgroundColor: "rgba(255, 255, 255, 0.08)" },
                    ]}
                  >
                    <View style={styles.quickStatHeader}>
                      {stat.icon}
                      <Text
                        style={[
                          styles.quickStatLabel,
                          { color: "rgba(255, 255, 255, 0.7)" },
                        ]}
                      >
                        {stat.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.quickStatValue,
                        { color: activeTheme.tabActiveColor },
                      ]}
                    >
                      {stat.value}
                    </Text>
                    {stat.subValue && (
                      <Text style={styles.quickStatSubValue}>
                        {stat.subValue}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Rankings Section */}
            <View style={styles.rankingsHeader}>
              <Text style={[styles.sectionTitle]}>Games Rankings</Text>
            </View>
            <View style={styles.rankingsSection}>
              <RankingCategorySelector
                selectedCategory={selectedRankingCategory}
                onCategorySelect={handleRankingCategorySelect}
              />

              <View style={styles.rankingsContentContainer}>
                <RankingContent
                  selectedCategory={selectedRankingCategory}
                  visible={true}
                />
              </View>
            </View>
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
  header: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  welcomeContainer: {
    marginTop: 8,
  },
  settingsButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
    color: BASE_COLORS.white,
  },
  // Quick Stats Section
  rewardCoinImage: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  quickStatsSection: {
    marginBottom: 16,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  quickStatCard: {
    width: screenWidth < 350 ? "100%" : screenWidth < 400 ? "48%" : "31%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 10,
  },
  quickStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  quickStatLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  quickStatValue: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    marginBottom: 2,
  },
  quickStatSubValue: {
    fontSize: 9,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
  },
  // Featured Section
  featuredSection: {
    marginBottom: 20,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carouselDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  featuredGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "relative",
  },
  featuredContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  featuredDecor1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  featuredDecor2: {
    position: "absolute",
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  // Stats Section
  statsSection: {
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  // All Features Section
  allFeaturesSection: {
    marginBottom: 25,
  },
  featureCard: {
    marginBottom: 20,
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
    minHeight: 80,
    position: "relative",
    justifyContent: "center",
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 14,
    marginBottom: 2,
  },
  featureDecor1: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  featureDecor2: {
    position: "absolute",
    bottom: -10,
    right: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  //  Rankings Section - Full UI from RankingsModal
  rankingsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    padding: 16,
    borderRadius: 20,
  },
  rankingsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankingsContentContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 20,
    minHeight: 400,
    maxHeight: 500,
  },
});

export default HomePage;
