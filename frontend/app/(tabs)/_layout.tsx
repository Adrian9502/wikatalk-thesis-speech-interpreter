import { View, Animated, InteractionManager } from "react-native";
import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { Tabs, useLocalSearchParams, useSegments } from "expo-router";
import { Mic, Camera, Globe, Volume2, Home } from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { tabPreloader } from "@/utils/tabPreloader";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetworkStatusBar from "@/components/NetworkStatusBar";

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
          width: 70,
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
            width={focused ? 18 : 17}
            height={focused ? 18 : 17}
            strokeWidth={focused ? 1.5 : 1}
            color={color}
          />

          <Animated.Text
            style={{
              fontSize: 11,
              textAlign: "center",
              color: color,
              fontFamily: focused ? "Poppins-Medium" : "Poppins-Regular",
              marginTop: 5,
              opacity,
            }}
            numberOfLines={1}
          >
            {name}
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }
);

const GameIcon: React.FC<IconProps> = React.memo(({ color, width }) => (
  <Ionicons name="game-controller-outline" size={width} color={color} />
));

export default function TabsLayout() {
  // NEW: Add animated value for padding top
  const [paddingTopAnim] = useState(new Animated.Value(0));
  const { activeTheme } = useThemeStore();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // CRITICAL FIX: Get initial tab from params with proper fallback
  const initialTabParam = (params.initialTab as string) || "Home";

  // FIXED: Start with Home always, don't change based on segments initially
  const [currentTab, setCurrentTab] = useState<string>("Home");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialTabProcessed, setInitialTabProcessed] = useState(false);

  // NEW: Enhanced network bar height change handler with animation
  const handleNetworkBarHeightChange = useCallback(
    (height: number) => {
      // Animate the padding top to match the network bar height
      Animated.timing(paddingTopAnim, {
        toValue: height,
        duration: 300, // Same duration as NetworkStatusBar animation
        useNativeDriver: false, // Cannot use native driver for padding
      }).start();
    },
    [paddingTopAnim]
  );

  // CRITICAL FIX: Process initial tab immediately and prevent transitions
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
    // FIXED: Only include the 5 main tabs (removed Settings)
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
        icon: Home,
        iconName: "Home",
      },
      {
        name: "Speech",
        title: "Speech",
        icon: Mic,
        iconName: "Speech",
      },
      {
        name: "Translate",
        title: "Translate",
        icon: Globe,
        iconName: "Translate",
      },
      {
        name: "Scan",
        title: "Scan",
        icon: Camera,
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
        icon: Volume2,
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

  // FIXED: Update screen options to properly handle network bar spacing
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
      },
      tabBarBackground: TabBarBackground,
      lazy: true,
      headerShown: false,
    }),
    [currentTabColors, TabBarBackground, insets.bottom]
  );

  return (
    // FIXED: Container with proper spacing management
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar
        style="light"
        backgroundColor={activeTheme.backgroundColor}
        translucent={false}
      />

      <NetworkStatusBar onHeightChange={handleNetworkBarHeightChange} />

      {/* FIXED: Animated tabs container with smooth padding animation */}
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
