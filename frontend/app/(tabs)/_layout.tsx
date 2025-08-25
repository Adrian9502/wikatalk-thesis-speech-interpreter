import { View, Animated, InteractionManager } from "react-native";
import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { Tabs, useSegments } from "expo-router";
import { Mic, Camera, Settings, Globe, Volume2 } from "react-native-feather";
import useThemeStore from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { tabPreloader } from "@/utils/tabPreloader";
import { useFocusEffect } from "@react-navigation/native";

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
  const [currentTab, setCurrentTab] = useState<string>("Speech");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // FIXED: Use state instead of ref so theme changes trigger re-renders
  const [tabColors] = useState(() => ({
    get active() {
      return activeTheme.tabActiveColor;
    },
    get inactive() {
      return activeTheme.tabInactiveColor;
    },
    get background() {
      return activeTheme.tabBarColor;
    },
  }));

  // FIXED: Create reactive colors that update with theme
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
    // Main tabs that correspond to actual tab bar items
    const mainTabs = [
      "Speech",
      "Translate",
      "Scan",
      "Games",
      "Pronounce",
      "Settings",
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
      return "Settings";
    }

    // Default fallback
    return segments[segments.length - 1] || "Speech";
  }, []);

  // Track current tab from segments with better logic
  useEffect(() => {
    const mainTab = getMainTabFromSegments(segments);

    if (mainTab && mainTab !== currentTab) {
      const prevTab = currentTab;
      setCurrentTab(mainTab);

      // Only handle tab transitions for actual main tab changes
      const mainTabs = [
        "Speech",
        "Translate",
        "Scan",
        "Games",
        "Pronounce",
        "Settings",
      ];
      if (mainTabs.includes(mainTab) && mainTabs.includes(prevTab)) {
        handleTabTransition(prevTab, mainTab);
      }
    }
  }, [segments, currentTab, getMainTabFromSegments]);

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

  // Memoized tab screen configurations
  const tabScreens = React.useMemo(
    () => [
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
      {
        name: "Settings",
        title: "Settings",
        icon: Settings,
        iconName: "Settings",
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
    [currentTabColors.background] // FIXED: Add dependency on background color
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
      },
      tabBarBackground: TabBarBackground,
      // Add lazy loading for better performance
      lazy: true,
      // Optimize header settings
      headerShown: false,
    }),
    [currentTabColors, TabBarBackground] // FIXED: Add dependencies
  );

  return (
    <Tabs screenOptions={screenOptions}>
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
            // Optimize each tab screen
            lazy: name !== "Speech", // Don't lazy load default tab
          }}
        />
      ))}
    </Tabs>
  );
}
