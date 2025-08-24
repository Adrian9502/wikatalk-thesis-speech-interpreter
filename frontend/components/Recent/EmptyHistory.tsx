import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/recent/getTabIcon";
import useThemeStore from "@/store/useThemeStore";

// Get screen height for proper centering
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EmptyStateProps {
  tabType: TabType;
}

const EmptyHistory: React.FC<EmptyStateProps> = ({ tabType }) => {
  const { activeTheme } = useThemeStore();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <View
          style={[
            styles.emptyIconContainer,
            { backgroundColor: activeTheme.secondaryColor },
          ]}
        >
          <Feather
            name={getTabIcon(tabType)}
            size={24}
            color={TITLE_COLORS.customWhite}
          />
        </View>
        <Text
          style={[styles.emptyTitle, { color: activeTheme.tabActiveColor }]}
        >
          No {tabType} Records
        </Text>
        <Text style={[styles.emptyText, { color: activeTheme.tabActiveColor }]}>
          Your {tabType.toLowerCase()} translations will appear here
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12,
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default EmptyHistory;
