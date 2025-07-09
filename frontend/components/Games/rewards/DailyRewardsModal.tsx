import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "react-native-feather";
import { InteractionManager } from "react-native";
import LottieView from "lottie-react-native";
import useCoinsStore from "@/store/games/useCoinsStore";
import TodayRewardCard from "./dailyRewardsModal/TodayRewardCard";
import RewardCalendar from "./dailyRewardsModal/RewardCalendar";
import ClaimButton from "./dailyRewardsModal/ClaimButton";
import BalanceCard from "./dailyRewardsModal/BalanceCard";
import { getDayRewardAmount } from "@/hooks/useRewards";

interface DailyRewardsModalProps {
  visible: boolean;
  onClose: () => void;
}

// The most minimal possible content for instant display
const InitialLoadingView = React.memo(() => (
  <View style={styles.initialLoadingContainer}>
    <ActivityIndicator size="large" color="#fff" />
  </View>
));

const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  visible,
  onClose,
}) => {
  // Animation refs and state
  const lottieRef = useRef<LottieView>(null);
  const [claimAnimation, setClaimAnimation] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Two-phase rendering states
  const [initialRender, setInitialRender] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [calendarReady, setCalendarReady] = useState(false);
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

  // PHASE 1: Show modal immediately
  useEffect(() => {
    if (visible) {
      console.log("[DailyRewardsModal] Show modal immediately");
      setModalVisible(true);

      // Reset states
      setInitialRender(true);
      setContentReady(false);
      setCalendarReady(false);

      // IMPORTANT: Use cached data immediately if available
      const { dailyRewardsHistory, isDailyRewardAvailable } =
        getRewardsDataSync();
      setClaimedToday(!isDailyRewardAvailable);

      // Use InteractionManager to defer rendering until after modal animation
      InteractionManager.runAfterInteractions(() => {
        // First phase: Show basic content (header, today card, claim button)
        setTimeout(() => {
          setInitialRender(false);
          setContentReady(true);

          // Second phase: Delay heavy calendar rendering
          setTimeout(() => {
            setCalendarReady(true);
            console.log(
              `[DailyRewardsModal] Full render completed in ${
                Date.now() - renderStartTime
              }ms`
            );
          }, 50);
        }, 50);
      });
    } else {
      setModalVisible(false);
    }
  }, [visible, getRewardsDataSync]);

  // Update claimed state when reward status changes
  useEffect(() => {
    setClaimedToday(!isDailyRewardAvailable);
  }, [isDailyRewardAvailable]);

  // Optimistic UI update for claiming
  const handleClaimReward = useCallback(async () => {
    // Update UI immediately
    setClaimedToday(true);
    setClaimAnimation(true);

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

  const loading = true;
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
          {initialRender ? (
            <InitialLoadingView />
          ) : (
            <LinearGradient
              colors={["#3B4DA3", "#251D79"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
              {/* Header - Always show immediately */}
              <View style={styles.header}>
                <Text style={styles.title}>Daily Rewards</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <X width={18} height={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* PHASE 1: Essential content */}
              {contentReady && (
                <>
                  {/* Today's Reward Card */}
                  <TodayRewardCard
                    rewardAmount={todayReward}
                    isAvailable={isDailyRewardAvailable}
                    claimedToday={claimedToday}
                  />

                  {/* PHASE 2: Heavy calendar component */}
                  {calendarReady ? (
                    dailyRewardsHistory && (
                      <RewardCalendar
                        monthName={dateInfo.monthName}
                        year={dateInfo.year}
                        visible={visible && calendarReady}
                        dailyRewardsHistory={dailyRewardsHistory}
                      />
                    )
                  ) : (
                    <View style={styles.calendarPlaceholder}>
                      <ActivityIndicator color="#FFD700" size="small" />
                    </View>
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
          )}

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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 380,
    borderRadius: 16,
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
  initialLoadingContainer: {
    height: 400,
    backgroundColor: "#3B4DA3",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    maxWidth: 380,
    borderRadius: 16,
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
    borderRadius: 16,
  },
  coinAnimation: {
    width: 250,
    height: 250,
  },
  calendarPlaceholder: {
    height: 120,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    marginVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(DailyRewardsModal);
