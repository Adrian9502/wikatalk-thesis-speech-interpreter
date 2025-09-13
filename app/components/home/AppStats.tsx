import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { DIALECTS } from "@/constant/languages";
import useThemeStore from "@/store/useThemeStore";

interface AppStatsProps {
  totalPronunciationsCount: string | number;
  overallStats: {
    total: string;
  };
}

const AppStats = React.memo(
  ({ totalPronunciationsCount, overallStats }: AppStatsProps) => {
    const { activeTheme } = useThemeStore();

    const dialectStats = [
      { count: DIALECTS.length, label: "Filipino Dialects" },
      { count: totalPronunciationsCount, label: "Pronunciations" },
      { count: overallStats.total, label: "Game Levels" },
    ];

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>App Statistics</Text>
        <View style={styles.statsContainer}>
          {dialectStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  { color: activeTheme.tabActiveColor },
                ]}
              >
                {stat.count}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: "rgba(255, 255, 255, 0.7)" },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    fontFamily: POPPINS_FONT.semiBold,
    marginBottom: 16,
    color: BASE_COLORS.white,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: COMPONENT_FONT_SIZES.home.statsValue,
    fontFamily: POPPINS_FONT.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: COMPONENT_FONT_SIZES.home.statsLabel,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

AppStats.displayName = "AppStats";
export default AppStats;
