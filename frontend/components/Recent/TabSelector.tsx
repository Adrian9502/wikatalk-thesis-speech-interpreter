import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/Recent/getTabIcon";

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: TabType[] = ["Speech", "Translate", "Scan"];

  return (
    <View style={styles.tabOuterContainer}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => onTabChange(tab)}
          >
            <Feather
              name={getTabIcon(tab)}
              size={20}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabOuterContainer: {
    borderRadius: 14,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: BASE_COLORS.lightBlue,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: BASE_COLORS.blue,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.blue,
  },
  activeTabText: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-SemiBold",
  },
});

export default TabSelector;
