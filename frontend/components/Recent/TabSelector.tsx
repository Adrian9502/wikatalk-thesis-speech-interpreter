import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import {
  TapGestureHandler,
  State,
  TapGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/recent/getTabIcon";

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = React.memo(
  ({ activeTab, onTabChange }) => {
    const tabs: TabType[] = ["Speech", "Translate", "Scan"];

    // Animation and state
    const indicatorPosition = useRef(new Animated.Value(0)).current;
    const [tabMeasurements, setTabMeasurements] = useState<
      Array<{ x: number; width: number }>
    >([]);
    const [indicatorWidth, setIndicatorWidth] = useState(0);

    // Gesture refs
    const tabRefs = useRef<Array<TapGestureHandler | null>>([]);

    // Tab layout handler
    const handleTabLayout = useCallback(
      (index: number, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;

        setTabMeasurements((prev) => {
          const newMeasurements = [...prev];
          newMeasurements[index] = { x, width };
          return newMeasurements;
        });
      },
      []
    );

    // Optimized indicator animation - FIXED: Use only tension/friction, not speed
    const animateIndicator = useCallback(
      (activeIndex: number) => {
        if (activeIndex >= 0 && tabMeasurements[activeIndex]) {
          const { x, width } = tabMeasurements[activeIndex];

          // Animate position with spring - removed conflicting speed parameter
          Animated.spring(indicatorPosition, {
            toValue: x,
            useNativeDriver: true,
            friction: 8,
            tension: 120,
            // Removed speed: 14 to fix the invariant violation
          }).start();

          setIndicatorWidth(width);
        }
      },
      [indicatorPosition, tabMeasurements]
    );

    // Update indicator when active tab changes
    useEffect(() => {
      const activeIndex = tabs.indexOf(activeTab);
      animateIndicator(activeIndex);
    }, [activeTab, animateIndicator, tabs]);

    // Gesture handlers for each tab
    const createTabHandler = useCallback(
      (tab: TabType, index: number) =>
        (event: TapGestureHandlerGestureEvent) => {
          if (event.nativeEvent.state === State.END && tab !== activeTab) {
            onTabChange(tab);
          }
        },
      [activeTab, onTabChange]
    );

    // Memoized tab components
    const tabComponents = useMemo(() => {
      return tabs.map((tab, index) => {
        const isActive = activeTab === tab;

        return (
          <TapGestureHandler
            key={tab}
            ref={(ref) => (tabRefs.current[index] = ref)}
            onHandlerStateChange={createTabHandler(tab, index)}
          >
            <Animated.View
              style={styles.tabButton}
              onLayout={(e) => handleTabLayout(index, e)}
            >
              <Feather
                name={getTabIcon(tab)}
                size={18}
                color={isActive ? BASE_COLORS.white : BASE_COLORS.blue}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </Animated.View>
          </TapGestureHandler>
        );
      });
    }, [tabs, activeTab, createTabHandler, handleTabLayout]);

    return (
      <View style={styles.tabOuterContainer}>
        <View style={styles.tabContainer}>
          {tabComponents}

          {/* Animated Indicator */}
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX: indicatorPosition }],
              },
            ]}
          />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  tabOuterContainer: {
    borderRadius: 20,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    zIndex: 1,
  },
  indicator: {
    position: "absolute",
    height: "100%",
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 20,
    zIndex: 0,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.blue,
  },
  activeTabText: {
    color: BASE_COLORS.white,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
});

export default TabSelector;
