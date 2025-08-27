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
import { MaterialIcons } from "@expo/vector-icons";
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
    initialTabProcessed, // CRITICAL: Only run after initial tab is processed
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

  // FIXED: Memoized tab screen configurations - ONLY 5 tabs (removed Settings completely)
  const tabScreens = React.useMemo(
    () => [
      {
        name: "Home",
        title: "Home",
        icon: (props) => (
          <MaterialIcons
            name="home"
            size={props.width || 18}
            color={props.color}
          />
        ),
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

  // FIXED: TabBarBackground now properly responds to theme changes
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

  // FIXED: Memoize screen options to respond to theme changes
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
      // Add lazy loading for better performance
      lazy: true,
      // Optimize header settings
      headerShown: false,
    }),
    [currentTabColors, TabBarBackground, insets.bottom]
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        style="light"
        backgroundColor={activeTheme.backgroundColor}
        translucent={false}
      />
      <Tabs
        screenOptions={screenOptions}
        // CRITICAL FIX: Always use Home as initial route
        initialRouteName="Home"
      >
        {/* FIXED: Map through only the 5 tabs (Settings completely removed) */}
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
    </View>
  );
}
