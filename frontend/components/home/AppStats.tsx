import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
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
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
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
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

AppStats.displayName = "AppStats";
export default AppStats;
