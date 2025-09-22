import { View, Animated, InteractionManager, Dimensions } from "react-native";
import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import {
  Tabs,
  useLocalSearchParams,
  useSegments,
  useRouter,
} from "expo-router";
import useThemeStore from "@/store/useThemeStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { tabPreloader } from "@/utils/tabPreloader";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import { POPPINS_FONT } from "@/constant/fontSizes";
// NEW: Import tutorial context
import { useTutorial } from "@/context/TutorialContext";
import {
  HOME_TUTORIAL,
  SPEECH_TUTORIAL,
  TRANSLATE_TUTORIAL,
  SCAN_TUTORIAL,
  GAMES_TUTORIAL,
  PRONOUNCE_TUTORIAL,
} from "@/constants/tutorials";

const { width: screenWidth } = Dimensions.get("window");

// Calculate available width per tab
const getTabWidth = () => {
  const padding = 20; // Account for screen padding
  const availableWidth = screenWidth - padding;
  return availableWidth / 6; // 6 tabs
};

// Responsive icon sizes and spacing based on screen width
const getResponsiveIconSizes = () => {
  const isSmallScreen = screenWidth <= 384; // Small phones
  const isMediumScreen = screenWidth <= 414; // iPhone X/11 size
  const tabWidth = getTabWidth();

  return {
    focused: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
    unfocused: isSmallScreen ? 13 : isMediumScreen ? 14 : 15,
    gameIcon: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
    fontSize: tabWidth < 60 ? 8 : tabWidth < 70 ? 9 : 10,
    marginTop: tabWidth < 60 ? 2 : 3,
  };
};

interface TabIconProps {
  Icon: React.ComponentType<any>;
  color: string;
  name: string;
  focused: boolean;
}

interface IconProps {
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const TabIcon: React.FC<TabIconProps> = React.memo(
  ({ Icon, color, name, focused }) => {
    // Optimized animation with native driver and reduced re-renders
    const opacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;
    const scale = useRef(new Animated.Value(focused ? 1.05 : 1)).current;

    // Get responsive icon sizes
    const iconSizes = getResponsiveIconSizes();
    const tabWidth = getTabWidth();

    useEffect(() => {
      // Batch animations together for better performance
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: focused ? 1 : 0.6,
          duration: 150, // Reduced for snappier feel
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: focused ? 1.05 : 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused, opacity, scale]);

    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: tabWidth, // Dynamic width based on screen
          paddingHorizontal: 2, // Small padding to prevent edge cutoff
        }}
      >
        <Animated.View
          style={{
            alignItems: "center",
            transform: [{ scale }],
            opacity,
          }}
        >
          <Icon
            stroke={color}
            width={focused ? iconSizes.focused : iconSizes.unfocused}
            height={focused ? iconSizes.focused : iconSizes.unfocused}
            strokeWidth={focused ? 1.5 : 1}
            color={color}
          />

          <Animated.Text
            style={{
              fontSize: iconSizes.fontSize,
              textAlign: "center",
              color: color,
              fontFamily: focused ? POPPINS_FONT.medium : POPPINS_FONT.regular,
              marginTop: iconSizes.marginTop,
              opacity,
              width: tabWidth - 4, // Leave small margin for padding
            }}
            numberOfLines={1}
            adjustsFontSizeToFit={true} // This will shrink font if needed
            minimumFontScale={0.8} // Minimum scale factor
            ellipsizeMode="tail" // Add ... at end if still too long
          >
            {name}
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }
);

const HomeIcon: React.FC<IconProps> = React.memo(({ color, width }) => {
  const iconSizes = getResponsiveIconSizes();
  return (
    <Ionicons
      name="home-outline"
      size={width || iconSizes.gameIcon}
      color={color}
    />
  );
});

const SpeechIcon: React.FC<IconProps> = React.memo(({ color, width }) => {
  const iconSizes = getResponsiveIconSizes();
  return (
    <Ionicons
      name="mic-outline"
      size={width || iconSizes.gameIcon}
      color={color}
    />
  );
});

const TranslateIcon: React.FC<IconProps> = React.memo(({ color, width }) => {
  const iconSizes = getResponsiveIconSizes();
  return (
    <MaterialIcons
      name="translate"
      size={width || iconSizes.gameIcon}
      color={color}
    />
  );
});
const ScanIcon: React.FC<IconProps> = React.memo(({ color, width }) => {
  const iconSizes = getResponsiveIconSizes();
  return (
    <Ionicons
      name="camera-outline"
      size={width || iconSizes.gameIcon}
      color={color}
    />
  );
});

const GameIcon: React.FC<IconProps> = React.memo(({ color, width }) => {
  const iconSizes = getResponsiveIconSizes();
  return (
    <Ionicons
      name="game-controller-outline"
      size={width || iconSizes.gameIcon}
      color={color}
    />
  );
});

const PronounceIcon: React.FC<IconProps> = React.memo(({ color, width }) => {
  const iconSizes = getResponsiveIconSizes();
  return (
    <Ionicons
      name="volume-high-outline"
      size={width || iconSizes.gameIcon}
      color={color}
    />
  );
});

export default function TabsLayout() {
  const [paddingTopAnim] = useState(new Animated.Value(0));
  const { activeTheme } = useThemeStore();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();

  // NEW: Tutorial context
  const { setNavigationHandler, startTutorial } = useTutorial();

  const initialTabParam = (params.initialTab as string) || "Home";

  // FIXED: Start with Home always, don't change based on segments initially
  const [currentTab, setCurrentTab] = useState<string>("Home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialTabProcessed, setInitialTabProcessed] = useState(false);

  // NEW: Enhanced navigation handler for tutorial chaining
  const handleTutorialNavigation = useCallback(
    (tabName: string, tutorialId?: string) => {
      console.log(
        `[TabsLayout] Tutorial navigation to: ${tabName}, tutorial: ${tutorialId}`
      );

      // Navigate to the tab
      router.push(`/(tabs)/${tabName}` as any);

      // If a tutorial ID is provided, start it after navigation
      if (tutorialId) {
        // Wait for navigation to complete, then start the tutorial
        setTimeout(() => {
          const tutorialConfigs = {
            home_tutorial: HOME_TUTORIAL,
            speech_tutorial: SPEECH_TUTORIAL,
            translate_tutorial: TRANSLATE_TUTORIAL,
            scan_tutorial: SCAN_TUTORIAL,
            games_tutorial: GAMES_TUTORIAL,
            pronounce_tutorial: PRONOUNCE_TUTORIAL,
          };

          const tutorialConfig =
            tutorialConfigs[tutorialId as keyof typeof tutorialConfigs];
          if (tutorialConfig) {
            console.log(
              `[TabsLayout] Starting tutorial: ${tutorialConfig.name}`
            );
            startTutorial(tutorialConfig);
          }
        }, 800); // Allow time for tab transition and component mounting
      }
    },
    [router, startTutorial]
  );

  // NEW: Register navigation handler with tutorial context
  useEffect(() => {
    setNavigationHandler(handleTutorialNavigation);
    console.log("[TabsLayout] Tutorial navigation handler registered");
  }, [setNavigationHandler, handleTutorialNavigation]);

  // NEW: Enhanced network bar height change handler with animation
  const handleNetworkBarHeightChange = useCallback(
    (height: number) => {
      // Animate the padding top to match the network bar height
      Animated.timing(paddingTopAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [paddingTopAnim]
  );

  useEffect(() => {
    console.log(`[TabsLayout] Initial tab parameter: ${initialTabParam}`);

    if (initialTabParam && initialTabParam !== "Home" && !initialTabProcessed) {
      console.log(`[TabsLayout] Setting initial tab to: ${initialTabParam}`);
      setCurrentTab(initialTabParam);
      setInitialTabProcessed(true);

      // Preload the initial tab
      setTimeout(() => {
        tabPreloader.preloadTab(initialTabParam);
      }, 100);
    } else if (initialTabParam === "Home") {
      setCurrentTab("Home");
      setInitialTabProcessed(true);

      // Preload Home tab
      setTimeout(() => {
        tabPreloader.preloadTab("Home");
      }, 100);
    }
  }, [initialTabParam, initialTabProcessed]);

  const currentTabColors = useMemo(
    () => ({
      active: activeTheme.tabActiveColor,
      inactive: activeTheme.tabInactiveColor,
      background: activeTheme.tabBarColor,
    }),
    [
      activeTheme.tabActiveColor,
      activeTheme.tabInactiveColor,
      activeTheme.tabBarColor,
    ]
  );

  // Helper function to get the main tab from segments
  const getMainTabFromSegments = useCallback((segments: string[]): string => {
    const mainTabs = [
      "Home",
      "Speech",
      "Translate",
      "Scan",
      "Games",
      "Pronounce",
    ];

    // Find the first segment that matches a main tab
    for (const segment of segments) {
      if (mainTabs.includes(segment)) {
        return segment;
      }
    }

    // If we're in a sub-screen, try to determine the parent tab
    // For example: (games)/LevelSelection should map to Games tab
    if (segments.includes("(games)")) {
      return "Games";
    }
    if (segments.includes("(settings)")) {
      return "Home"; // CHANGED: Settings screens now map to Home tab
    }

    // Default fallback
    return segments[segments.length - 1] || "Home"; // Changed default to Home
  }, []);

  // Optimized tab transition handler
  const handleTabTransition = useCallback(
    async (fromTab: string, toTab: string) => {
      if (isTransitioning) return;

      console.log(`[TabsLayout] Tab transition: ${fromTab} → ${toTab}`);
      setIsTransitioning(true);

      try {
        // Run after interactions for smooth animation
        InteractionManager.runAfterInteractions(async () => {
          try {
            // Parallel operations for better performance
            await Promise.allSettled([
              // Cleanup previous tab (non-blocking)
              Promise.resolve().then(() => {
                if (fromTab && fromTab !== toTab) {
                  tabPreloader.cleanupTab(fromTab);
                }
              }),

              // Preload current tab (priority)
              tabPreloader.preloadTab(toTab),

              // Preload next likely tab (non-blocking)
              Promise.resolve().then(() => {
                setTimeout(() => {
                  tabPreloader.preloadNextTab(toTab);
                }, 500); // Delay to not interfere with current tab loading
              }),
            ]);

            console.log(`[TabsLayout] ✅ Tab transition completed: ${toTab}`);
          } catch (error) {
            console.warn(`[TabsLayout] Tab transition error:`, error);
          } finally {
            setIsTransitioning(false);
          }
        });
      } catch (error) {
        console.error(`[TabsLayout] Tab transition failed:`, error);
        setIsTransitioning(false);
      }
    },
    [isTransitioning]
  );

  // Track current tab from segments with better logic
  useEffect(() => {
    // Skip initial transition when coming from homepage
    if (initialTabParam && !initialTabProcessed) {
      console.log(
        `[TabsLayout] Skipping initial transition for: ${initialTabParam}`
      );
      return;
    }

    const mainTab = getMainTabFromSegments(segments);

    // CRITICAL FIX: Prevent initial transitions during startup
    if (!initialTabProcessed) {
      console.log(
        `[TabsLayout] Skipping segment processing - initial tab not processed yet`
      );
      return;
    }

    // FIXED: Only process if it's a real navigation change, not startup
    if (mainTab && mainTab !== currentTab) {
      const prevTab = currentTab;

      // FIXED: Verify this is a genuine tab change, not initial load
      if (prevTab !== "Home" || (prevTab === "Home" && mainTab !== "Home")) {
        console.log(
          `[TabsLayout] Real tab change detected: ${prevTab} → ${mainTab}`
        );
        setCurrentTab(mainTab);

        const mainTabs = [
          "Home",
          "Speech",
          "Translate",
          "Scan",
          "Games",
          "Pronounce",
        ];
        if (mainTabs.includes(mainTab) && mainTabs.includes(prevTab)) {
          handleTabTransition(prevTab, mainTab);
        }
      }
    }
  }, [
    segments,
    currentTab,
    initialTabProcessed,
    getMainTabFromSegments,
    handleTabTransition,
  ]);

  // Focus effect for additional optimizations
  useFocusEffect(
    useCallback(() => {
      // Ensure current tab is preloaded when focus returns
      if (currentTab) {
        tabPreloader.preloadTab(currentTab);
      }

      return () => {
        // Minimal cleanup on unfocus
      };
    }, [currentTab])
  );

  const tabScreens = React.useMemo(
    () => [
      {
        name: "Home",
        title: "Home",
        icon: HomeIcon,
        iconName: "Home",
      },
      {
        name: "Speech",
        title: "Speech",
        icon: SpeechIcon,
        iconName: "Speech",
      },
      {
        name: "Translate",
        title: "Translate",
        icon: TranslateIcon,
        iconName: "Translate",
      },
      {
        name: "Scan",
        title: "Scan",
        icon: ScanIcon,
        iconName: "Scan",
      },
      {
        name: "Games",
        title: "Games",
        icon: GameIcon,
        iconName: "Games",
      },
      {
        name: "Pronounce",
        title: "Pronounce",
        icon: PronounceIcon,
        iconName: "Pronounce",
      },
    ],
    []
  );

  const TabBarBackground = React.useMemo(
    () => () =>
      (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: currentTabColors.background,
          }}
        />
      ),
    [currentTabColors.background]
  );

  const screenOptions = useMemo(
    () => ({
      tabBarShowLabel: false,
      tabBarActiveTintColor: currentTabColors.active,
      tabBarInactiveTintColor: currentTabColors.inactive,
      tabBarStyle: {
        backgroundColor: currentTabColors.background,
        height: 60,
        paddingTop: 10,
        borderTopWidth: 0,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 0, // Remove horizontal padding to maximize space
      },
      tabBarBackground: TabBarBackground,
      lazy: true,
      headerShown: false,
    }),
    [currentTabColors, TabBarBackground, insets.bottom]
  );

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar
        style="light"
        backgroundColor={activeTheme.backgroundColor}
        translucent={false}
      />

      <NetworkStatusBar onHeightChange={handleNetworkBarHeightChange} />

      <Animated.View
        style={{
          flex: 1,
          paddingTop: paddingTopAnim, // Animated padding
          backgroundColor: activeTheme.backgroundColor,
        }}
      >
        <Tabs screenOptions={screenOptions} initialRouteName="Home">
          {tabScreens.map(({ name, title, icon: Icon, iconName }) => (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                title,
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    Icon={Icon}
                    color={color}
                    name={iconName}
                    focused={focused}
                  />
                ),
                lazy: true,
              }}
            />
          ))}
        </Tabs>
      </Animated.View>
    </View>
  );
}
