import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { X, Check } from "react-native-feather";
import LottieView from "lottie-react-native";
import useCoinsStore from "@/store/games/useCoinsStore";

// Constants
const COIN_REWARDS = {
  weekday: 25,
  weekend: 50,
};

interface DailyRewardsModalProps {
  visible: boolean;
  onClose: () => void;
}

const getDayRewardAmount = (date: Date): number => {
  const day = date.getDay();
  return day === 0 || day === 6 ? COIN_REWARDS.weekend : COIN_REWARDS.weekday;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const formatDateForComparison = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  visible,
  onClose,
}) => {
  const [claimAnimation, setClaimAnimation] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [currentMonth] = useState(new Date());

  // Add ref for ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    coins,
    dailyRewardsHistory,
    fetchRewardsHistory,
    claimDailyReward,
    checkDailyReward,
    isDailyRewardAvailable,
  } = useCoinsStore();

  // Reset claim state when modal visibility changes
  useEffect(() => {
    if (visible) {
      // Reset local state when the modal becomes visible
      setClaimedToday(false);
      setClaimAnimation(false);

      // Fetch fresh data each time modal opens
      fetchRewardsHistory();
      checkDailyReward();
    }
  }, [visible, fetchRewardsHistory, checkDailyReward]);

  // Update local state based on global state
  useEffect(() => {
    if (!isDailyRewardAvailable) {
      setClaimedToday(true);
    }
  }, [isDailyRewardAvailable]);

  const handleClaimReward = async () => {
    const rewardAmount = await claimDailyReward();
    if (rewardAmount) {
      setClaimAnimation(true);
      setClaimedToday(true);
      setTimeout(() => setClaimAnimation(false), 2000);
    }
  };

  // Generate rewards data for all days in the current month
  const generateMonthlyRewards = () => {
    const today = new Date();
    const todayFormatted = formatDateForComparison(today);
    const rewards = [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    // Prepare claimed dates map
    const claimedDatesMap: Record<string, boolean> = {};
    if (dailyRewardsHistory?.claimedDates) {
      dailyRewardsHistory.claimedDates.forEach((claimed) => {
        const date = claimed.date.split("T")[0];
        claimedDatesMap[date] = true;
      });
    }

    // Generate data for each day in the month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const date = new Date(year, month, dayNum);
      const dateFormatted = formatDateForComparison(date);
      const reward = getDayRewardAmount(date);

      let status: "claimed" | "today" | "upcoming" | "missed" = "upcoming";

      // Determine status
      if (dateFormatted === todayFormatted) {
        // Today
        status = isDailyRewardAvailable && !claimedToday ? "today" : "claimed";
      } else if (dateFormatted < todayFormatted) {
        // Past days
        status = claimedDatesMap[dateFormatted] ? "claimed" : "missed";
      } else {
        // Future days
        status = "upcoming";
      }

      rewards.push({
        day: dayNum,
        date: dateFormatted,
        reward,
        status,
      });
    }

    return rewards;
  };

  // Auto-scroll to today's reward when modal opens and data is ready
  useEffect(() => {
    if (visible && scrollViewRef.current) {
      const today = new Date();
      const todayDay = today.getDate();

      // Add a small delay to ensure the ScrollView is rendered
      const scrollTimer = setTimeout(() => {
        const cardWidth = 70; // Width of each day card
        const cardMargin = 8; // Total horizontal margin (4 * 2)
        const totalCardWidth = cardWidth + cardMargin;

        // Calculate scroll position to center today's card
        // Subtract a few cards to show some context before today
        const scrollToIndex = Math.max(0, todayDay - 3);
        const scrollX = scrollToIndex * totalCardWidth;

        scrollViewRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
      }, 300); // Small delay to ensure modal animation is complete

      return () => clearTimeout(scrollTimer);
    }
  }, [visible, dailyRewardsHistory]); // Also depend on dailyRewardsHistory to scroll after data loads

  const monthlyRewards = generateMonthlyRewards();
  const todayReward = getDayRewardAmount(new Date());
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animatable.View animation="fadeIn" duration={300} style={styles.overlay}>
        <Animatable.View
          animation="slideInUp"
          duration={400}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={["#3B4DA3", "#251D79"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Daily Rewards</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X width={18} height={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Today's Reward Card */}
            <Animatable.View
              animation="fadeInDown"
              delay={200}
              style={styles.todayCard}
            >
              <View style={styles.todayHeader}>
                <Text style={styles.todayLabel}>Today's Reward</Text>
                <View
                  style={
                    isDailyRewardAvailable && !claimedToday
                      ? styles.availableBadge
                      : styles.claimedBadge
                  }
                >
                  <Text style={styles.badgeText}>
                    {isDailyRewardAvailable && !claimedToday
                      ? "AVAILABLE"
                      : "CLAIMED"}
                  </Text>
                </View>
              </View>
              <View style={styles.rewardContainer}>
                <Image
                  source={require("@/assets/images/coin.png")}
                  style={{ width: 33, height: 33, marginRight: 8 }}
                />
                <Text style={styles.rewardAmount}>{todayReward} coins</Text>
              </View>
              <Text style={styles.claimText}>
                {isDailyRewardAvailable && !claimedToday
                  ? "Claim your daily reward to earn coins!"
                  : "You've claimed your reward for today."}
              </Text>
            </Animatable.View>

            {/* Month Display */}
            <View style={styles.monthDisplay}>
              <Text style={styles.monthText}>
                {monthName} {year}
              </Text>
            </View>

            {/* Days Grid */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rewardsGrid}
            >
              {monthlyRewards.map((item, index) => (
                <View
                  key={`day-${item.day}`}
                  style={[
                    styles.dayCard,
                    item.status === "today" && styles.todayDayCard,
                    item.status === "claimed" && styles.claimedDayCard,
                    item.status === "missed" && styles.missedDayCard,
                  ]}
                >
                  <Text style={styles.dayLabel}>Day {item.day}</Text>
                  {item.status === "claimed" ? (
                    <View style={styles.checkMark}>
                      <Check width={10} height={10} color="#FFF" />
                    </View>
                  ) : item.status === "today" ? (
                    <View style={styles.todayIndicator}>
                      <Image
                        source={require("@/assets/images/coin.png")}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                  ) : item.status === "missed" ? (
                    <View style={styles.missedIndicator}>
                      <X width={10} height={10} color="#FFF" />
                    </View>
                  ) : (
                    <View style={styles.upcomingIndicator}>
                      <Image
                        source={require("@/assets/images/coin.png")}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                  )}
                  <Text style={styles.dayReward}>{item.reward}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Claim Button */}
            {isDailyRewardAvailable && !claimedToday ? (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={handleClaimReward}
              >
                <Text style={styles.claimButtonText}>CLAIM REWARD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.alreadyClaimedButton}>
                <Text style={styles.alreadyClaimedText}>REWARD CLAIMED</Text>
              </View>
            )}

            {/* Balance */}
            <View style={styles.balanceContainer}>
              <View style={styles.balanceCard}>
                <Image
                  source={require("@/assets/images/coin.png")}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                <View>
                  <Text style={styles.balanceLabel}>Your Balance</Text>
                  <Text style={styles.balanceValue}>{coins} coins</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Claim Animation */}
          {claimAnimation && (
            <View style={styles.animationOverlay}>
              <LottieView
                source={require("@/assets/animations/coin-animation.json")}
                autoPlay
                loop={false}
                style={styles.coinAnimation}
              />
            </View>
          )}
        </Animatable.View>
      </Animatable.View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
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
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
  },
  todayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
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
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
  },
  availableBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  claimedBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
  },
  claimText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  monthDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
  },
  rewardsGrid: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginBottom: 20,
  },
  dayCard: {
    width: 70,
    height: 90,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
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
  checkMark: {
    width: 20,
    height: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
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
    borderRadius: 16,
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
  dayReward: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
  },
  claimButton: {
    backgroundColor: "#FFD700",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  claimButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  alreadyClaimedButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  alreadyClaimedText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "rgba(255,255,255,0.7)",
  },
  balanceContainer: {
    marginTop: 4,
  },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.7)",
  },
  balanceValue: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
  },
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
    width: 250,
    height: 250,
  },
});

export default DailyRewardsModal;
