// File: components/Recent/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/Recent/getTabIcon";
import useThemeStore from "@/store/useThemeStore";

interface EmptyStateProps {
  tabType: TabType;
}

const EmptyHistory: React.FC<EmptyStateProps> = ({ tabType }) => {
  const { activeTheme } = useThemeStore();
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: activeTheme.secondaryColor },
        ]}
      >
        <Feather
          name={getTabIcon(tabType)}
          size={32}
          color={TITLE_COLORS.customWhite}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: activeTheme.tabActiveColor }]}>
        No {tabType} Records
      </Text>
      <Text style={[styles.emptyText, { color: activeTheme.tabActiveColor }]}>
        Your {tabType.toLowerCase()} translations will appear here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "red",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: BASE_COLORS.darkText,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
});

export default EmptyHistory;
