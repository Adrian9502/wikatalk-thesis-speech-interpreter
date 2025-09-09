import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/recent/getTabIcon";
import { Feather } from "@expo/vector-icons";

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: TabType[] = ["Speech", "Translate", "Scan"];
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Calculate indicator position based on active tab
  const getIndicatorPosition = (tab: TabType) => {
    const index = tabs.indexOf(tab);
    return index * (100 / tabs.length);
  };

  // Animate indicator when active tab changes
  useEffect(() => {
    const targetPosition = getIndicatorPosition(activeTab);
    Animated.spring(animatedValue, {
      toValue: targetPosition,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab, animatedValue]);

  const renderTab = (tab: TabType, index: number) => {
    const isActive = activeTab === tab;
    const iconName = getTabIcon(tab);

    return (
      <TouchableOpacity
        key={tab}
        style={styles.tabButton}
        onPress={() => onTabChange(tab)}
        activeOpacity={0.7}
      >
        <Feather
          name={iconName}
          size={14}
          color={isActive ? BASE_COLORS.white : BASE_COLORS.blue}
        />
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* Animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              left: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              width: `${100 / tabs.length}%`,
            },
          ]}
        />

        {/* Tab buttons */}
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.blue,
  },
  activeTabText: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
  },
});

export default TabSelector;
