import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "react-native-feather";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import useCoinsStore from "@/store/games/useCoinsStore";
import TodayRewardCard from "./dailyRewardsModal/TodayRewardCard";
import RewardCalendar from "./dailyRewardsModal/RewardCalendar";
import ClaimButton from "./dailyRewardsModal/ClaimButton";
import BalanceCard from "./dailyRewardsModal/BalanceCard";
import {
  getDayRewardAmount,
  formatDateForComparison,
} from "@/hooks/useRewards";

interface DailyRewardsModalProps {
  visible: boolean;
  onClose: () => void;
}

const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  visible,
  onClose,
}) => {
  // Animation refs and state
  const lottieRef = useRef<LottieView>(null);
  const [claimAnimation, setClaimAnimation] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [modalVisible, setModalVisible] = useState(visible);

  // Store
  const {
    coins,
    dailyRewardsHistory,
    fetchRewardsHistory,
    claimDailyReward,
    checkDailyReward,
    isDailyRewardAvailable,
  } = useCoinsStore();

  // Update modal visibility to match prop
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
    }
  }, [visible]);

  // Prefetch data when component mounts
  useEffect(() => {
    // Load rewards data in the background when component mounts
    const prefetchData = async () => {
      await Promise.all([fetchRewardsHistory(), checkDailyReward()]);
    };

    prefetchData();
  }, []);

  // Reset claim state when modal visibility changes
  useEffect(() => {
    if (visible) {
      // Just check if reward is available, don't reload everything
      checkDailyReward();
      setClaimedToday(false);
    }
  }, [visible]);

  // Update local claimed state based on global state
  useEffect(() => {
    if (!isDailyRewardAvailable) {
      setClaimedToday(true);
    }
  }, [isDailyRewardAvailable]);

  // Memoized claim handler
  const handleClaimReward = useCallback(async () => {
    const rewardAmount = await claimDailyReward();
    if (rewardAmount) {
      setClaimAnimation(true);
      setClaimedToday(true);
      // Use timeout for cleanup
      setTimeout(() => setClaimAnimation(false), 2000);
    }
  }, [claimDailyReward]);

  // Handle modal close with delay
  const handleClose = useCallback(() => {
    // First hide the modal
    setModalVisible(false);

    // Then call the parent's onClose after animation
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  // Get today's reward amount
  const todayReward = getDayRewardAmount(new Date());

  // Get date info once, don't recalculate
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();

  if (!visible && !modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#3B4DA3", "#251D79"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Daily Rewards</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <X width={18} height={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Today's Reward Card */}
            <TodayRewardCard
              rewardAmount={todayReward}
              isAvailable={isDailyRewardAvailable}
              claimedToday={claimedToday}
            />

            {/* Rewards Calendar */}
            <RewardCalendar
              monthName={monthName}
              year={year}
              visible={visible}
              dailyRewardsHistory={dailyRewardsHistory}
            />

            {/* Claim Button */}
            <ClaimButton
              isAvailable={isDailyRewardAvailable}
              claimedToday={claimedToday}
              onClaim={handleClaimReward}
            />

            {/* Balance */}
            <BalanceCard balance={coins} />
          </LinearGradient>

          {/* Claim Animation - Only render when needed */}
          {claimAnimation && (
            <View style={styles.animationOverlay}>
              <LottieView
                ref={lottieRef}
                source={require("@/assets/animations/coin-animation.json")}
                autoPlay
                loop={false}
                style={styles.coinAnimation}
                cacheStrategy="strong"
                onAnimationFinish={() => setClaimAnimation(false)}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Optimized styles with cached values
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

export default React.memo(DailyRewardsModal);
