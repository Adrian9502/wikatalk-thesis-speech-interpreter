import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "react-native-feather";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import { Clock } from "react-native-feather";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import { formatTimerDisplay } from "@/utils/gameUtils";
import { calculateResetCost } from "@/utils/resetCostUtils";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import { useUserProgress } from "@/hooks/useUserProgress";
import useCoinsStore from "@/store/games/useCoinsStore";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { useSplashStore } from "@/store/useSplashStore";
import ResetButton from "./buttons/ResetButton";

interface StatsContainerProps {
  difficulty: string;
  focusArea?: string;
  showTimer?: boolean;
  timerRunning?: boolean;
  initialTime?: number;
  isStarted?: boolean;
  animationDelay?: number;
  variant?: "playing" | "completed";
  finalTime?: number;
  levelId?: number | string;
  onTimerReset?: () => void;
  isCorrectAnswer?: boolean;
}

const StatsContainer: React.FC<StatsContainerProps> = ({
  difficulty,
  focusArea = "Vocabulary",
  showTimer = false,
  timerRunning = false,
  initialTime = 0,
  isStarted = true,
  animationDelay = 100,
  variant = "playing",
  finalTime,
  levelId,
  onTimerReset,
  isCorrectAnswer = false,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentTime, setCurrentTime] = useState(finalTime || 0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [wasActualReset, setWasActualReset] = useState(false);
  const [showResetSuccessIndicator, setShowResetSuccessIndicator] =
    useState(false);

  // Get user progress and coins
  const { resetTimer } = useUserProgress(levelId || "");
  const { coins, fetchCoinsBalance } = useCoinsStore();

  // Calculate reset cost for completed state
  const resetCost = React.useMemo(() => {
    if (variant === "completed" && (finalTime || currentTime)) {
      return calculateResetCost(finalTime || currentTime);
    }
    return 0; // Default
  }, [variant, finalTime, currentTime]);

  // Check if user can afford reset
  const canAfford = coins >= resetCost;

  // UPDATED: Enhanced disable logic
  const shouldDisableReset =
    !canAfford || isCorrectAnswer || (currentTime || finalTime || 0) === 0;

  // Handle reset button press
  const handleResetPress = useCallback(() => {
    if (
      variant === "completed" &&
      levelId &&
      !isCorrectAnswer &&
      (currentTime || finalTime || 0) > 0
    ) {
      setShowResetModal(true);
      setShowSuccessMessage(false);
    }
  }, [variant, levelId, isCorrectAnswer, currentTime, finalTime]);

  const handleConfirmReset = useCallback(async () => {
    if (!levelId || isResetting) return;

    try {
      setIsResetting(true);

      const result = await resetTimer(levelId);

      if (result.success) {
        // Update current time to 0
        setCurrentTime(0);
        // NEW: Mark this as an actual paid reset
        setWasActualReset(true);
        // NEW: Show permanent success indicator
        setShowResetSuccessIndicator(true);
        fetchCoinsBalance(true);

        // NEW: Call the parent's timer reset callback to update finalTime
        if (onTimerReset) {
          console.log(
            "[StatsContainer] Calling parent's onTimerReset callback"
          );
          onTimerReset();
        }

        const coinsDeducted = result.coinsDeducted || resetCost;
        const successMsg = `Timer reset successfully! 🪙 ${coinsDeducted} coins deducted.`;

        setResetMessage(successMsg);
        setShowSuccessMessage(true);

        console.log(
          `[StatsContainer] Timer reset successfully - staying on completed screen`
        );

        // Clear the game store's timer state BUT don't restart
        const gameStore = useGameStore.getState();
        gameStore.resetTimer();
        gameStore.setTimeElapsed(0);

        // Clear any cached progress for this level
        const progressStore = useProgressStore.getState();
        progressStore.clearCache();

        // Force refresh global progress
        progressStore.fetchProgress(true);

        // Clear splash store cache for this level
        const splashStore = useSplashStore.getState();

        // Get the existing individual progress first
        const existingProgress = splashStore.getIndividualProgress
          ? splashStore.getIndividualProgress(String(levelId))
          : null;

        // Update with reset progress using the correct method
        if (splashStore.setIndividualProgress) {
          const resetProgress = existingProgress
            ? {
                ...existingProgress,
                totalTimeSpent: 0,
                lastAttemptTime: 0,
                attempts: [],
              }
            : {
                totalTimeSpent: 0,
                lastAttemptTime: 0,
                attempts: [],
                completed: false,
                quizId: String(levelId),
              };

          splashStore.setIndividualProgress(String(levelId), resetProgress);
          console.log(
            `[StatsContainer] Updated splash store cache for level ${levelId}`
          );
        }

        console.log(`[StatsContainer] All caches cleared after timer reset`);
      } else {
        console.error(`[StatsContainer] Reset failed:`, result.message);
        setResetMessage("Reset failed. Please try again.");
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error(`[StatsContainer] Reset error:`, error);
      setResetMessage("Reset failed. Please try again.");
      setShowSuccessMessage(true);
    } finally {
      setIsResetting(false);
    }
  }, [levelId, resetTimer, fetchCoinsBalance, resetCost, onTimerReset]);

  // NEW: Reset the wasActualReset flag when time changes (from retry)
  useEffect(() => {
    if (finalTime !== 0 && wasActualReset) {
      setWasActualReset(false);
    }
  }, [finalTime, wasActualReset]);

  // NEW: Reset the success indicator when time changes (from retry)
  useEffect(() => {
    if (finalTime !== 0 && showResetSuccessIndicator) {
      setShowResetSuccessIndicator(false);
    }
  }, [finalTime, showResetSuccessIndicator]);

  const handleSuccessAcknowledge = useCallback(() => {
    console.log(
      "[StatsContainer] Success acknowledged - keeping completed state"
    );

    setShowSuccessMessage(false);
    setShowResetModal(false);
    setWasActualReset(false); // Reset the flag

    console.log(
      "[StatsContainer] Timer reset completed, staying on completed screen"
    );
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isResetting && !showSuccessMessage) {
      setShowResetModal(false);
    }
  }, [isResetting, showSuccessMessage]);

  const renderStaticTimer = () => (
    <View style={styles.staticTimerContainer}>
      <View style={styles.timeContainer}>
        <Clock width={16} height={16} color={BASE_COLORS.white} />
        <Text style={styles.staticTimerText}>
          {/*  For background completion, prefer finalTime, but use currentTime as updated */}
          {formatTimerDisplay(
            finalTime !== undefined ? finalTime : currentTime
          )}
        </Text>
      </View>

      {variant === "completed" && levelId && (
        <ResetButton
          onPress={handleResetPress}
          disabled={shouldDisableReset}
          cost={resetCost}
          variant="compact"
          size="small"
          showCostLabel={false}
          showOnlyWhen={variant === "completed" && !!levelId}
          buttonStyle={
            shouldDisableReset ? styles.resetButtonDisabled : undefined
          }
        />
      )}
      {/* Show reset success indicator when timer is 0 and was reset */}
      {showResetSuccessIndicator && (currentTime || finalTime || 0) === 0 && (
        <View style={styles.resetSuccessIndicator}>
          <Text style={styles.resetSuccessText}>
            🎉 Timer Reset Successfully!
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Animatable.View
        animation="slideInDown"
        duration={800}
        delay={animationDelay}
        style={[
          styles.statsContainer,
          variant === "completed" && styles.completedStatsContainer,
        ]}
      >
        {/* Timer Section - Always show when showTimer is true */}
        {showTimer && (
          <Animatable.View
            animation="fadeInLeft"
            duration={600}
            delay={animationDelay + 100}
            style={styles.timerSection}
          >
            {variant === "playing" && isStarted ? (
              // Live timer for playing state
              <Timer
                isRunning={timerRunning}
                initialTime={initialTime}
                key={`timer-${initialTime}`}
              />
            ) : (
              // Static time display for completed state with reset button
              renderStaticTimer()
            )}
          </Animatable.View>
        )}

        {/* UPDATED: Badges Section - Only show when game is playing */}
        {variant === "playing" && (
          <Animatable.View
            animation="fadeInRight"
            duration={600}
            delay={animationDelay + (showTimer ? 200 : 100)}
            style={styles.badgesSection}
          >
            <DifficultyBadge difficulty={difficulty} />
            <FocusAreaBadge focusArea={focusArea} />
          </Animatable.View>
        )}
      </Animatable.View>

      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="zoomIn"
            duration={300}
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={NAVIGATION_COLORS.indigo}
              style={styles.modalContent}
            >
              {showSuccessMessage ? (
                // Success Message View
                <>
                  <View style={styles.successHeader}>
                    <Text style={styles.successTitle}>
                      {resetMessage.includes("successfully")
                        ? "Success!"
                        : "Error"}
                    </Text>
                  </View>

                  <View style={styles.successBody}>
                    <Text style={styles.successText}>{resetMessage}</Text>
                  </View>

                  <View style={styles.successActions}>
                    <TouchableOpacity
                      style={styles.successButton}
                      onPress={handleSuccessAcknowledge}
                    >
                      <Text style={styles.successButtonText}>Got it!</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Original Reset Confirmation View
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Reset Timer?</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCloseModal}
                      disabled={isResetting}
                    >
                      <X width={20} height={20} color={BASE_COLORS.white} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    {/* UPDATED: Show different messages based on disabled reason */}
                    {shouldDisableReset ? (
                      <Text style={styles.modalText}>
                        {isCorrectAnswer
                          ? "🌟 Great job! You answered correctly, so timer reset is not available. Try the next level or explore other game modes!"
                          : (currentTime || finalTime || 0) === 0
                          ? "⏰ Timer is already at 0:00. No need to reset!"
                          : "💰 Insufficient coins for reset. Earn more coins and try again!"}
                      </Text>
                    ) : (
                      <>
                        <Text style={styles.modalText}>
                          This will reset your timer to 0:00 and clear your
                          progress for this level.
                        </Text>

                        {/* Cost info */}
                        <View style={styles.costInfo}>
                          <View style={styles.costRow}>
                            <Text style={styles.costLabel}>Cost:</Text>
                            <View style={styles.costValue}>
                              <Image
                                source={require("@/assets/images/coin.png")}
                                style={styles.coinImage}
                              />
                              <Text style={styles.costText}>{resetCost}</Text>
                            </View>
                          </View>

                          <View style={styles.costRow}>
                            <Text style={styles.costLabel}>Your Balance:</Text>
                            <View style={styles.costValue}>
                              <Image
                                source={require("@/assets/images/coin.png")}
                                style={styles.coinImage}
                              />
                              <Text style={styles.costText}>{coins}</Text>
                            </View>
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.modalActions}>
                    {!shouldDisableReset ? (
                      <>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={handleCloseModal}
                          disabled={isResetting}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.confirmButton,
                            isResetting && styles.confirmButtonDisabled,
                          ]}
                          onPress={handleConfirmReset}
                          disabled={isResetting}
                        >
                          {isResetting ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.confirmButtonText}>
                              Reset Timer
                            </Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={[styles.confirmButton, { flex: 1 }]}
                        onPress={handleCloseModal}
                      >
                        <Text style={styles.confirmButtonText}>Got it!</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </LinearGradient>
          </Animatable.View>
        </View>
      </Modal>
    </>
  );
};

// Add new styles for the success notification
const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  completedStatsContainer: {
    justifyContent: "space-between",
  },
  timerSection: {
    minWidth: 110,
  },
  staticTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap", // Allow wrapping for the success message
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    minWidth: 90,
    borderRadius: 20,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  staticTimerText: {
    color: BASE_COLORS.white,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginLeft: 6,
  },
  badgesSection: {
    flexDirection: "row",
    gap: 6,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 47, 47, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  resetButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
  resetSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resetStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  resetStatusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#4CAF50",
    marginLeft: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    marginBottom: 12,
  },
  modalText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  costInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  costValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coinImage: {
    width: 16,
    height: 16,
  },
  costText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: iconColors.brightYellow,
  },
  insufficientText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#F44336",
    textAlign: "center",
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flex: 1,
  },
  confirmButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },

  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  successBody: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    textAlign: "center",
  },
  successActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  successButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  successButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },

  resetSuccessIndicator: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 6,
  },

  resetSuccessText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

export default StatsContainer;
