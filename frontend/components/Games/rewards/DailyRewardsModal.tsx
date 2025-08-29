import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Modal, View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { InteractionManager } from "react-native";
import LottieView from "lottie-react-native";
import useCoinsStore from "@/store/games/useCoinsStore";
import TodayRewardCard from "./dailyRewardsModal/TodayRewardCard";
import RewardCalendar from "./dailyRewardsModal/RewardCalendar";
import ClaimButton from "./dailyRewardsModal/ClaimButton";
import BalanceCard from "./dailyRewardsModal/BalanceCard";
import { getDayRewardAmount } from "@/hooks/useRewards";
import ModalLoading from "@/components/ModalLoading";
import CloseButton from "../buttons/CloseButton";
import { BASE_COLORS } from "@/constant/colors";
// sound
import { playSound } from "@/utils/playSound";

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
  const [modalVisible, setModalVisible] = useState(false);

  // Combined loading state - only one loading state for everything
  const [isLoading, setIsLoading] = useState(true);
  const [renderStartTime] = useState(() => Date.now());

  // Store
  const {
    coins,
    dailyRewardsHistory,
    claimDailyReward,
    isDailyRewardAvailable,
    getRewardsDataSync,
  } = useCoinsStore();

  // Pre-calculate essential data
  const todayReward = useMemo(() => getDayRewardAmount(new Date()), []);
  const dateInfo = useMemo(() => {
    const now = new Date();
    return {
      monthName: now.toLocaleString("default", { month: "long" }),
      year: now.getFullYear(),
    };
  }, []);

  // Show modal immediately with optimized loading
  useEffect(() => {
    if (visible) {
      console.log("[DailyRewardsModal] Show modal immediately");
      setModalVisible(true);
      setIsLoading(true);

      // IMPORTANT: Use cached data immediately if available
      const { isDailyRewardAvailable } = getRewardsDataSync();
      setClaimedToday(!isDailyRewardAvailable);

      // Use InteractionManager to defer rendering until after modal animation
      InteractionManager.runAfterInteractions(() => {
        // Only one phase: once everything is ready, stop loading
        setTimeout(() => {
          setIsLoading(false);
          console.log(
            `[DailyRewardsModal] Full render completed in ${
              Date.now() - renderStartTime
            }ms`
          );
        }, 100);
      });
    } else {
      setModalVisible(false);
    }
  }, [visible, getRewardsDataSync, renderStartTime]);

  // Update claimed state when reward status changes
  useEffect(() => {
    setClaimedToday(!isDailyRewardAvailable);
  }, [isDailyRewardAvailable]);

  // Optimistic UI update for claiming
  const handleClaimReward = useCallback(async () => {
    // Update UI immediately
    setClaimedToday(true);
    setClaimAnimation(true);
    // play sound
    playSound("coinClaim");
    // Make the API call in the background
    const rewardAmount = await claimDailyReward();

    // Handle edge cases
    if (!rewardAmount) {
      setClaimedToday(false);
      setClaimAnimation(false);
    }

    // Hide animation after delay
    setTimeout(() => setClaimAnimation(false), 2000);
  }, [claimDailyReward]);

  // Clean modal close
  const handleClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  // Skip rendering completely if not visible
  if (!visible && !modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#314bcfff", "#4c41beff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <CloseButton size={17} onPress={handleClose}></CloseButton>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Daily Rewards</Text>
            </View>
            {isLoading ? (
              <View style={styles.fullHeightLoader}>
                <ModalLoading />
              </View>
            ) : (
              <>
                {/* Today's Reward Card */}
                <TodayRewardCard
                  rewardAmount={todayReward}
                  isAvailable={isDailyRewardAvailable}
                  claimedToday={claimedToday}
                />

                {/* Calendar section - no separate loading indicator */}
                {dailyRewardsHistory ? (
                  <RewardCalendar
                    monthName={dateInfo.monthName}
                    year={dateInfo.year}
                    visible={visible}
                    dailyRewardsHistory={dailyRewardsHistory}
                  />
                ) : (
                  <View style={styles.calendarPlaceholder} />
                )}

                {/* Claim Button */}
                <ClaimButton
                  isAvailable={isDailyRewardAvailable}
                  claimedToday={claimedToday}
                  onClaim={handleClaimReward}
                />

                {/* Balance */}
                <BalanceCard balance={coins} />
              </>
            )}
          </LinearGradient>

          {/* Claim Animation */}
          {claimAnimation && (
            <View style={styles.animationOverlay}>
              <LottieView
                ref={lottieRef}
                source={require("@/assets/animations/coin-animation.json")}
                autoPlay
                loop={false}
                style={styles.coinAnimation}
                onAnimationFinish={() => setClaimAnimation(false)}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    marginBottom: 12,
    position: "relative",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
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
  calendarPlaceholder: {
    height: 120,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    marginVertical: 16,
  },
  fullHeightLoader: {
    height: 420,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(DailyRewardsModal);
