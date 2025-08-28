import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Target, TrendingUp } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

const { width: screenWidth } = Dimensions.get("window");

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
      icon: <Target width={14} height={14} color={BASE_COLORS.yellow} />,
      label: "Quiz Levels",
      value: overallStats.completed,
      subValue: `${overallStats.total} total`,
      color: BASE_COLORS.yellow,
    },
    {
      icon: <TrendingUp width={14} height={14} color={BASE_COLORS.success} />,
      label: "Progress",
      value: overallStats.percentage,
      subValue: "completion",
      color: BASE_COLORS.success,
    },
    {
      icon: (
        <Image
          source={require("@/assets/images/coin.png")}
          style={styles.rewardCoinImage}
        />
      ),
      label: "Coins",
      value: coins.toString(),
      subValue: "earned",
      color: BASE_COLORS.yellow,
    },
  ];

  return (
    <View style={styles.quickStatsSection}>
      <Text style={styles.sectionTitle}>Your Game Progress</Text>
      <View style={styles.quickStatsGrid}>
        {quickStats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.quickStatCard,
              {
                borderColor: "rgba(255, 255, 255, 0.1)",
              },
            ]}
          >
            <View style={styles.quickStatHeader}>
              {stat.icon}
              <Text
                style={[
                  styles.quickStatLabel,
                  { color: "rgba(255, 255, 255, 0.7)" },
                ]}
              >
                {stat.label}
              </Text>
            </View>
            <Text
              style={[
                styles.quickStatValue,
                { color: stat.color || BASE_COLORS.white },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                styles.quickStatSubValue,
                { color: "rgba(255, 255, 255, 0.6)" },
              ]}
            >
              {stat.subValue}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  quickStatsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
    color: BASE_COLORS.white,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  quickStatCard: {
    width: screenWidth < 350 ? "100%" : screenWidth < 400 ? "48%" : "31%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 10,
  },
  quickStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  quickStatLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  quickStatValue: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    marginBottom: 2,
  },
  quickStatSubValue: {
    fontSize: 9,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
  },
  rewardCoinImage: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
});

QuickStats.displayName = "QuickStats";
export default QuickStats;
