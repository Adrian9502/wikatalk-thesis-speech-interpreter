import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import {
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
} from "@/constant/fontSizes";

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
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
  },

  // Today's reward card styles
  todayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  availableBadge: {
    backgroundColor: BASE_COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  claimedBadge: {
    backgroundColor: "#757575",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textTransform: "uppercase",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: FONT_SIZES["4xl"],
    fontFamily: POPPINS_FONT.bold,
    color: "#FFD700",
  },
  claimText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },

  // Month display styles
  monthDisplay: {
    alignItems: "center",
    marginBottom: 12,
  },
  monthText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },

  // Calendar grid styles
  rewardsGrid: {
    paddingHorizontal: 8,
    gap: 8,
  },
  dayCard: {
    width: 70,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  todayDayCard: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderColor: BASE_COLORS.yellow,
    borderWidth: 1.5,
  },
  claimedDayCard: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: BASE_COLORS.success,
  },
  missedDayCard: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    borderColor: BASE_COLORS.danger,
  },
  dayLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  dayReward: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.yellow,
    textAlign: "center",
  },

  // Indicator styles
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BASE_COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  todayIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  missedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BASE_COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Buttons
  claimButton: {
    backgroundColor: BASE_COLORS.success,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginVertical: 16,
  },
  claimButtonText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textTransform: "uppercase",
  },
  alreadyClaimedButton: {
    backgroundColor: "rgba(117, 117, 117, 0.8)",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginVertical: 16,
  },
  alreadyClaimedText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
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
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  balanceLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.description, // Changed from hardcoded 12
    fontFamily: POPPINS_FONT.medium, // Changed from "Poppins-Medium"
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
});
