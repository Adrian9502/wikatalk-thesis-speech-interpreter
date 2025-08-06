import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/recent/getTabIcon";

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: TabType[] = ["Speech", "Translate", "Scan"];

  // Store tab widths and positions
  const [tabMeasurements, setTabMeasurements] = useState<
    Array<{ x: number; width: number }>
  >([]);

  // For native animation of position only
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // Non-animated currentWidth state for the indicator
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  // Handle container layout to get overall width
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
  };

  // Handle tab layout to record position and width
  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setTabMeasurements((prev) => {
      const newMeasurements = [...prev];
      newMeasurements[index] = { x, width };
      return newMeasurements;
    });
  };

  // Update indicator position and width when activeTab changes
  useEffect(() => {
    const activeIndex = tabs.indexOf(activeTab);
    if (activeIndex >= 0 && tabMeasurements[activeIndex]) {
      const { x, width } = tabMeasurements[activeIndex];

      // Animate position with native driver
      Animated.spring(indicatorPosition, {
        toValue: x,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();

      // Set width directly (no animation)
      setIndicatorWidth(width);
    }
  }, [activeTab, tabMeasurements, tabs, indicatorPosition]);

  return (
    <View style={styles.tabOuterContainer}>
      <View style={styles.tabContainer} onLayout={handleContainerLayout}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => onTabChange(tab)}
            onLayout={(e) => handleTabLayout(index, e)}
          >
            <Feather
              name={getTabIcon(tab)}
              size={18}
              color={activeTab === tab ? BASE_COLORS.white : BASE_COLORS.blue}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Animated Indicator - we set width directly and only animate translateX */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorWidth, // Set width directly (not animated)
              transform: [{ translateX: indicatorPosition }], // Only animate position
            },
          ]}
        />
      </View>
    </View>
  );
};

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
    position: "relative", // For absolute positioned indicator
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    zIndex: 1, // Place above indicator
  },
  indicator: {
    position: "absolute",
    height: "100%",
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 20,
    zIndex: 0, // Place below tabs
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.blue,
  },
  activeTabText: {
    color: BASE_COLORS.white,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
});

export default TabSelector;
