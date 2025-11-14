import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Target, TrendingUp } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface QuickStatsProps {
  overallStats: {
    completed: string;
    total: string;
    percentage: string;
  };
  coins: number;
}

const QuickStats = React.memo(({ overallStats, coins }: QuickStatsProps) => {
  const quickStats = [
    {
      icon: <Target width={18} height={18} color="#60a5fa" />,
      label: "Quiz Levels",
      value: overallStats.completed,
      subValue: `of ${overallStats.total}`,
      accentColor: "#60a5fa",
    },
    {
      icon: <TrendingUp width={18} height={18} color="#f87171" />,
      label: "Progress",
      value: overallStats.percentage,
      subValue: "completion",
      accentColor: "#f87171",
    },
    {
      icon: (
        <Image
          source={require("@/assets/images/coin.png")}
          style={styles.coinImage}
        />
      ),
      label: "Coins",
      value: coins.toString(),
      subValue: "earned",
      accentColor: "#fbbf24",
    },
  ];

  return (
    <View style={styles.quickStatsSection}>
      <Text style={styles.sectionTitle}>Your Game Progress</Text>
      <View style={styles.statsContainer}>
        {quickStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.leftSection}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: `${stat.accentColor}15` },
                  ]}
                >
                  {stat.icon}
                </View>
                <View style={styles.labelSection}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSubValue}>{stat.subValue}</Text>
                </View>
              </View>
              <Text style={[styles.statValue, { color: stat.accentColor }]}>
                {stat.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  quickStatsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    fontFamily: POPPINS_FONT.semiBold,
    marginBottom: 16,
    color: BASE_COLORS.white,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  labelSection: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  statSubValue: {
    fontSize: COMPONENT_FONT_SIZES.home.featuredDescription,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.5)",
  },
  statValue: {
    fontSize: COMPONENT_FONT_SIZES.home.statsValue,
    fontFamily: POPPINS_FONT.bold,
    textAlign: "right",
  },
  coinImage: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
});

QuickStats.displayName = "QuickStats";
export default QuickStats;
