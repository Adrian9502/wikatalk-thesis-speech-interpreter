import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
import { StyleSheet, Platform } from "react-native";

export const rewardStyles = StyleSheet.create({
  // Modal container styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 380,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  gradientBackground: {
    padding: 20,
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },

  // Today's reward card styles
  todayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  availableBadge: {
    backgroundColor: BASE_COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  claimedBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
  claimText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },

  // Month display styles
  monthDisplay: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },

  // Calendar grid styles
  rewardsGrid: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginBottom: 20,
  },
  dayCard: {
    width: 70,
    height: 90,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  todayDayCard: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  claimedDayCard: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
  },
  missedDayCard: {
    backgroundColor: "rgba(244, 67, 54, 0.3)",
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
    marginBottom: 4,
  },
  dayReward: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
  },

  // Indicator styles
  checkMark: {
    width: 20,
    height: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  missedIndicator: {
    width: 20,
    height: 20,
    backgroundColor: "#F44336",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  todayIndicator: {
    width: 20,
    height: 20,
    backgroundColor: "#FFD700",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  upcomingIndicator: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  // Buttons
  claimButton: {
    backgroundColor: ICON_COLORS.brightYellow,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  claimButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  alreadyClaimedButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  alreadyClaimedText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "rgba(255,255,255,0.7)",
  },

  // Balance card
  balanceContainer: {
    marginTop: 4,
  },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.7)",
  },
  balanceValue: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
  },

  // Animation overlay
  animationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  coinAnimation: {
    width: 150,
    height: 150,
  },
});
