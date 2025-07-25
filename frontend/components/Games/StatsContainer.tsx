import React, { useState, useCallback } from "react";
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
import { RefreshCw, X, CheckCircle } from "react-native-feather";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import { Clock } from "react-native-feather";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import { formatTime } from "@/utils/gameUtils";
import { calculateResetCost } from "@/utils/resetCostUtils";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import { useUserProgress } from "@/hooks/useUserProgress";
import useCoinsStore from "@/store/games/useCoinsStore";

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
}) => {
  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentTime, setCurrentTime] = useState(finalTime || 0);

  // NEW: Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // Get user progress and coins
  const { resetTimer } = useUserProgress(levelId || "");
  const { coins, fetchCoinsBalance } = useCoinsStore();

  // Calculate reset cost for completed state
  const resetCost = React.useMemo(() => {
    if (variant === "completed" && (finalTime || currentTime)) {
      return calculateResetCost(finalTime || currentTime);
    }
    return 50; // Default
  }, [variant, finalTime, currentTime]);

  // Check if user can afford reset
  const canAfford = coins >= resetCost;

  // Handle reset button press
  const handleResetPress = useCallback(() => {
    if (variant === "completed" && levelId) {
      setShowResetModal(true);
      setShowSuccessMessage(false); // Reset success message state
    }
  }, [variant, levelId]);

  // Handle reset confirmation
  const handleConfirmReset = useCallback(async () => {
    if (!levelId || isResetting) return;

    try {
      setIsResetting(true);

      const result = await resetTimer(levelId);

      if (result.success) {
        // Update local time display
        setCurrentTime(0);

        // Refresh coins balance
        fetchCoinsBalance(true);

        // Show success message instead of closing modal immediately
        const coinsDeducted = result.coinsDeducted || resetCost;
        setResetMessage(
          `Timer and progress reset successfully! ${coinsDeducted} coins deducted. You can now play the level with a fresh timer.`
        );
        setShowSuccessMessage(true);

        console.log(`[StatsContainer] Timer reset successfully`);
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
  }, [levelId, resetTimer, fetchCoinsBalance, resetCost]);

  const handleSuccessAcknowledge = useCallback(() => {
    setShowSuccessMessage(false);
    setShowResetModal(false);

    // ONLY call onTimerReset after user acknowledges the success message
    if (onTimerReset && resetMessage.includes("successfully")) {
      // Small delay to ensure modal is closed first
      setTimeout(() => {
        onTimerReset();
      }, 300);
    }
  }, [onTimerReset, resetMessage]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    if (!isResetting && !showSuccessMessage) {
      setShowResetModal(false);
    }
  }, [isResetting, showSuccessMessage]);

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
        {/* Timer Section - Show in both variants but different behavior */}
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
              // Static time display for completed state
              <View style={styles.staticTimerContainer}>
                <Clock width={16} height={16} color={BASE_COLORS.white} />
                <Text style={styles.staticTimerText}>
                  {formatTime(currentTime || finalTime || 0)}
                </Text>
                {variant === "completed" && levelId && (
                  <TouchableOpacity
                    style={[
                      styles.resetButton,
                      !canAfford && styles.resetButtonDisabled,
                    ]}
                    onPress={handleResetPress}
                    disabled={!canAfford}
                    activeOpacity={0.8}
                  >
                    <RefreshCw width={12} height={12} color="#fff" />
                    <Text style={styles.resetButtonText}>{resetCost}🪙</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animatable.View>
        )}

        {/* Badges Section */}
        <Animatable.View
          animation="fadeInRight"
          duration={600}
          delay={animationDelay + (showTimer ? 200 : 100)}
          style={[
            styles.badgesSection,
            variant === "completed" && styles.completedBadgesSection,
          ]}
        >
          <DifficultyBadge difficulty={difficulty} />
          <FocusAreaBadge focusArea={focusArea} />
        </Animatable.View>
      </Animatable.View>

      {/* Reset Confirmation Modal */}
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
              {/* UPDATED: Conditional content based on state */}
              {showSuccessMessage ? (
                // Success Message View
                <>
                  <View style={styles.successHeader}>
                    <View style={styles.successIcon}>
                      <CheckCircle width={24} height={24} color="#4CAF50" />
                    </View>
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
                    <Text style={styles.modalText}>
                      This will reset your timer to 0:00 and clear your progress
                      for this level.
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

                    {!canAfford && (
                      <Text style={styles.insufficientText}>
                        Insufficient coins for reset
                      </Text>
                    )}
                  </View>

                  <View style={styles.modalActions}>
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
                        (!canAfford || isResetting) &&
                          styles.confirmButtonDisabled,
                      ]}
                      onPress={handleConfirmReset}
                      disabled={!canAfford || isResetting}
                    >
                      {isResetting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.confirmButtonText}>
                          {canAfford ? "Reset Timer" : "Can't Reset"}
                        </Text>
                      )}
                    </TouchableOpacity>
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

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedStatsContainer: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timerSection: {
    borderWidth: 1,
    borderRadius: 16,
    minWidth: 110,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  staticTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  staticTimerText: {
    color: BASE_COLORS.white,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginLeft: 6,
  },
  badgesSection: {
    flexDirection: "row",
    gap: 12,
  },
  completedBadgesSection: {
    // Remove justifyContent: center to allow timer to show
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 47, 47, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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

  // NEW: Success message styles
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
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
    fontSize: 14,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  successButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },
});

export default StatsContainer;
